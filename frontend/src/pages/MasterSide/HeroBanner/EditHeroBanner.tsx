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
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Edit Hero Banner</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Target Page</label>
              <select
                value={formData.page || "home"}
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
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ""}
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
                    {imageFile ? imageFile.name : (formData.background_image_url ? "Change existing image" : "Click to select or drag and drop")}
                  </span>
                  {formData.background_image_url && !imageFile && (
                    <span className="text-gray-400 text-xs font-mono truncate max-w-[200px]">{formData.background_image_url}</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Video URL (Opt)</label>
              <input
                type="text"
                value={formData.background_video_url || ""}
                onChange={(e) => setFormData({ ...formData, background_video_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Section Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.background_color || "#ffffff"}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="h-[44px] w-[60px] border border-gray-300 rounded-lg p-1 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={formData.background_color || "#ffffff"}
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
                    value={formData.cta_text || ""}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Primary BTN Link</label>
                  <input
                    type="text"
                    value={formData.cta_url || ""}
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
              id="is_active_check_edit"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
            />
            <label htmlFor="is_active_check_edit" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Published</label>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Re-constructing..." : "Commit Update"}
            </button>
            <button
              onClick={onClose}
              type="button"
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHeroBanner;
