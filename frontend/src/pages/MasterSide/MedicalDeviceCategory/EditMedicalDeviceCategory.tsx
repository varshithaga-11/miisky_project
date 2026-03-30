import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateMedicalDeviceCategory, getMedicalDeviceCategoryById, MedicalDeviceCategory } from "./medicaldevicecategoryapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditMedicalDeviceCategory: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMedicalDeviceCategoryById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (!key.endsWith('_url') && value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      if (iconFile) data.append("icon", iconFile);

      await updateMedicalDeviceCategory(id, data as any);
      toast.success("Sector updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update sector");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Reconfigure Sector</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Sector Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Radiological Diagnostics"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Sector Icon (Binary)</label>
            <div className="flex items-center gap-4 mb-3">
               {formData.icon_url && (
                 <div className="w-16 h-16 rounded border bg-gray-50 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img src={formData.icon_url} alt="current" className="max-w-full max-h-full object-contain" />
                 </div>
               )}
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.icon_url ? "Replace with new asset" : "Choose icon asset"}</div>
            </div>
            <div className="relative group overflow-hidden bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all p-4 text-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-600 font-bold text-xs truncate max-w-full">
                  {iconFile ? iconFile.name : "Select New Icon Asset"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Operational Scope</label>
            <textarea
              placeholder="Define the utility and scope of this category..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Hierarchal Rank</label>
            <input
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center group cursor-pointer inline-flex mt-4">
            <input
              type="checkbox"
              id="edit_med_cat_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
            />
            <label htmlFor="edit_med_cat_active" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Visible</label>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Updating..." : "Update Sector"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicalDeviceCategory;
