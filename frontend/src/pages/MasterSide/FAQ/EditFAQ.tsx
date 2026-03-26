import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateFAQ, getFAQById, FAQ } from "./faqapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const EditFAQ: React.FC<Props> = ({ id, onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQ>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFAQById(id);
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
      await updateFAQ(id, formData as any);
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
        <h2 className="text-2xl font-bold mb-4">Edit FAQ</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({ ...formData, category: parseInt(e.target.value) })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Question</label>
            <input
              type="text"
              value={formData.question || ""}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea
              value={formData.answer || ""}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              rows={4}
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

export default EditFAQ;
