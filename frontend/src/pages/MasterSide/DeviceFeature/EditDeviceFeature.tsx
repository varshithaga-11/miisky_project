import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateDeviceFeature, getDeviceFeatureById, DeviceFeature } from "./devicefeatureapi";

interface Props {
  featureId: number;
  onSuccess: () => void;
  onClose: () => void;
  devices: any[];
}

const EditDeviceFeature: React.FC<Props> = ({ featureId, onSuccess, onClose, devices }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DeviceFeature>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDeviceFeatureById(featureId);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load feature data");
      }
    };
    fetchData();
  }, [featureId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDeviceFeature(featureId, formData);
      toast.success("Feature recalibrated!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error("Failed to update feature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Recalibrate Feature</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Adjusting current device capabilities.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Medical Device</label>
            <select
              value={formData.device || ""}
              onChange={(e) =>
                setFormData({ ...formData, device: parseInt(e.target.value) || undefined })
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold uppercase"
            >
              <option value="">Select Device</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Feature Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Sensor Sync"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Detailed Description</label>
            <textarea
              placeholder="Explain the feature utility..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Sort Order</label>
              <input
                type="number"
                value={formData.position || 1}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-mono"
              />
            </div>
            <div className="flex gap-2">
              {/* Optional UI elements can go here */}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all focus:ring-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Recalibrating..." : "Commit Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeviceFeature;
