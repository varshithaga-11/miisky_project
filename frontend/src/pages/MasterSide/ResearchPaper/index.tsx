import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiFileText } from "react-icons/fi";
import { getResearchPaperList, deleteResearchPaper, ResearchPaper } from "./researchpapeapi";
import AddResearchPaper from "./AddResearchPaper";
import EditResearchPaper from "./EditResearchPaper";

const ResearchPaperPage: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getResearchPaperList(currentPage, pageSize, search);
      setPapers(data.results);
    } catch (error) {
      toast.error("Failed to load research papers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete paper?")) return;
    try {
      await deleteResearchPaper(id);
      toast.success("Deleted!");
      fetchPapers();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FiFileText className="text-blue-600" />
          Research Papers
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Paper
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search papers..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="flex-1 outline-none bg-transparent" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Paper Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Author(s)</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-r border-gray-50">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading papers...</td></tr>
              ) : papers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">No papers found.</td></tr>
              ) : (
                papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 truncate max-w-md">{paper.title}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{paper.published_date || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 border-x border-gray-50 text-sm">
                      {paper.authors || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-50">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${paper.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {paper.is_active ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(paper.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(paper.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
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
        <AddResearchPaper 
          onSuccess={() => fetchPapers()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditResearchPaper 
          id={editingId} 
          onSuccess={() => fetchPapers()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default ResearchPaperPage;
