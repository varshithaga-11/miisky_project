import React, { useState } from "react";
import { toast } from "react-toastify";
import { createDeviceFeature, DeviceFeature } from "./devicefeatureapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  devices: any[];
}

const AddDeviceFeature: React.FC<Props> = ({ onSuccess, onClose, devices }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DeviceFeature>>({
    device: undefined,
    feature: "",
    position: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.device) {
        toast.error("Please select a medical device");
        return;
      }
      await createDeviceFeature(formData as DeviceFeature);
      toast.success("Feature added!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add feature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Add Device Feature</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Medical Device</label>
            <select
              required
              value={formData.device || ""}
              onChange={(e) =>
                setFormData({ ...formData, device: parseInt(e.target.value) || undefined })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Device</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Feature Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Multi-sensor tracking"
              value={formData.feature || ""}
              onChange={(e) =>
                setFormData({ ...formData, feature: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Position</label>
            <input
              type="number"
              value={formData.position || 0}
              onChange={(e) =>
                setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-md"
            >
              {loading ? "Adding..." : "Add Feature"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceFeature;
