import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getFAQList, deleteFAQ, FAQ } from "./faqapi";
import { getFAQCategoryList } from "../FAQCategory/faqcategoryapi";
import AddFAQ from "./AddFAQ";
import EditFAQ from "./EditFAQ";

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFAQList(1, 100, search);
      setFaqs(data.results);
    } catch (error) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getFAQCategoryList(1, 100);
      setCategories(data.results);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, [fetchFAQs, fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteFAQ(id);
      toast.success("Deleted!");
      fetchFAQs();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">FAQs</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> Add FAQ
        </button>
      </div>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left font-semibold">Question</th>
              <th className="px-6 py-3 text-left font-semibold">Position</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : faqs.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">No FAQs found</td></tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id} className="border-b hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 truncate max-w-sm">{faq.question}</td>
                  <td className="px-6 py-4 text-gray-600">{faq.position}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${faq.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {faq.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-lg">
                      <button onClick={() => setEditingId(faq.id!)} className="text-blue-600 hover:text-blue-800 transition-transform"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(faq.id!)} className="text-red-600 hover:text-red-800 transition-transform"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddFAQ 
          categories={categories}
          onSuccess={() => fetchFAQs()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditFAQ 
          id={editingId} 
          categories={categories}
          onSuccess={() => fetchFAQs()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default FAQPage;
