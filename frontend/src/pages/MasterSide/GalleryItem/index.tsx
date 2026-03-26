import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiImage, FiGrid } from "react-icons/fi";
import { getGalleryItemList, deleteGalleryItem, GalleryItem } from "./galleryitemapi";
import { getGalleryCategoryList } from "../GalleryCategory/gallerycategoryapi";
import AddGalleryItem from "./AddGalleryItem";
import EditGalleryItem from "./EditGalleryItem";

const GalleryItemPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getGalleryItemList(1, 100, search);
      setItems(data.results);
    } catch (error) {
      toast.error("Failed to load gallery assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getGalleryCategoryList(1, 100);
      setCategories(data.results);
    } catch (error) {
      console.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Permanently delete this visual asset?")) return;
    try {
      await deleteGalleryItem(id);
      toast.success("Asset purged!");
      fetchItems();
    } catch (error) {
      toast.error("Purge failed");
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900 leading-none">
              Visual <span className="text-blue-600">Assets</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3 leading-none">Managing the digital imagery of the Miisky Svasth ecosystem.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20 group"
          >
            <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            Bulk Ingest
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-gray-300/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Preview</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-x border-gray-50">Identity manifest</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Matrix Status</th>
                  <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center animate-pulse">
                        <FiGrid size={48} className="text-gray-100 mb-4" />
                        <p className="text-gray-300 font-black uppercase tracking-widest text-[10px]">Syncing Asset Matrix...</p>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <FiImage size={64} className="text-gray-200 mb-6" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No visual assets detected in this sector</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="group hover:bg-blue-50/10 transition-colors">
                      <td className="px-8 py-5">
                        <div className="relative w-20 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm transition-transform group-hover:scale-105">
                           <img 
                            src={(item.image_url || item.image) as string} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                           />
                        </div>
                      </td>
                      <td className="px-8 py-5 border-x border-gray-50">
                        <div className="font-black text-gray-900 group-hover:text-blue-700 transition-colors tracking-tight text-sm uppercase leading-tight">{item.title}</div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                           {categories.find(c => c.id === item.category)?.name || "External Link"}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest border ${
                          item.is_active ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
                          {item.is_active ? "MANIFEST_VISIBLE" : "STASIS_MODE"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => setEditingId(item.id!)} 
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id!)} 
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiTrash2 size={16} />
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
