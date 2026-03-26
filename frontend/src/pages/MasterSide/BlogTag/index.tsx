import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getBlogTagList, deleteBlogTag, BlogTag } from "./blogtagapi";
import AddBlogTag from "./AddBlogTag";
import EditBlogTag from "./EditBlogTag";

const BlogTagPage: React.FC = () => {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogTagList(1, 100, search);
      setTags(data.results);
    } catch (error) {
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this tag? This will disconnect it from all posts.")) return;
    try {
      await deleteBlogTag(id);
      toast.success("Hashtag deleted!");
      fetchTags();
    } catch (error) {
      toast.error("Failed to delete tag");
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hashtag Cloud</h1>
            <p className="text-gray-500 mt-1">Manage descriptive tags to enhance discoverability across topics.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
          >
            <FiPlus strokeWidth={3} /> Register Tag
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-white">
            <div className="relative max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Find specific tags..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-gray-700 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Hashtag Identity</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && tags.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-16 text-center text-gray-400 italic">Exploring tags...</td></tr>
                ) : tags.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-16 text-center text-gray-400 font-medium italic">No hashtags found</td></tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id} className="group hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl group-hover:bg-blue-100 transition-all group-hover:scale-105 active:scale-95 border border-gray-100 group-hover:border-blue-200">
                          <span className="font-bold text-blue-400 group-hover:text-blue-600">#</span>
                          <span className="font-bold text-gray-700 group-hover:text-blue-900">{tag.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingId(tag.id!)} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-50 bg-white"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(tag.id!)} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-50 bg-white"
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
        <AddBlogTag 
          onSuccess={() => fetchTags()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditBlogTag 
          id={editingId} 
          onSuccess={() => fetchTags()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default BlogTagPage;
