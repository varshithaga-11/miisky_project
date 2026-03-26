import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getAboutSectionList, deleteAboutSection, CompanyAboutSection } from "./companyaboutsectionapi";
import AddAboutSection from "./AddAboutSection";
import EditAboutSection from "./EditAboutSection";

const CompanyAboutSectionList: React.FC = () => {
  const [sections, setSections] = useState<CompanyAboutSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CompanyAboutSection | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAboutSectionList(1, 100);
      setSections(data.results);
    } catch (error) {
      toast.error("Failed to load about sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await deleteAboutSection(id);
      toast.success("Section deleted!");
      fetchSections();
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Company About Sections</h1>
          <p className="text-gray-500 mt-1">Manage the narrative and key statements about Miisky.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <FiPlus /> Add New Section
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border focus-within:ring-2 ring-indigo-100 transition-all">
            <FiSearch className="text-gray-400" />
            <input type="text" placeholder="Filter sections..." className="outline-none bg-transparent" />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {sections.length} Sections Found
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100/50">
              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">Title & Subtitle</th>
              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">Type</th>
              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">Order</th>
              <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">Status</th>
              <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading sections...</td>
              </tr>
            ) : sections.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No content sections defined yet.</td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.id} className="border-b hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{section.title}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 italic">{section.subtitle || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                      {section.section_type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-400">{section.position}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${section.is_active ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-50 text-red-500 border border-red-100"}`}>
                      {section.is_active ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingSection(section)}
                        className="p-2 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDelete(section.id!)}
                        className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
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
        <AddAboutSection 
          onSuccess={() => fetchSections()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingSection && (
        <EditAboutSection 
          section={editingSection} 
          onSuccess={() => fetchSections()} 
          onClose={() => setEditingSection(null)} 
        />
      )}
    </div>
  );
};

export default CompanyAboutSectionList;
