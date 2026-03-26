import React, { useState } from "react";
import { toast } from "react-toastify";
import { createBlogCategory, BlogCategory } from "./blogcategoryapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddBlogCategory: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogCategory>>({
    name: "",
    description: "",
    icon: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBlogCategory(formData as BlogCategory);
      toast.success("Blog category created!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">New Blog Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category Name</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Healthcare Tech"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Icon Identifier</label>
            <input
              type="text"
              value={formData.icon || ""}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. medical-icon"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Display Priority</label>
            <input
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={3}
              placeholder="Summary for this category..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Visible to Users</span>
            </label>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogCategory;
