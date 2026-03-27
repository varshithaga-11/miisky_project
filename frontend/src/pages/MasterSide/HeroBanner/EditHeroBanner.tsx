import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateHeroBanner, getHeroBannerById, HeroBanner } from "./herobannerapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditHeroBanner: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroBanner>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHeroBannerById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load hero banner data");
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      
      const skipKeys = ["background_image", "id", "created_at", "updated_at"];
      
      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        if (!skipKeys.includes(key) && val !== undefined && val !== null) {
          data.append(key, val.toString());
        }
      });
      
      if (imageFile) {
        data.append("background_image", imageFile);
      }

      await updateHeroBanner(id, data as any);
      toast.success("Hero banner recalibrated!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Update Error:", error.response?.data);
      const errorData = error.response?.data;
      let errorMsg = "Failed to update hero banner";
      
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
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-gray-800 text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-blue-600">Edit Hero Banner</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Refining the primary visual identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Target Page</label>
            <select
              value={formData.page || "home"}
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
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Hero Image (Select New File)</label>
            <div className="relative group overflow-hidden bg-gray-50 rounded-xl border-2 border-dashed border-blue-400/30 hover:border-blue-500 transition-all p-8 text-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2">
                <span className="text-blue-600 font-bold text-xs uppercase tracking-tighter">
                  {imageFile ? imageFile.name : (formData.background_image_url ? "Change existing image" : "Click to select or drag and drop")}
                </span>
                {formData.background_image_url && !imageFile && (
                  <span className="text-gray-400 text-[10px] font-mono truncate max-w-[200px]">{formData.background_image_url}</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Video URL (Opt)</label>
            <input
              type="text"
              value={formData.background_video_url || ""}
              onChange={(e) => setFormData({ ...formData, background_video_url: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Section Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.background_color || "#ffffff"}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="h-[44px] w-[60px] border border-gray-200 rounded-xl p-1 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={formData.background_color || "#ffffff"}
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
                  value={formData.cta_text || ""}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Primary BTN Link</label>
                <input
                  type="text"
                  value={formData.cta_url || ""}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              id="is_active_check_edit"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded-lg border-gray-200 focus:ring-blue-500/10"
            />
            <label htmlFor="is_active_check_edit" className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Published Visibility</label>
          </div>

          <div className="md:col-span-2 flex gap-4 pt-4 border-t">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 px-6 py-4 rounded-xl border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] px-6 py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? "Re-constructing..." : "Commit Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHeroBanner;
