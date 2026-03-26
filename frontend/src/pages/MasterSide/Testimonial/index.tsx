import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiStar, FiUser } from "react-icons/fi";
import { getTestimonialList, deleteTestimonial, Testimonial } from "./testimonialapi";
import AddTestimonial from "./AddTestimonial";
import EditTestimonial from "./EditTestimonial";

const TestimonialPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTestimonialList(currentPage, pageSize, search);
      setTestimonials(data.results);
    } catch (error) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete testimonial?")) return;
    try {
      await deleteTestimonial(id);
      toast.success("Deleted!");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FiStar className="text-yellow-500" />
          Testimonials
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Testimonial
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, designation, or text..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
            className="flex-1 outline-none bg-transparent" 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Name & Designation</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-r border-gray-50">Rating</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading testimonials...</td></tr>
              ) : testimonials.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">No testimonials found.</td></tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {t.photo ? (
                          <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <FiUser />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{t.name}</div>
                          <div className="text-xs text-gray-500">{t.designation || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 border-x border-gray-50 text-sm">
                      <span className="capitalize">{t.testimonial_type || "general"}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-50">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        <FiStar className="fill-current" />
                        {t.rating || 5.0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingId(t.id!)} 
                          className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id!)} 
                          className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"
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
      </div>

      {isAddModalOpen && (
        <AddTestimonial 
          onSuccess={() => fetchTestimonials()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditTestimonial 
          id={editingId} 
          onSuccess={() => fetchTestimonials()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default TestimonialPage;
