import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateDeviceFeature, getDeviceFeatureById } from "./devicefeatureapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  featureId: number;
  onSuccess: () => void;
  onClose: () => void;
  devices: any[];
}

const EditDeviceFeature: React.FC<Props> = ({ featureId, onSuccess, onClose, devices }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getDeviceFeatureById(featureId);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load feature data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [featureId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDeviceFeature(featureId, formData);
      toast.success("Device feature updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to update feature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Edit Device Feature</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Loading Details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="device">Medical Device</Label>
              <select
                id="device"
                value={formData.device || ""}
                onChange={(e) =>
                  setFormData({ ...formData, device: parseInt(e.target.value) || undefined })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
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
              <Label htmlFor="title">Feature Title *</Label>
              <Input
                id="title"
                type="text"
                required
                placeholder="e.g. Smart Sensor Sync"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <textarea
                id="description"
                placeholder="Explain the feature utility..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-24 resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="position">Sort Order</Label>
              <Input
                id="position"
                type="number"
                value={formData.position || 1}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-4 border-t mt-6">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : "Update Feature"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditDeviceFeature;
