import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiX, FiSave } from "react-icons/fi";
import { createTestimonial } from "./testimonialapi";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Add New Testimonial</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Organization</label>
              <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Testimonial Text *</label>
              <textarea name="testimonial_text" required value={formData.testimonial_text} onChange={handleChange} rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Type</label>
              <select name="testimonial_type" value={formData.testimonial_type} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all">
                <option value="general">General</option>
                <option value="patient">Patient</option>
                <option value="nutritionist">Nutritionist</option>
                <option value="micro_kitchen">Micro Kitchen Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rating (1-5)</label>
              <input type="number" name="rating" min={1} max={5} step={0.1} value={formData.rating} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Featured</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
              <FiSave /> {isSubmitting ? "Saving..." : "Save Testimonial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestimonial;
