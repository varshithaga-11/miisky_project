import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlogPost, getBlogPostById, BlogPost } from "./blogpostapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const EditBlogPost: React.FC<Props> = ({ id, onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogPost>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getBlogPostById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load article");
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
      await updateBlogPost(id, formData as BlogPost);
      toast.success("Post updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Refine Article #{id}</h2>
        {fetching ? (
          <div className="py-20 text-center text-gray-500 font-medium italic">Synchronizing editorial data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Headline</label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Editorial Category</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Author Assignment</label>
              <input
                type="text"
                value={formData.author_name || ""}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Publish Date</label>
              <input
                type="date"
                value={formData.published_at?.split("T")[0] || ""}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Sort Index</label>
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">SEO Excerpt</label>
              <textarea
                value={formData.excerpt || ""}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Narrative Content</label>
              <textarea
                required
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-serif"
                rows={10}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center group cursor-pointer inline-flex">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Visible to Public</span>
              </label>
            </div>

            <div className="md:col-span-2 flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100"
              >
                {loading ? "Committing..." : "Apply Editorial Changes"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Retreat
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBlogPost;
