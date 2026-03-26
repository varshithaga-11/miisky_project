import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlogCategory, getBlogCategoryById, BlogCategory } from "./blogcategoryapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditBlogCategory: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogCategory>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getBlogCategoryById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load data");
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
      await updateBlogCategory(id, formData);
      toast.success("Category updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Clarify Category #{id}</h2>
        {fetching ? (
          <div className="py-12 text-center text-gray-500 font-medium italic">Retrieving category metadata...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category Name</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Icon Reference</label>
              <input
                type="text"
                value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                placeholder="e.g. heroicon-o-book-open"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Display Order Priority</label>
              <input
                type="number"
                value={formData.position || 0}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Taxonomy Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={4}
              />
            </div>

            <div className="mb-6 border-t pt-4">
              <label className="flex items-center group cursor-pointer inline-flex">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Visible on platform</span>
              </label>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
              >
                {loading ? "Polishing..." : "Save Classification"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-3.5 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBlogCategory;
