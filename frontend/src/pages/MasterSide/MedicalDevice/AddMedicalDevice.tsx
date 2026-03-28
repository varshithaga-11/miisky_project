import React, { useState } from "react";
import { toast } from "react-toastify";
import { createMedicalDevice, MedicalDevice } from "./medicaldeviceapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const AddMedicalDevice: React.FC<Props> = ({ onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicalDevice>>({
    name: "",
    description: "",
    long_description: "",
    short_description: "",
    category: undefined,
    primary_technology: "",
    connectivity: "",
    position: 0,
    price: undefined,
    is_active: true,
    is_featured: false,
    is_available: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMedicalDevice(formData as MedicalDevice);
      toast.success("Device added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">New Device</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Device Name</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. SVASTH Vitals Monitor"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category</label>
            <select
              required
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Price (USD)</label>
            <input
              type="number"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Short Description</label>
            <textarea
              value={formData.short_description || ""}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={2}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Technology</label>
            <input
              type="text"
              value={formData.primary_technology || ""}
              onChange={(e) => setFormData({ ...formData, primary_technology: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Biosensors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Connectivity</label>
            <input
              type="text"
              value={formData.connectivity || ""}
              onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Bluetooth, Wi-Fi"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Position</label>
            <input
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-4 mt-4">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured || false}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Featured Device</span>
            </label>

            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Active Status</span>
            </label>

            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available || false}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Available to Order</span>
            </label>
          </div>

          <div className="md:col-span-2 flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Creating..." : "Add Device"}
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

export default AddMedicalDevice;
