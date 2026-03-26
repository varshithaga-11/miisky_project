import React, { useState } from "react";
import { toast } from "react-toastify";
import { createBlogComment, BlogComment } from "./blogcommentapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  posts: any[];
}

const AddBlogComment: React.FC<Props> = ({ onSuccess, onClose, posts }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BlogComment>({
    blog_post: "",
    name: "",
    email: "",
    comment: "",
    is_approved: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBlogComment(formData);
      toast.success("Comment added!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add Blog Comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Blog Post</label>
            <select
              required
              value={formData.blog_post}
              onChange={(e) =>
                setFormData({ ...formData, blog_post: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Post</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Author Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              required
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_approved}
                onChange={(e) =>
                  setFormData({ ...formData, is_approved: e.target.checked })
                }
                className="rounded"
              />
              <span className="ml-2">Approve</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogComment;
