import React, { useState } from "react";
import { toast } from "react-toastify";
import { createBlogPost, BlogPost } from "./blogpostapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const AddBlogPost: React.FC<Props> = ({ onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    category: undefined,
    author_name: "",
    excerpt: "",
    featured_image: "",
    published_at: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBlogPost(formData as BlogPost);
      toast.success("Blog post published!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Draft New Blog Post</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Post Title</label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter a compelling title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category</label>
            <select
              required
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Author Name</label>
            <input
              type="text"
              value={formData.author_name || ""}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Name of the author"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Publish Date</label>
            <input
              type="date"
              value={formData.published_at || ""}
              onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Display Order</label>
            <input
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Featured Image URL</label>
            <input
              type="url"
              value={formData.featured_image || ""}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Excerpt (Short Summary)</label>
            <textarea
              value={formData.excerpt || ""}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={2}
              placeholder="A brief summary for search results"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full Content</label>
            <textarea
              required
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-serif"
              rows={8}
              placeholder="Write your story here..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Published Status</span>
            </label>
          </div>

          <div className="md:col-span-2 flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
            >
              {loading ? "Publishing..." : "Publish Blog Post"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogPost;
