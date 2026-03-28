import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updatePricingPlan, getPricingPlanById, PricingPlan } from "./pricingplanapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditPricingPlan: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<PricingPlan>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getPricingPlanById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to access plan parameters");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePricingPlan(id, formData);
      toast.success("Monetization matrix recalibrated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Process modification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left text-xs">
      <div className="bg-white rounded-2xl p-8 w-full max-lg max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center font-sans tracking-tight">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Recalibrate Subscription</h2>
        </div>

        {fetching ? (
          <div className="py-20 text-center font-black animate-pulse text-blue-600 uppercase tracking-widest font-sans italic">Synchronizing Plan Data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none font-sans italic">Plan Title</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold italic"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none font-sans italic">Category</label>
                <select
                  value={formData.plan_category || ""}
                  onChange={(e) => setFormData({ ...formData, plan_category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-[10px] font-black uppercase font-sans italic"
                >
                  <option value="standard">Stationary Tier</option>
                  <option value="premium">Elite Matrix</option>
                  <option value="enterprise">Corporate Grid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 italic font-sans italic">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none font-sans italic">Price (Monthly)</label>
                <input
                  type="number"
                  required
                  value={formData.price_monthly || 0}
                  onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold font-mono italic"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none font-sans italic">Price (Yearly)</label>
                <input
                  type="number"
                  value={formData.price_yearly || 0}
                  onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold font-mono italic"
                />
              </div>
            </div>

            <div className="font-sans italic">
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none font-sans italic">Plan Features (comma separated list)</label>
              <textarea
                required
                value={(formData.features || []).join(", ")}
                onChange={(e) => setFormData({ ...formData, features: e.target.value.split(",").map(i => i.trim()).filter(i => i) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-[10px] h-24 resize-none italic"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 font-sans italic shadow-sm">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none font-sans italic">Button Manifest</label>
                  <input
                    type="text"
                    value={formData.button_text || ""}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs shadow-sm font-sans italic"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none font-sans italic">Grid Position</label>
                  <input
                    type="number"
                    value={formData.position || 0}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs italic font-sans italic"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <label className="flex items-center group cursor-pointer inline-flex font-sans italic">
                <input
                  type="checkbox"
                  checked={formData.is_featured || false}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer font-sans italic"
                />
                <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors font-sans italic">High Priority (Featured)</span>
              </label>
              <label className="flex items-center group cursor-pointer inline-flex font-sans italic">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer font-sans italic"
                />
                <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors font-sans italic">Visible for Procurement</span>
              </label>
            </div>

            <div className="flex gap-4 pt-6 border-t mt-4 font-sans italic shadow-sm">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all focus:ring-0 font-sans italic"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] px-8 py-4 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 font-sans italic"
              >
                {loading ? "Materializing..." : "Update Tier"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditPricingPlan;
