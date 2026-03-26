import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiCpu, FiHash, FiLayers } from "react-icons/fi";
import { getDeviceFeatureList, deleteDeviceFeature, DeviceFeature } from "./devicefeatureapi";
import { getMedicalDeviceList } from "../MedicalDevice/medicaldeviceapi";
import AddDeviceFeature from "./AddDeviceFeature";
import EditDeviceFeature from "./EditDeviceFeature";

const DeviceFeaturePage: React.FC = () => {
  const [features, setFeatures] = useState<DeviceFeature[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeviceFeatureList(1, pageSize);
      setFeatures(data.results);
    } catch (error) {
      toast.error("Failed to load features");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const fetchDevices = useCallback(async () => {
    try {
      const data = await getMedicalDeviceList(1, 100);
      setDevices(data.results);
    } catch (error) {
      console.error("Failed to fetch devices", error);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
    fetchDevices();
  }, [fetchFeatures, fetchDevices]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Terminate this device feature?")) return;
    try {
      await deleteDeviceFeature(id);
      toast.success("Feature purged!");
      fetchFeatures();
    } catch (error) {
      toast.error("Failed to delete feature");
    }
  };

  const getDeviceName = (id: number) => {
    const d = devices.find(dev => dev.id === id);
    return d ? d.name : `ID: ${id}`;
  };

  return (
    <div className="p-8 bg-[#fdfdfd] min-h-screen font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900 leading-none">
              Device <span className="text-blue-600">Features</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Managing high-tech capabilities for Miisky Svasth devices.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 group focus:ring-0"
          >
            <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            Integrate Feature
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-gray-300/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2"><FiCpu /> Target Device</div>
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-x border-gray-50">
                    <div className="flex items-center gap-2"><FiLayers /> Feature Manifest</div>
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2"><FiHash /> Position</div>
                  </th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Features...</td></tr>
                ) : features.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">No active features detected.</td></tr>
                ) : (
                  features.map((feature) => (
                    <tr key={feature.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="text-xs font-black text-blue-600 uppercase tracking-tighter">{getDeviceName(feature.device)}</div>
                      </td>
                      <td className="px-8 py-5 border-x border-gray-50">
                        <div className="font-bold text-gray-900 text-sm tracking-tight">{feature.title}</div>
                        {feature.description && (
                          <div className="text-[10px] text-gray-400 mt-1 font-medium line-clamp-1 max-w-xs">{feature.description}</div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-[10px] font-mono font-bold text-gray-600 uppercase">POS: {feature.position || 0}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => setEditingId(feature.id!)} 
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => handleDelete(feature.id!)} 
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddDeviceFeature 
          devices={devices}
          onSuccess={() => fetchFeatures()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditDeviceFeature 
          featureId={editingId} 
          devices={devices}
          onSuccess={() => fetchFeatures()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default DeviceFeaturePage;
