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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans text-gray-800 text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-blue-600">Add Hero Banner</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Upload a visual masterpiece for your page.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Target Page</label>
            <select
              value={formData.page}
              onChange={(e) => setFormData({ ...formData, page: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold uppercase"
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
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Main Title</label>
            <input
              type="text"
              placeholder="Enter headline..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Subtitle</label>
            <input
              type="text"
              placeholder="Enter subheadline..."
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Hero Image (Select File)</label>
            <div className="relative group overflow-hidden bg-gray-50 rounded-xl border-2 border-dashed border-blue-400/30 hover:border-blue-500 transition-all p-8 text-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2">
                <span className="text-blue-600 font-bold text-xs uppercase tracking-tighter">
                  {imageFile ? imageFile.name : "Click to select or drag and drop"}
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Optimal: 1920x1080px</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Video URL (Opt)</label>
            <input
              type="text"
              placeholder="YouTube/Vimeo link..."
              value={formData.background_video_url}
              onChange={(e) => setFormData({ ...formData, background_video_url: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Section Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="h-[44px] w-[60px] border border-gray-200 rounded-xl p-1 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono uppercase focus:ring-0 outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Primary BTN Text</label>
                <input
                  type="text"
                  placeholder="EX: Buy Now"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Primary BTN Link</label>
                <input
                  type="text"
                  placeholder="/shop"
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              id="is_active_check"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded-lg border-gray-200 focus:ring-blue-500/10"
            />
            <label htmlFor="is_active_check" className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Publish Immediately</label>
          </div>

          <div className="md:col-span-2 flex gap-4 pt-4 border-t">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 px-6 py-4 rounded-xl border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Discard
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] px-6 py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? "Constructing..." : "Launch Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHeroBanner;
