import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateHeroBanner, getHeroBannerById, HeroBanner } from "./herobannerapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditHeroBanner: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroBanner>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHeroBannerById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateHeroBanner(id, formData as any);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Hero Banner</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle || ""}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">CTA Text</label>
            <input
              type="text"
              value={formData.cta_text || ""}
              onChange={(e) =>
                setFormData({ ...formData, cta_text: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">CTA URL</label>
            <input
              type="url"
              value={formData.cta_url || ""}
              onChange={(e) =>
                setFormData({ ...formData, cta_url: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Position</label>
            <input
              type="number"
              value={formData.position || 0}
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
                checked={formData.is_active || false}
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
              {loading ? "Saving..." : "Update"}
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

export default EditHeroBanner;
