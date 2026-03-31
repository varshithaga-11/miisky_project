import React, { useState } from "react";
import { toast } from "react-toastify";
import { createTestimonial } from "./testimonialapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ImagePicker from "../../../components/form/ImagePicker";

interface AddTestimonialProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AddTestimonial: React.FC<AddTestimonialProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    organization: "",
    testimonial_text: "",
    rating: 5,
    testimonial_type: "general",
    video_url: "",
    is_featured: false,
    is_active: true,
    position: 1,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });
      if (photo) {
        data.append("photo", photo);
      }

      await createTestimonial(data);
      toast.success("Testimonial added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Add Testimonial</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                name="designation"
                type="text"
                value={formData.designation}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="testimonial_text">Testimonial Content *</Label>
              <textarea
                id="testimonial_text"
                name="testimonial_text"
                required
                value={formData.testimonial_text}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-32 resize-none"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="testimonial_type">Category</Label>
              <select
                id="testimonial_type"
                name="testimonial_type"
                value={formData.testimonial_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                disabled={loading}
              >
                <option value="general">General</option>
                <option value="patient">Patient</option>
                <option value="nutritionist">Nutritionist</option>
                <option value="micro_kitchen">Micro Kitchen Partner</option>
              </select>
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={formData.rating}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="md:col-span-2">
              <ImagePicker
                id="photo"
                label="Profile Photo"
                value={photo}
                onChange={(file) => setPhoto(file)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="is_featured" className="mb-0 cursor-pointer">Featured</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="is_active" className="mb-0 cursor-pointer">Published</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Testimonial"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestimonial;
