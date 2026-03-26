import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getBlogPostList, deleteBlogPost, BlogPost } from "./blogpostapi";
import { getBlogCategoryList } from "../BlogCategory/blogcategoryapi";
import AddBlogPost from "./AddBlogPost";
import EditBlogPost from "./EditBlogPost";

const BlogPostPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogPostList(currentPage, pageSize, search);
      setPosts(data.results);
    } catch (error) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getBlogCategoryList(1, 100);
      setCategories(data.results);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Archive this blog post? It will no longer be visible on the public site.")) return;
    try {
      await deleteBlogPost(id);
      toast.success("Post archived!");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Editorial Hub</h1>
            <p className="text-gray-500 mt-1">Compose, manage, and track the performance of your blog articles.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
          >
            <FiPlus strokeWidth={3} /> Compose Post
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-white">
            <div className="relative max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search articles by title or author..." 
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Article Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Taxonomy</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && posts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Syncing editorial calendar...</td></tr>
                ) : posts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium italic">No articles found in current search</td></tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {post.featured_image ? (
                             <img src={post.featured_image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100 shadow-sm" />
                          ) : (
                             <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-50">MI</div>
                          )}
                          <div className="max-w-[18rem]">
                            <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors" title={post.title}>{post.title}</div>
                            <div className="text-xs text-gray-500 font-medium">By {post.author_name || "MiiSky Editorial"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-tight">
                          {categories.find(c => c.id === post.category)?.name || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <div className="text-sm font-bold text-gray-800">{post.views_count || 0} <span className="font-normal text-gray-400 text-[10px] uppercase">Views</span></div>
                          <div className="text-[10px] font-bold text-pink-500 uppercase">{post.likes_count || 0} Likes</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border leading-none ${
                          post.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                        }`}>
                          {post.is_active ? "LIVE" : "DRAFT"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingId(post.id!)} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-50 bg-white"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id!)} 
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
        <AddBlogPost 
          categories={categories}
          onSuccess={() => fetchPosts()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditBlogPost 
          id={editingId} 
          categories={categories}
          onSuccess={() => fetchPosts()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default BlogPostPage;
