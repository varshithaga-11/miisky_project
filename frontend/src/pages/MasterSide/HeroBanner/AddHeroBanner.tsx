import React, { useState } from "react";
import { toast } from "react-toastify";
import { createHeroBanner, HeroBanner } from "./herobannerapi";

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
      
      // Append all fields except ones we want to handle specially
      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        // Skip background_image from formData (since it's a separate state) 
        // and avoid sending empty strings for optional fields if needed
        if (key !== "background_image" && val !== undefined && val !== null) {
          data.append(key, val.toString());
        }
      });

      // ONLY append background_image if it's a real file object
      if (imageFile) {
        data.append("background_image", imageFile);
      }

      await createHeroBanner(data as any);
      toast.success("Hero banner added successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Save Error:", error.response?.data);
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
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Add Hero Banner</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Target Page</label>
              <select
                value={formData.page}
                onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Main Title</label>
              <input
                type="text"
                placeholder="Enter headline..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Subtitle</label>
              <input
                type="text"
                placeholder="Enter subheadline..."
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Hero Image</label>
              <div className="relative group overflow-hidden bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all p-8 text-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-gray-600 font-bold text-sm">
                    {imageFile ? imageFile.name : "Click to select or drag and drop"}
                  </span>
                  <span className="text-gray-400 text-xs font-semibold">Optimal: 1920x1080px</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Video URL (Opt)</label>
              <input
                type="text"
                placeholder="YouTube/Vimeo link..."
                value={formData.background_video_url}
                onChange={(e) => setFormData({ ...formData, background_video_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Section Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="h-[44px] w-[60px] border border-gray-300 rounded-lg p-1 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Primary BTN Text</label>
                  <input
                    type="text"
                    placeholder="EX: Buy Now"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Primary BTN Link</label>
                  <input
                    type="text"
                    placeholder="/shop"
                    value={formData.cta_url}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center group cursor-pointer inline-flex mt-4">
            <input
              type="checkbox"
              id="is_active_check"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
            />
            <label htmlFor="is_active_check" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Publish Immediately</label>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Constructing..." : "Launch Banner"}
            </button>
            <button
              onClick={onClose}
              type="button"
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHeroBanner;
