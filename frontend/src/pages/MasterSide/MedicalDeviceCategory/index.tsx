import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getMedicalDeviceCategoryList, deleteMedicalDeviceCategory, MedicalDeviceCategory } from "./medicaldevicecategoryapi";
import AddMedicalDeviceCategory from "./AddMedicalDeviceCategory";
import EditMedicalDeviceCategory from "./EditMedicalDeviceCategory";

const MedicalDeviceCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<MedicalDeviceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMedicalDeviceCategoryList(currentPage, pageSize, search);
      setCategories(data.results);
      setTotalItems(data.count);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await deleteMedicalDeviceCategory(id);
      toast.success("Deleted!");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Medical Device Categories</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Category
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search categories..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="flex-1 outline-none bg-transparent" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Position</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No categories found.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 text-gray-600 border-x border-gray-50">{cat.position}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cat.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(cat.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(cat.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900">{categories.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="text-gray-900">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span> entries
          </p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all text-sm font-semibold"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)} 
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    currentPage === page 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                      : "text-gray-500 hover:bg-white hover:text-blue-600 border border-transparent hover:border-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all text-sm font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddMedicalDeviceCategory 
          onSuccess={() => fetchCategories()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditMedicalDeviceCategory 
          id={editingId} 
          onSuccess={() => fetchCategories()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default MedicalDeviceCategoryPage;
