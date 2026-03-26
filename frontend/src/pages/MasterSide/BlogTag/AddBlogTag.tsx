import React, { useState } from "react";
import { toast } from "react-toastify";
import { createBlogTag, BlogTag } from "./blogtagapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddBlogTag: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogTag>>({
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBlogTag(formData as BlogTag);
      toast.success("Hashtag created!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-sm shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">New Blog Tag</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Tag Label</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="innovation"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
            >
              {loading ? "Creating..." : "Create Tag"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogTag;
