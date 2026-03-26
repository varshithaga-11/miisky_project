import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiImage } from "react-icons/fi";
import { getHeroBannerList, deleteHeroBanner, HeroBanner } from "./herobannerapi";
import AddHeroBanner from "./AddHeroBanner";
import EditHeroBanner from "./EditHeroBanner";

const HeroBannerPage: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHeroBannerList(currentPage, pageSize, search);
      setBanners(data.results);
    } catch (error) {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete banner?")) return;
    try {
      await deleteHeroBanner(id);
      toast.success("Deleted!");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FiImage className="text-blue-600" />
          Hero Banners
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Banner
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search banners..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="flex-1 outline-none bg-transparent" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Preview</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-l border-gray-50">Title / Page</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading banners...</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No banners found.</td></tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      {banner.background_image_url ? (
                        <img src={banner.background_image_url} alt="" className="w-16 h-8 object-cover rounded shadow-sm ring-1 ring-gray-100" />
                      ) : (
                        <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-[10px] text-gray-400 font-bold">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 border-l border-gray-50">
                      <div className="font-semibold text-gray-900">{banner.title || "No Title"}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-tighter">{banner.page}</div>
                    </td>
                    <td className="px-6 py-4 border-x border-gray-50">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${banner.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(banner.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(banner.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
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
        <AddHeroBanner 
          onSuccess={() => fetchBanners()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditHeroBanner 
          id={editingId} 
          onSuccess={() => fetchBanners()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default HeroBannerPage;
