import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateGalleryItem, getGalleryItemById, GalleryItem } from "./galleryitemapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const EditGalleryItem: React.FC<Props> = ({ id, onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getGalleryItemById(id);
        setFormData({
            category: data.category,
            title: data.title,
            description: data.description,
            image: data.image,
            position: data.position,
            is_active: data.is_active
        });
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
      await updateGalleryItem(id, formData);
      toast.success("Updated!");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Edit Gallery Item</h2>
        
        {fetching ? (
          <div className="py-10 text-center text-gray-500 font-medium">Loading data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                required
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: parseInt(e.target.value) || undefined })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Title</label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={3}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Image URL</label>
              <input
                type="url"
                value={formData.image || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Position</label>
              <input
                type="number"
                value={formData.position || 0}
                onChange={(e) =>
                  setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Active Status</span>
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-md mt-2"
              >
                {loading ? "Saving..." : "Update Item"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 active:scale-95 transition-all mt-2"
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

export default EditGalleryItem;
