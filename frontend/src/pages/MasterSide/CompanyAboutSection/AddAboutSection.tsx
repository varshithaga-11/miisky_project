import React, { useState } from "react";
import { toast } from "react-toastify";
import { createAboutSection, CompanyAboutSection } from "./companyaboutsectionapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddAboutSection: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyAboutSection>>({
    section_type: "company_overview",
    title: "",
    subtitle: "",
    content: "",
    bullet_points: [],
    icon_class: "",
    entity_name: "",
    entity_description: "",
    entity_website: "",
    position: 1,
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
        if (key === "bullet_points") {
          data.append(key, JSON.stringify(val));
        } else if (val !== undefined && val !== null) {
          data.append(key, val.toString());
        }
      });
      if (imageFile) data.append("image", imageFile);

      await createAboutSection(data);
      toast.success("Section added!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error.response?.data);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to add section";
      toast.error(msg.substring(0, 100));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Add About Section</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Section Category</label>
            <select
              required
              value={formData.section_type}
              onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
            >
              <option value="company_overview">Company Overview</option>
              <option value="quality_statement">Quality Statement</option>
              <option value="service_concept">Service Concept</option>
              <option value="social_commitment">Social Commitment / CSR</option>
              <option value="promoter_intro">Promoter Introduction</option>
              <option value="milestone">Milestone / Achievement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Display Title</label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Subtitle / Hook</label>
            <input
              type="text"
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
              placeholder="E.g. Innovation in every step..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Detailed Narrative Content</label>
            <textarea
              required
              rows={6}
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-serif leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Visual Icon (Class)</label>
            <input
              type="text"
              value={formData.icon_class || ""}
              onChange={(e) => setFormData({ ...formData, icon_class: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="E.g. bi bi-star"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Sort Position</label>
            <input
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Feature Image (Optional)</label>
            <div className="relative group overflow-hidden bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
              <input 
                type="file" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="px-4 py-4 text-center text-sm font-bold text-gray-500 uppercase tracking-wide transition group-hover:text-blue-600">
                {imageFile ? imageFile.name : "Choose or drag image here"}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center">
            <div className="flex items-center group cursor-pointer inline-flex">
              <input
                type="checkbox"
                id="add_about_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="add_about_active" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Live on Website</label>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Publishing..." : "Publish Section"}
            </button>
            <button
              type="button"
              onClick={onClose}
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

export default AddAboutSection;
