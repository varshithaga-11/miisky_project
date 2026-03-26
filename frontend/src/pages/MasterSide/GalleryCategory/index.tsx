import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getGalleryCategoryList, deleteGalleryCategory, GalleryCategory } from "./gallerycategoryapi";
import AddGalleryCategory from "./AddGalleryCategory";
import EditGalleryCategory from "./EditGalleryCategory";

const GalleryCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGalleryCategoryList(1, 100, search);
      setCategories(data.results);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteGalleryCategory(id);
      toast.success("Deleted!");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gallery Categories</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow hover:shadow-lg"
        >
          <FiPlus /> Add Category
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none bg-transparent" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100/50">
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Name</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Position</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">Loading categories...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No categories found matching your search.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-600 border-x border-gray-50">{cat.position}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${cat.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
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

      {isAddModalOpen && (
        <AddGalleryCategory 
          onSuccess={() => fetchCategories()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditGalleryCategory 
          id={editingId} 
          onSuccess={() => fetchCategories()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default GalleryCategoryPage;
