import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiBox, FiList, FiArrowRight } from "react-icons/fi";
import { createDeviceFeature } from "./devicefeatureapi";

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
      console.error(error.response?.data);
      toast.error(`Partial success: ${successCount} added. Error on ${features[successCount]?.title || 'next entry'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 font-sans text-left overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-2xl my-auto shadow-2xl relative border border-white/10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-white/[0.05] flex justify-between items-center bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 rounded-t-[2rem]">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
              <FiBox className="text-blue-600" /> Bulk Feature Sync
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 ml-9">Register multiple capabilities at once</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
             <FiTrash2 size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
            
            {/* Device Selection */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
               <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-[0.2em]">Target Implementation Hardware</label>
               <select
                 required
                 value={deviceId || ""}
                 onChange={(e) => setDeviceId(parseInt(e.target.value) || undefined)}
                 className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 dark:text-white"
               >
                 <option value="">Choose Medical Device...</option>
                 {devices.map((device) => (
                   <option key={device.id} value={device.id}>
                     {device.name}
                   </option>
                 ))}
               </select>
            </div>

            {/* Feature Entries */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FiList /> Feature Stack
                </h3>
                <button 
                  type="button" 
                  onClick={handleAddEntry}
                  className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-full uppercase tracking-tighter hover:bg-blue-700 transition-all flex items-center gap-1 shadow-lg shadow-blue-500/20"
                >
                  <FiPlus /> Add Entry
                </button>
              </div>

              {features.map((feature, index) => (
                <div key={index} className="group relative bg-white dark:bg-transparent border border-gray-100 dark:border-white/[0.05] p-5 rounded-2xl hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
                  <div className="absolute -left-3 top-5 bg-gray-900 dark:bg-blue-600 text-white w-6 h-6 rounded-lg text-[10px] flex items-center justify-center font-black shadow-lg">
                    {index + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Feature Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AI-Driven Diagnosis"
                        value={feature.title}
                        onChange={(e) => updateEntry(index, "title", e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none rounded-xl px-4 py-2 text-sm font-bold focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Order</label>
                      <input
                        type="number"
                        min="1"
                        value={feature.position}
                        onChange={(e) => updateEntry(index, "position", parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none rounded-xl px-4 py-2 text-sm font-mono focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="flex items-end justify-end">
                       <button 
                        type="button"
                        onClick={() => handleRemoveEntry(index)}
                        disabled={features.length === 1}
                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-0"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    <div className="md:col-span-4 space-y-1.5 pt-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Capability Description</label>
                       <textarea
                        placeholder="Define the technical utility..."
                        value={feature.description}
                        onChange={(e) => updateEntry(index, "description", e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none rounded-xl px-4 py-2 text-xs h-16 resize-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-gray-800/20 rounded-b-[2rem] flex gap-4">
             <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all active:scale-95"
            >
              Cancel Operation
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl disabled:opacity-50 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading Stack...
                </div>
              ) : (
                <>Deploy {features.length} Features <FiArrowRight /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceFeature;
