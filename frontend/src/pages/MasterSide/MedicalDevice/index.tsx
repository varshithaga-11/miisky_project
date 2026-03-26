import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiPackage } from "react-icons/fi";
import { getMedicalDeviceList, deleteMedicalDevice, MedicalDevice } from "./medicaldeviceapi";
import { getMedicalDeviceCategoryList } from "../MedicalDeviceCategory/medicaldevicecategoryapi";
import AddMedicalDevice from "./AddMedicalDevice";
import EditMedicalDevice from "./EditMedicalDevice";

const MedicalDevicePage: React.FC = () => {
  const [devices, setDevices] = useState<MedicalDevice[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMedicalDeviceList(currentPage, pageSize, search);
      setDevices(data.results);
    } catch (error) {
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getMedicalDeviceCategoryList(1, 100);
      setCategories(data.results);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchCategories();
  }, [fetchDevices, fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete device?")) return;
    try {
      await deleteMedicalDevice(id);
      toast.success("Deleted!");
      fetchDevices();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FiPackage className="text-blue-600" />
          Medical Devices
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm active:scale-95"
        >
          <FiPlus /> Add Device
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search devices..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="flex-1 outline-none bg-transparent" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Device Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Technology</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading devices...</td></tr>
              ) : devices.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No medical devices found.</td></tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-900">{device.name}</td>
                    <td className="px-6 py-4 text-gray-600 border-x border-gray-50">{device.primary_technology || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${device.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {device.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(device.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(device.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
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
        <AddMedicalDevice 
          categories={categories}
          onSuccess={() => fetchDevices()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditMedicalDevice 
          id={editingId} 
          categories={categories}
          onSuccess={() => fetchDevices()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default MedicalDevicePage;
