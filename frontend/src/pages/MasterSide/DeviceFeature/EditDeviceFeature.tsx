import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateDeviceFeature, getDeviceFeatureById, DeviceFeature } from "./devicefeatureapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  devices: any[];
}

const EditDeviceFeature: React.FC<Props> = ({ id, onSuccess, onClose, devices }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<DeviceFeature>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getDeviceFeatureById(id);
        setFormData({
            device: data.device,
            feature: data.feature,
            position: data.position
        });
      } catch (error) {
        toast.error("Failed to load data");
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
      await updateDeviceFeature(id, formData);
      toast.success("Updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Edit Device Feature</h2>
        
        {fetching ? (
          <div className="py-10 text-center text-gray-500 font-medium">Loading data...</div>
        ) : (
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
                value={formData.feature || ""}
                onChange={(e) =>
                  setFormData({ ...formData, feature: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Multi-sensor tracking"
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-md mt-2"
              >
                {loading ? "Saving..." : "Update Feature"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 active:scale-95 transition-all mt-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditDeviceFeature;
