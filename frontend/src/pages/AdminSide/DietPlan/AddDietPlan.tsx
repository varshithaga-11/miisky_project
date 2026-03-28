import React, { useState } from "react";
import { createDietPlan, createDietPlanFeature, DietPlan } from "./dietplanapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from 'react-toastify';

interface AddDietPlanProps {
  onClose: () => void;
  onAdd: (newPlan: DietPlan) => void;
}

interface FeatureItem {
    feature: string;
    order: number;
}

const AddDietPlan: React.FC<AddDietPlanProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<DietPlan>>({
    title: "",
    code: "",
    amount: "",
    discount_amount: "0",
    no_of_days: 30,
    is_active: true,
    platform_fee_percent: "",
    nutritionist_share_percent: "",
    kitchen_share_percent: "",
  });
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({ 
          ...prev, 
          [id]: id === 'no_of_days' ? parseInt(value) : value 
      }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, { feature: newFeature.trim(), order: features.length + 1 }]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    // Auto-reorder remaining
    setFeatures(updated.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const updateFeatureOrder = (index: number, newOrder: string) => {
      const order = parseInt(newOrder);
      if (isNaN(order)) return;
      const updated = [...features];
      updated[index].order = order;
      setFeatures(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
        toast.warning("Please fill required fields (Title and Amount)");
        return;
    }
    const pRaw = String(formData.platform_fee_percent ?? "").trim();
    const nRaw = String(formData.nutritionist_share_percent ?? "").trim();
    const kRaw = String(formData.kitchen_share_percent ?? "").trim();
    const anySet = pRaw || nRaw || kRaw;
    if (anySet) {
      const p = parseFloat(pRaw);
      const n = parseFloat(nRaw);
      const k = parseFloat(kRaw);
      if ([p, n, k].some((x) => Number.isNaN(x))) {
        toast.warning("Fill all three payment split percentages or leave all blank for platform defaults.");
        return;
      }
      if (Math.abs(p + n + k - 100) > 0.001) {
        toast.warning("Payment split percentages must sum to 100.");
        return;
      }
    }
    setLoading(true);
    try {
      const { platform_fee_percent, nutritionist_share_percent, kitchen_share_percent, ...rest } = formData;
      const payload: Record<string, unknown> = { ...rest };
      if (anySet) {
        payload.platform_fee_percent = parseFloat(pRaw);
        payload.nutritionist_share_percent = parseFloat(nRaw);
        payload.kitchen_share_percent = parseFloat(kRaw);
      }
      const planResp = await createDietPlan(payload as Partial<DietPlan>);
      
      // Add features if any
      if (features.length > 0) {
        // Sort features by their designated order before creating
        const sortedFeatures = [...features].sort((a, b) => a.order - b.order);
        await Promise.all(sortedFeatures.map((f) => 
          createDietPlanFeature({
            diet_plan: planResp.id,
            feature: f.feature,
            order: f.order
          })
        ));
      }

      toast.success("Diet Plan created successfully!");
      onAdd(planResp);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create diet plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-2">
          Add New Diet Plan
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 border-r pr-8 dark:border-gray-700">
            <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider">Plan Details</h3>
            <div>
              <Label htmlFor="title">Plan Title*</Label>
              <Input id="title" type="text" value={formData.title} onChange={handleChange} required placeholder="e.g. Weight Loss Platinum" />
            </div>

            <div>
              <Label htmlFor="code">Plan Code (Optional)</Label>
              <Input id="code" type="text" value={formData.code} onChange={handleChange} placeholder="e.g. WL-PLAT" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="amount">Amount (₹)*</Label>
                  <Input id="amount" type="number" value={formData.amount} onChange={handleChange} required />
              </div>
              <div>
                  <Label htmlFor="discount_amount">Discount (₹)</Label>
                  <Input id="discount_amount" type="number" value={formData.discount_amount} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="no_of_days">Duration (Days)</Label>
              <Input id="no_of_days" type="number" value={formData.no_of_days} onChange={handleChange} />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Payment split override (optional)
              </p>
              <p className="text-xs text-gray-500">Leave blank for platform defaults. If set, all three must total 100%.</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="platform_fee_percent">Platform %</Label>
                  <Input
                    id="platform_fee_percent"
                    type="number"
                    step="0.01"
                    value={formData.platform_fee_percent ?? ""}
                    onChange={handleChange}
                    placeholder="—"
                  />
                </div>
                <div>
                  <Label htmlFor="nutritionist_share_percent">Nutritionist %</Label>
                  <Input
                    id="nutritionist_share_percent"
                    type="number"
                    step="0.01"
                    value={formData.nutritionist_share_percent ?? ""}
                    onChange={handleChange}
                    placeholder="—"
                  />
                </div>
                <div>
                  <Label htmlFor="kitchen_share_percent">Kitchen %</Label>
                  <Input
                    id="kitchen_share_percent"
                    type="number"
                    step="0.01"
                    value={formData.kitchen_share_percent ?? ""}
                    onChange={handleChange}
                    placeholder="—"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider">Features & Order</h3>
            <div className="flex gap-2">
              <Input 
                placeholder="New feature..." 
                value={newFeature} 
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} size="sm" className="shrink-0 text-xl font-bold">
                <FiPlus />
              </Button>
            </div>

            <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex text-[10px] font-bold text-gray-400 uppercase mb-1 px-2">
                  <span className="w-12">Order</span>
                  <span className="flex-1">Description</span>
              </div>
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg group text-sm">
                  <input 
                    type="number"
                    className="w-10 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-1 py-0.5 text-xs text-center" 
                    value={f.order}
                    onChange={(e) => updateFeatureOrder(i, e.target.value)}
                  />
                  <span className="flex-1 dark:text-gray-200">{f.feature}</span>
                  <button 
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              {features.length === 0 && (
                <p className="text-xs text-gray-400 italic">No features added yet</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-4 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDietPlan;
