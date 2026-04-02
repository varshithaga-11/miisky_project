import React, { useState } from "react";
import { toast } from "react-toastify";
import { createMedicalDevice, MedicalDevice } from "./medicaldeviceapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ImagePicker from "../../../components/form/ImagePicker";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const AddMedicalDevice: React.FC<Props> = ({ onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalDevice>>({
    name: "",
    description: "",
    long_description: "",
    short_description: "",
    category: undefined,
    primary_technology: "",
    position: 0,
    price: undefined,
    is_active: true,
    is_featured: false,
    is_available: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      
      if (imageFile) data.append("image", imageFile);

      await createMedicalDevice(data as any);
      toast.success("Medical device added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add medical device");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">Add Medical Device</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="name">Device Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. SVASTH Vitals Monitor"
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
            <Label htmlFor="price">Price (INR)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <ImagePicker
              id="image"
              label="Main Image"
              value={imageFile}
              onChange={(file) => setImageFile(file)}
              disabled={loading}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="short_description">Short Description (Tagline)</Label>
            <textarea
              id="short_description"
              value={formData.short_description || ""}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              rows={2}
              placeholder="A brief catchy summary..."
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

          <div>
            <Label htmlFor="technology">Primary Technology</Label>
            <Input
              id="technology"
              type="text"
              value={formData.primary_technology || ""}
              onChange={(e) => setFormData({ ...formData, primary_technology: e.target.value })}
              placeholder="e.g. Biosensors"
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
              {loading ? "Adding..." : "Add Medical Device"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalDevice;
