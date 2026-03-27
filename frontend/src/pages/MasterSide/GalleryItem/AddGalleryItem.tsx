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
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    category: undefined,
    title: "",
    description: "",
    position: 1,
    is_active: true,
    media_type: 'image',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select at least one image file.");
      return;
    }

    setLoading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const data = new FormData();
        
        // Append shared fields
        if (formData.category) data.append("category", formData.category.toString());
        data.append("title", formData.title || file.name.split('.')[0]); // Default title to filename
        data.append("description", formData.description || "");
        data.append("media_type", "image");
        data.append("position", ( (formData.position || 0) + i).toString());
        data.append("is_active", String(formData.is_active));
        
        // Append binary file
        data.append("image", file);

        await createGalleryItem(data as any);
        successCount++;
      }

      toast.success(`Success! Successfully ingested ${successCount} assets.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error(`Ingestion interrupted. ${successCount} items saved.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Batch Ingestion</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Category Assignment</label>
              <select
                required
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
              >
                <option value="">Select Target Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Global Title (Optional)</label>
              <input
                type="text"
                placeholder="Defaults to filename if empty..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Visual Assets (Multiple)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                required
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="w-full border border-dashed border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {selectedFiles && (
                <p className="text-sm font-bold text-blue-600 mt-2 uppercase tracking-wide">
                  {selectedFiles.length} files staged
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Starting Pos</label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center group cursor-pointer inline-flex">
              <input
                type="checkbox"
                id="add_gal_item_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="add_gal_item_active" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Visible</label>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Processing..." : "Start Ingestion"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
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
