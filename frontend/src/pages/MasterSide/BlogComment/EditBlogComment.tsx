import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlogComment, getBlogCommentById, BlogComment } from "./blogcommentapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  posts: any[];
}

const EditBlogComment: React.FC<Props> = ({ id, onSuccess, onClose, posts }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogComment>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getBlogCommentById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load blog comment data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBlogComment(id, formData);
      toast.success("Comment updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Blog Comment</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400">Loading comment data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="blog_post">Blog Post *</Label>
              <select
                id="blog_post"
                required
                value={formData.blog_post || ""}
                onChange={(e) => setFormData({ ...formData, blog_post: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                disabled={loading}
              >
                <option value="">Select Post</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="name">Author Name *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="comment">Content *</Label>
              <textarea
                id="comment"
                required
                value={formData.comment || ""}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_approved"
                checked={formData.is_approved || false}
                onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="is_approved" className="mb-0 cursor-pointer">Approved / Published</Label>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Comment"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBlogComment;
