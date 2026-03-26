import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getBlogCategoryList, deleteBlogCategory, BlogCategory } from "./blogcategoryapi";
import AddBlogCategory from "./AddBlogCategory";
import EditBlogCategory from "./EditBlogCategory";

const BlogCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogCategoryList(currentPage, pageSize, search);
      setCategories(data.results);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Move this category to trash? This action cannot be easily undone.")) return;
    try {
      await deleteBlogCategory(id);
      toast.success("Category removed!");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Content Taxonomy</h1>
            <p className="text-gray-500 mt-1">Organize your blog posts into meaningful thematic categories.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
          >
            <FiPlus strokeWidth={3} /> Create Category
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-white">
            <div className="relative max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search categories by name..." 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-gray-700 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Classification</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic font-medium">Indexing categories...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium">No results match your criteria</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl uppercase">
                            {cat.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cat.name}</div>
                            {cat.description && <div className="text-xs text-gray-500 line-clamp-1">{cat.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-mono font-bold text-gray-400 italic">#{cat.position}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                          cat.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                        }`}>
                          {cat.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 text-lg">
                          <button 
                            onClick={() => setEditingId(cat.id!)} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-50"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id!)} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-50"
                          >
                            <FiTrash2 size={18} />
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
        <AddBlogCategory 
          onSuccess={() => fetchCategories()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditBlogCategory 
          id={editingId} 
          onSuccess={() => fetchCategories()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default BlogCategoryPage;
