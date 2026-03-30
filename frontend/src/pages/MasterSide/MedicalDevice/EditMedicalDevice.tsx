import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateMedicalDevice, getMedicalDeviceById } from "./medicaldeviceapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const EditMedicalDevice: React.FC<Props> = ({ id, onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getMedicalDeviceById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load device data");
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
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (!key.endsWith('_url') && value !== undefined && value !== null) {
          if (typeof value === 'object') {
            data.append(key, JSON.stringify(value));
          } else {
            data.append(key, value.toString());
          }
        }
      });
      
      if (imageFile) data.append("image", imageFile);
      if (thumbFile) data.append("thumbnail", thumbFile);

      await updateMedicalDevice(id, data);
      toast.success("Medical device updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update medical device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">Edit Medical Device</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Retrieving Device Data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Device Name *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
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
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="image">Main Image</Label>
              <div className="flex items-center gap-4 mb-2">
                 {formData.image_url && (
                   <div className="w-16 h-16 rounded border overflow-hidden shrink-0">
                      <img src={formData.image_url} alt="current" className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="text-xs text-gray-400">
                    {formData.image_url ? "Replace existing image" : "No image set"}
                 </div>
              </div>
              <Input
                id="image"
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="py-1.5"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div className="flex items-center gap-4 mb-2">
                 {formData.thumbnail_url && (
                   <div className="w-16 h-16 rounded border overflow-hidden shrink-0">
                      <img src={formData.thumbnail_url} alt="current" className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="text-xs text-gray-400">
                    {formData.thumbnail_url ? "Replace existing thumbnail" : "No thumbnail set"}
                 </div>
              </div>
              <Input
                id="thumbnail"
                type="file"
                onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                className="py-1.5"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="short_description">Short Description</Label>
              <textarea
                id="short_description"
                value={formData.short_description || ""}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Full Description</Label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="long_description">Technical Specs / Long Description</Label>
              <textarea
                id="long_description"
                value={formData.long_description || ""}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={4}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="technology">Primary Technology</Label>
              <Input
                id="technology"
                type="text"
                value={formData.primary_technology || ""}
                onChange={(e) => setFormData({ ...formData, primary_technology: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="connectivity">Connectivity</Label>
              <Input
                id="connectivity"
                type="text"
                value={formData.connectivity || ""}
                onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="position">Display Priority</Label>
              <Input
                id="position"
                type="number"
                value={formData.position || 0}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured || false}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <Label htmlFor="is_featured" className="mb-0 cursor-pointer">Featured Device</Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <Label htmlFor="is_active" className="mb-0 cursor-pointer">Live on Website</Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available || false}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <Label htmlFor="is_available" className="mb-0 cursor-pointer">Available to Order</Label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Medical Device"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditMedicalDevice;
