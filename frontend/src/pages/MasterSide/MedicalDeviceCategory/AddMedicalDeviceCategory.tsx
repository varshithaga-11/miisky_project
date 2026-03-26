import React, { useState } from "react";
import { toast } from "react-toastify";
import { createMedicalDeviceCategory, MedicalDeviceCategory } from "./medicaldevicecategoryapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddMedicalDeviceCategory: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicalDeviceCategory>>({
    name: "",
    description: "",
    icon: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMedicalDeviceCategory(formData as MedicalDeviceCategory);
      toast.success("Industrial category specialized!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl relative border border-gray-100">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight uppercase tracking-widest text-lg">Define Device Sector</h2>
          <p className="text-gray-500 text-xs mt-1 font-bold uppercase tracking-wider">Categorize advanced diagnostic and therapeutic hardware.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Sector Technical Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Radiological Diagnostics"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-gray-700"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Sector Signature (Icon URL/Class)</label>
            <input
              type="text"
              placeholder="Lucide icon name or image link"
              value={formData.icon || ""}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Operational Scope</label>
            <textarea
              placeholder="Define the utility and scope of this category..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Hierarchal Rank</label>
              <input
                type="number"
                value={formData.position || 0}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center focus:ring-2 focus:ring-blue-500/20 outline-none font-bold"
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center cursor-pointer group h-[42px]">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="ml-3 text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Visible</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-black active:scale-[0.98] transition-all shadow-xl"
            >
              {loading ? "Establishing..." : "Save Sector"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-100 text-gray-400 font-bold py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalDeviceCategory;
