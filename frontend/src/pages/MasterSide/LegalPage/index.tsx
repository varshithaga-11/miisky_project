import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getLegalPageList, deleteLegalPage, LegalPage } from "./legalpageapi";
import AddLegalPage from "./AddLegalPage";
import EditLegalPage from "./EditLegalPage";

const LegalPageList: React.FC = () => {
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LegalPage | null>(null);

  const fetchLegalPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLegalPageList(1, 100);
      setLegalPages(data.results);
    } catch (error) {
      toast.error("Failed to load legal pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLegalPages();
  }, [fetchLegalPages]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this legal page?")) return;
    try {
      await deleteLegalPage(id);
      toast.success("Legal page deleted!");
      fetchLegalPages();
    } catch (error) {
      toast.error("Failed to delete legal page");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Legal Pages</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> Add Legal Page
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100/50">
              <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase text-xs">Title</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase text-xs">Type</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase text-xs">Last Updated</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase text-xs">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-600 uppercase text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading your legal documentation...</td>
              </tr>
            ) : legalPages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No legal pages found. Click "Add Legal Page" to create one.</td>
              </tr>
            ) : (
              legalPages.map((page) => (
                <tr key={page.id} className="border-b hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{page.title}</td>
                  <td className="px-6 py-4">
                    <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {page.page_type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{page.last_updated || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${page.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {page.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-80 hover:opacity-100">
                      <button 
                        onClick={() => setEditingPage(page)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-white shadow-sm transition-all"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDelete(page.id!)} 
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-white shadow-sm transition-all"
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

      {isAddModalOpen && (
        <AddLegalPage 
          onSuccess={() => fetchLegalPages()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingPage && (
        <EditLegalPage 
          page={editingPage} 
          onSuccess={() => fetchLegalPages()} 
          onClose={() => setEditingPage(null)} 
        />
      )}
    </div>
  );
};

export default LegalPageList;
