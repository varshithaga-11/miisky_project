import React, { useState } from "react";
import { toast } from "react-toastify";
import { createGalleryCategory, GalleryCategory } from "./gallerycategoryapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddGalleryCategory: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<GalleryCategory>>({
    name: "",
    description: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createGalleryCategory(formData as GalleryCategory);
      toast.success("Exhibit category established!");
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
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl relative border border-gray-100 font-sans">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight tracking-tight uppercase tracking-widest text-lg">Curate Gallery</h2>
          <p className="text-gray-500 text-xs mt-1 font-bold uppercase tracking-wider">Define a new thematic container for visual assets.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest leading-none">Exhibit Handle</label>
            <input
              type="text"
              required
              placeholder="e.g. Clinical Showcase 2024"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold tracking-wide"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest leading-none">Curation Notes</label>
            <textarea
              placeholder="Contextual details for these assets..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest leading-none">Spatial Order</label>
              <input
                type="number"
                value={formData.position || 0}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-center focus:ring-2 focus:ring-blue-500/20 outline-none font-bold"
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center cursor-pointer group h-[46px]">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="ml-3 text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Visible</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 border-t pt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-50"
            >
              {loading ? "Establishing..." : "Save Category"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-100 text-gray-400 font-bold py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGalleryCategory;
