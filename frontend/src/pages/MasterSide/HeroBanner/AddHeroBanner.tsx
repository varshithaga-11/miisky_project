import React, { useState } from "react";
import { toast } from "react-toastify";
import { createHeroBanner, HeroBanner } from "./herobannerapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddHeroBanner: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroBanner>>({
    page: "home",
    title: "",
    subtitle: "",
    description: "",
    background_video_url: "",
    background_color: "#ffffff",
    cta_text: "",
    cta_url: "",
    cta_secondary_text: "",
    cta_secondary_url: "",
    position: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        if (key !== "background_image" && val !== undefined && val !== null) {
          data.append(key, val.toString());
        }
      });

      if (imageFile) {
        data.append("background_image", imageFile);
      }

      await createHeroBanner(data as any);
      toast.success("Hero banner added successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMsg = "Failed to add hero banner";
      if (errorData) {
        if (typeof errorData === 'object') {
          errorMsg = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join(" | ");
        } else {
          errorMsg = JSON.stringify(errorData);
        }
      }
      toast.error(errorMsg.substring(0, 150));
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">Add Hero Banner</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="page">Target Page *</Label>
            <select
              id="page"
              required
              value={formData.page}
              onChange={(e) => setFormData({ ...formData, page: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              disabled={loading}
            >
              <option value="home">Home</option>
              <option value="medical_devices">Medical Devices</option>
              <option value="health_food_concept">Health Food</option>
              <option value="blog">Blog</option>
              <option value="contact">Contact</option>
              <option value="careers">Careers</option>
              <option value="about">About Us</option>
            </select>
          </div>

          <div>
            <Label htmlFor="title">Main Title *</Label>
            <Input
              id="title"
              type="text"
              required
              placeholder="Headline"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              type="text"
              placeholder="Subheadline"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="image">Background Image</Label>
            <Input
              id="image"
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="py-1.5"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
             <Label htmlFor="description">Description (Optional)</Label>
             <textarea
               id="description"
               rows={3}
               value={formData.description || ""}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
               disabled={loading}
             />
          </div>

          <div>
            <Label htmlFor="video_url">Video URL (Opt)</Label>
            <Input
              id="video_url"
              type="text"
              placeholder="YouTube/Vimeo link"
              value={formData.background_video_url}
              onChange={(e) => setFormData({ ...formData, background_video_url: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="background_color">Bg Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="background_color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="h-10 w-12 border border-gray-300 rounded-lg p-1 cursor-pointer"
                disabled={loading}
              />
              <Input
                type="text"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cta_text">Primary Btn Text</Label>
            <Input
              id="cta_text"
              type="text"
              placeholder="e.g. Shop Now"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="cta_url">Primary Btn Link</Label>
            <Input
              id="cta_url"
              type="text"
              placeholder="/page-url"
              value={formData.cta_url}
              onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
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
            <Label htmlFor="is_active" className="mb-0 cursor-pointer">Live on Website</Label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Discard
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Hero Banner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHeroBanner;
