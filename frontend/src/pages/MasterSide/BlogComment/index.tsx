import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getBlogCommentList, deleteBlogComment, BlogComment } from "./blogcommentapi";
import { getBlogPostList } from "../BlogPost/blogpostapi";
import AddBlogComment from "./AddBlogComment";
import EditBlogComment from "./EditBlogComment";

const BlogCommentPage: React.FC = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogCommentList(1, 100, search);
      setComments(data.results);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await getBlogPostList(1, 100);
      setPosts(data.results);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  }, []);

  useEffect(() => {
    fetchComments();
    fetchPosts();
  }, [fetchComments, fetchPosts]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteBlogComment(id);
      toast.success("Deleted!");
      fetchComments();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Comments</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> Add Comment
        </button>
      </div>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100/50">
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Author</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Approved</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : comments.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">No comments found</td></tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{comment.name}</td>
                  <td className="px-6 py-4">{comment.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${comment.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {comment.is_approved ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-lg">
                      <button onClick={() => setEditingId(comment.id!)} className="text-blue-600 hover:text-blue-800"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(comment.id!)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddBlogComment 
          posts={posts}
          onSuccess={() => fetchComments()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditBlogComment 
          id={editingId} 
          posts={posts}
          onSuccess={() => fetchComments()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default BlogCommentPage;
