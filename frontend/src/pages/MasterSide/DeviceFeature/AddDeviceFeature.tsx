import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { createDeviceFeature } from "./devicefeatureapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  devices: any[];
}

interface FeatureEntry {
  title: string;
  description: string;
  position: number;
}

const AddDeviceFeature: React.FC<Props> = ({ onSuccess, onClose, devices }) => {
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<number | undefined>();
  const [features, setFeatures] = useState<FeatureEntry[]>([
    { title: "", description: "", position: 1 }
  ]);

  const handleAddEntry = () => {
    const nextPos = features.length > 0 
      ? Math.max(...features.map(f => f.position)) + 1 
      : 1;
    setFeatures([...features, { title: "", description: "", position: nextPos }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    } else {
      toast.warn("At least one feature is required");
    }
  };

  const updateEntry = (index: number, field: keyof FeatureEntry, value: string | number) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) {
      toast.error("Please select a target device first");
      return;
    }

    const invalid = features.some(f => !f.title.trim());
    if (invalid) {
      toast.error("All features must have a title");
      return;
    }

    setLoading(true);
    let successCount = 0;
    try {
      for (const feature of features) {
        await createDeviceFeature({
          device: deviceId,
          ...feature
        });
        successCount++;
      }
      toast.success(`Broadcasting successful! ${successCount} features manifested.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Partial success: ${successCount} added. Error on entry ${successCount + 1}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">Bulk Add Features</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <Label htmlFor="device">Target Medical Device *</Label>
            <select
              id="device"
              required
              value={deviceId || ""}
              onChange={(e) => setDeviceId(parseInt(e.target.value) || undefined)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              disabled={loading}
            >
              <option value="">Choose Device...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Features List</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddEntry} disabled={loading}>
                <FiPlus className="mr-1" /> Add Entry
              </Button>
            </div>

            {features.map((feature, index) => (
              <div key={index} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Feature #{index + 1}</span>
                   <button 
                    type="button" 
                    onClick={() => handleRemoveEntry(index)}
                    disabled={features.length === 1 || loading}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-0 transition-colors"
                   >
                     <FiTrash2 size={16} />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <Label>Title *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. AI-Driven Analysis"
                      value={feature.title}
                      onChange={(e) => updateEntry(index, "title", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      min="1"
                      value={feature.position}
                      onChange={(e) => updateEntry(index, "position", parseInt(e.target.value) || 0)}
                      disabled={loading}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label>Description</Label>
                    <textarea
                      placeholder="Define the technical utility..."
                      value={feature.description}
                      onChange={(e) => updateEntry(index, "description", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white h-20 resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Syncing..." : `Deploy ${features.length} Features`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceFeature;
