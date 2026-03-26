import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getGalleryItemList, deleteGalleryItem, GalleryItem } from "./galleryitemapi";
import { getGalleryCategoryList } from "../GalleryCategory/gallerycategoryapi";
import AddGalleryItem from "./AddGalleryItem";
import EditGalleryItem from "./EditGalleryItem";

const GalleryItemPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGalleryItemList(1, 100, search);
      setItems(data.results);
    } catch (error) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getGalleryCategoryList(1, 100);
      setCategories(data.results);
    } catch (error) {
      console.error("Failed to fetch gallery categories", error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteGalleryItem(id);
      toast.success("Deleted!");
      fetchItems();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gallery Items</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow hover:shadow-md"
        >
          <FiPlus /> Add Item
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none bg-transparent" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100/50">
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Preview</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-l border-gray-50">Title</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading items...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">No results found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded shadow-sm" />
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 border-l border-gray-50">{item.title}</td>
                  <td className="px-6 py-4 border-x border-gray-50">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${item.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingId(item.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(item.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddGalleryItem 
          categories={categories}
          onSuccess={() => fetchItems()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditGalleryItem 
          id={editingId} 
          categories={categories}
          onSuccess={() => fetchItems()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default GalleryItemPage;
