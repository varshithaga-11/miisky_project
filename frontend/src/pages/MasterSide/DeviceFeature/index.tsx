import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
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
    if (!window.confirm("Delete feature?")) return;
    try {
      await deleteDeviceFeature(id);
      toast.success("Deleted!");
      fetchFeatures();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Device Features</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm"
        >
          <FiPlus /> Add Feature
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Feature</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Device ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Position</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading features...</td></tr>
              ) : features.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">No features found.</td></tr>
              ) : (
                features.map((feature) => (
                  <tr key={feature.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-900">{feature.feature}</td>
                    <td className="px-6 py-4 text-gray-600 border-x border-gray-50">{feature.device}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{feature.position || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(feature.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(feature.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
          id={editingId} 
          devices={devices}
          onSuccess={() => fetchFeatures()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default DeviceFeaturePage;
