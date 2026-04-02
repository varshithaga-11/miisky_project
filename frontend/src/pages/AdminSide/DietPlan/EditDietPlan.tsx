import React, { useState, useEffect } from "react";
import { 
    updateDietPlan, getDietPlanById, 
    createDietPlanFeature, updateDietPlanFeature, deleteDietPlanFeature 
} from "../../../utils/api";
import { DietPlan, DietPlanFeature } from "./dietplanapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from 'react-toastify';

interface EditDietPlanProps {
  id: number;
  onClose: () => void;
  onUpdate: () => void;
}

const EditDietPlan: React.FC<EditDietPlanProps> = ({ id, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<DietPlan>>({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Feature states
  const [newFeatureText, setNewFeatureText] = useState("");
  const [addFeatureLoading, setAddFeatureLoading] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const resp = await getDietPlanById(id);
      setFormData(resp.data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({ 
          ...prev, 
          [id]: id === 'no_of_days' ? parseInt(value) : value 
      }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const nRaw = String(formData.nutritionist_share_percent ?? "").trim();
    const kRaw = String(formData.kitchen_share_percent ?? "").trim();
    const anySet = nRaw || kRaw;
    if (anySet) {
      const n = parseFloat(nRaw);
      const k = parseFloat(kRaw);
      if ([n, k].some((x) => Number.isNaN(x))) {
        toast.warning("Fill both payment split percentages (Nutritionist and Kitchen) or clear both to use defaults.");
        return;
      }
      if (n + k > 100) {
        toast.warning("Nutritionist and Kitchen share cannot exceed 100%.");
        return;
      }
    }
    setSaveLoading(true);
    try {
      const { features, final_amount, ...cleanData } = formData as any;
      if (anySet) {
        const n = parseFloat(nRaw);
        const k = parseFloat(kRaw);
        cleanData.platform_fee_percent = 100 - n - k;
        cleanData.nutritionist_share_percent = n;
        cleanData.kitchen_share_percent = k;
      } else {
        cleanData.platform_fee_percent = null;
        cleanData.nutritionist_share_percent = null;
        cleanData.kitchen_share_percent = null;
      }
      await updateDietPlan(id, cleanData);
      toast.success("Diet plan updated successfully!");
      onUpdate();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setSaveLoading(false);
    }
  };

  // Feature Handlers
  const handleAddFeature = async () => {
      if (!newFeatureText.trim()) return;
      setAddFeatureLoading(true);
      try {
          const nextOrder = (formData.features?.length || 0) + 1;
          const resp = await createDietPlanFeature({
              diet_plan: id,
              feature: newFeatureText,
              order: nextOrder
          });
          setFormData(prev => ({
              ...prev,
              features: [...(prev.features || []), resp.data]
          }));
          setNewFeatureText("");
          toast.success("Feature added");
      } catch (err) {
          toast.error("Failed to add feature");
      } finally {
          setAddFeatureLoading(false);
      }
  };

  const handleDeleteFeature = async (featureId: number) => {
      if (!window.confirm("Delete this feature?")) return;
      try {
          await deleteDietPlanFeature(featureId);
          setFormData(prev => ({
              ...prev,
              features: prev.features?.filter(f => f.id !== featureId)
          }));
          toast.success("Feature removed");
      } catch {
          toast.error("Failed to remove");
      }
  };

  const handleUpdateFeature = async (feature: DietPlanFeature, newText: string) => {
      try {
          await updateDietPlanFeature(feature.id!, { ...feature, feature: newText });
          toast.success("Feature updated");
          fetchPlan();
      } catch {
          toast.error("Update failed");
      }
  };

  const handleUpdateFeatureOrder = async (feature: DietPlanFeature, newOrder: string) => {
      const order = parseInt(newOrder);
      if (isNaN(order)) return;
      try {
          await updateDietPlanFeature(feature.id!, { ...feature, order });
          toast.success("Order updated");
          fetchPlan();
      } catch {
          toast.error("Order update failed");
      }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-2">
          Edit Diet Plan & Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Plan Details */}
            <form onSubmit={handleUpdate} className="space-y-4 border-r pr-8 dark:border-gray-700">
                <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider">Plan Details</h3>
                <div>
                    <Label htmlFor="title">Title*</Label>
                    <Input id="title" type="text" value={formData.title || ""} onChange={handlePlanChange} required />
                </div>
                <div>
                    <Label htmlFor="code">Code (Optional)</Label>
                    <Input id="code" type="text" value={formData.code || ""} onChange={handlePlanChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="amount">Base Amount (₹)</Label>
                        <Input id="amount" type="number" value={formData.amount || ""} onChange={handlePlanChange} required />
                    </div>
                    <div>
                        <Label htmlFor="discount_amount">Discount (₹)</Label>
                        <Input id="discount_amount" type="number" value={formData.discount_amount || ""} onChange={handlePlanChange} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="no_of_days">Duration (Days)</Label>
                    <Input id="no_of_days" type="number" value={formData.no_of_days || ""} onChange={handlePlanChange} />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-2 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Payment split override (optional)
                  </p>
                  <p className="text-xs text-gray-500">
                    Leave blank for 15% nutritionist & 60% kitchen share. If set, total must not exceed 100%.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nutritionist_share_percent">Nutritionist %</Label>
                      <Input
                        id="nutritionist_share_percent"
                        type="number"
                        step="0.01"
                        value={formData.nutritionist_share_percent ?? ""}
                        onChange={handlePlanChange}
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
                        onChange={handlePlanChange}
                        placeholder="—"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-2">
                    <Button type="submit" disabled={saveLoading} className="w-full">
                        {saveLoading ? "Saving..." : "Update Plan"}
                    </Button>
                </div>
            </form>

            {/* Right Column: Features */}
            <div className="space-y-4">
                <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider">Plan Features</h3>
                
                <div className="flex gap-2">
                    <Input 
                        placeholder="Add new feature..." 
                        value={newFeatureText} 
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                    />
                    <Button onClick={handleAddFeature} disabled={addFeatureLoading} size="sm">
                        <FiPlus />
                    </Button>
                </div>

                <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex text-[10px] font-bold text-gray-400 uppercase mb-1 px-2">
                        <span className="w-12">Order</span>
                        <span className="flex-1">Feature Description</span>
                    </div>
                    {formData.features?.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No features added yet</p>
                    ) : (
                        formData.features?.map((f) => (
                            <div key={f.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg group">
                                <input 
                                    type="number"
                                    className="w-12 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-1 py-0.5 text-xs text-center focus:ring-1 focus:ring-primary-500" 
                                    defaultValue={f.order}
                                    onBlur={(e) => e.target.value !== String(f.order) && handleUpdateFeatureOrder(f, e.target.value)}
                                />
                                <input 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm dark:text-gray-200" 
                                    defaultValue={f.feature}
                                    onBlur={(e) => e.target.value !== f.feature && handleUpdateFeature(f, e.target.value)}
                                />
                                <button 
                                    onClick={() => handleDeleteFeature(f.id!)}
                                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditDietPlan;
