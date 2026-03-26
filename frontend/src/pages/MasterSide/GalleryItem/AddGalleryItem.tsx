import React, { useState } from "react";
import { toast } from "react-toastify";
import { createGalleryItem, GalleryItem } from "./galleryitemapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const AddGalleryItem: React.FC<Props> = ({ onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    category: undefined,
    title: "",
    description: "",
    image: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createGalleryItem(formData as any);
      toast.success("Gallery item added!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add gallery item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add Gallery Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              required
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({ ...formData, category: parseInt(e.target.value) || undefined })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              required
              value={formData.image || ""}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Position</label>
            <input
              type="number"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: parseInt(e.target.value) })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded"
              />
              <span className="ml-2">Active</span>
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

export default AddGalleryItem;
