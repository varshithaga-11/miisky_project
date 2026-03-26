import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiFileText, FiLink } from "react-icons/fi";
import { getPatentList, deletePatent, Patent } from "./patentapi";
import AddPatent from "./AddPatent";
import EditPatent from "./EditPatent";

const PatentList: React.FC = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatent, setEditingPatent] = useState<Patent | null>(null);

  const fetchPatents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatentList(1, 100, search);
      setPatents(data.results);
    } catch (error) {
      toast.error("Failed to load patents");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatents();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPatents]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patent?")) return;
    try {
      await deletePatent(id);
      toast.success("Patent deleted!");
      fetchPatents();
    } catch (error) {
      toast.error("Failed to delete patent");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Intellectual Property</h1>
          <p className="text-gray-500 mt-1">Manage core patents and technical innovations.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
        >
          <FiPlus /> New Patent
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
        <div className="p-5 border-b flex items-center gap-3">
          <FiSearch className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by title, number or inventors..." 
            className="flex-1 outline-none text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Patent Info</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status & Date</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Device / Tech</th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Docs</th>
              <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Retrieving IP records...</td></tr>
            ) : patents.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No patent records found.</td></tr>
            ) : (
              patents.map((p) => (
                <tr key={p.id} className="border-b hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-blue-900 line-clamp-1">{p.title}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{p.patent_number || p.application_number || "No Ref #"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      p.status === 'granted' ? 'bg-green-100 text-green-700' : 
                      p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{p.filing_date || "No date"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {p.device_name || p.technology_area || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 text-gray-400">
                      {p.patent_document && <a href={p.patent_document as any} target="_blank" className="hover:text-blue-600"><FiFileText /></a>}
                      {p.external_link && <a href={p.external_link} target="_blank" className="hover:text-blue-600"><FiLink /></a>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-lg">
                      <button onClick={() => setEditingPatent(p)} className="text-blue-900 hover:scale-110 transition-transform"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(p.id!)} className="text-red-400 hover:text-red-700 hover:scale-110 transition-transform"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && <AddPatent onSuccess={() => fetchPatents()} onClose={() => setIsAddModalOpen(false)} />}
      {editingPatent && <EditPatent patent={editingPatent} onSuccess={() => fetchPatents()} onClose={() => setEditingPatent(null)} />}
    </div>
  );
};

export default PatentList;
