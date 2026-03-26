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
    page: "",
    title: "",
    subtitle: "",
    description: "",
    background_image: "",
    background_video_url: "",
    background_color: "#ffffff",
    cta_text: "",
    cta_url: "",
    cta_secondary_text: "",
    cta_secondary_url: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createHeroBanner(formData as HeroBanner);
      toast.success("Hero vision manifested!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add hero banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Design Hero Stage</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Craft the primary visual experience for our users.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-blue-600 mb-1.5 uppercase tracking-widest leading-none">Target Page Segment</label>
            <input
              type="text"
              placeholder="e.g. Home, Hospital, About"
              value={formData.page || ""}
              onChange={(e) => setFormData({ ...formData, page: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Primary Headline</label>
            <input
              type="text"
              required
              placeholder="The main attention grabber..."
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-black text-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Secondary Subtitle</label>
            <input
              type="text"
              placeholder="Supporting the main headline..."
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Narrative Context</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              rows={3}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Visual Resource (Image/Video URL)</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.background_image || formData.background_video_url || ""}
                onChange={(e) => setFormData({ ...formData, background_image: e.target.value, background_video_url: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Theme Color</label>
              <input
                type="color"
                value={formData.background_color || "#ffffff"}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="w-full h-[50px] border border-gray-200 rounded-xl p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-2xl md:col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-2 text-[10px] font-black text-blue-800 uppercase tracking-widest border-b pb-2 mb-2">Lead Action (Primary CTA)</div>
            <input
              type="text"
              placeholder="Button Label"
              value={formData.cta_text || ""}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              type="text"
              placeholder="Direct URL"
              value={formData.cta_url || ""}
              onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="bg-gray-50/50 p-4 rounded-2xl md:col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-2 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b pb-2 mb-2">Support Action (Secondary CTA)</div>
            <input
              type="text"
              placeholder="Button Label"
              value={formData.cta_secondary_text || ""}
              onChange={(e) => setFormData({ ...formData, cta_secondary_text: e.target.value })}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
            <input
              type="text"
              placeholder="Support URL"
              value={formData.cta_secondary_url || ""}
              onChange={(e) => setFormData({ ...formData, cta_secondary_url: e.target.value })}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <div className="flex items-center justify-between md:col-span-2 border-t pt-6">
            <div className="flex gap-4 items-center">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="ml-2 text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-600">Active</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</span>
                <input
                  type="number"
                  value={formData.position || 0}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  className="w-16 border rounded px-2 py-1 text-xs text-center font-bold"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-all text-xs uppercase tracking-widest"
              >
                Retreat
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-black text-white font-black rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-xs"
              >
                {loading ? "Engaging..." : "Manifest Stage"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHeroBanner;
