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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Batch <span className="text-blue-600">Ingestion</span></h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 leading-none">Mass upload of visual assets to the gallery matrix.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Category Assignment</label>
            <select
              required
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold uppercase"
            >
              <option value="">Select Target Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Global Title (Optional)</label>
            <input
              type="text"
              placeholder="Defaults to filename if empty..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Visual Assets (Multiple)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              required
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="block w-full text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer border border-dashed border-gray-200 p-4 rounded-xl"
            />
            {selectedFiles && (
              <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-tight">
                {selectedFiles.length} files staged for transmission
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Starting Pos</label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
              />
            </div>
            <div className="flex items-center pt-4">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                />
                <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Visible</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-xl border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all focus:ring-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-8 py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Start Ingestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGalleryItem;
