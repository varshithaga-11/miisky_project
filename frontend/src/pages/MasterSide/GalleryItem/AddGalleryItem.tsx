import React, { useState } from "react";
import { toast } from "react-toastify";
import { createGalleryItem, GalleryItem } from "./galleryitemapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { FiPlusCircle } from "react-icons/fi";

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
        
        if (formData.category) data.append("category", formData.category.toString());
        data.append("title", formData.title || file.name.split('.')[0]); 
        data.append("description", formData.description || "");
        data.append("media_type", "image");
        data.append("position", ( (formData.position || 0) + i).toString());
        data.append("is_active", String(formData.is_active));
        data.append("image", file);

        await createGalleryItem(data as any);
        successCount++;
      }

      toast.success(`Success! Added ${successCount} gallery items.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Error: Added ${successCount} items, but something went wrong.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Batch Upload Gallery</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Gallery Category *</Label>
            <select
              id="category"
              required
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="title">Global Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="Will use filename if empty"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
             <Label htmlFor="images">Select Images (Multiple allowed) *</Label>
             <div 
               onClick={() => !loading && document.getElementById('images-hidden')?.click()}
               className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-900/50 transition-all p-6 text-center"
             >
                <input
                  id="images-hidden"
                  type="file"
                  multiple
                  accept="image/*"
                  required
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="hidden"
                  disabled={loading}
                />
                <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <FiPlusCircle size={24} />
                   </div>
                   <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {selectedFiles && selectedFiles.length > 0 
                        ? `${selectedFiles.length} files staged for upload` 
                        : "Click to select multiple images"}
                   </p>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">PNG, JPG or WEBP (Max 5MB each)</p>
                </div>
             </div>
          </div>

          <div>
            <Label htmlFor="position">Starting Position</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="is_active" className="mb-0 cursor-pointer">Live / Active</Label>
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Start Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGalleryItem;
