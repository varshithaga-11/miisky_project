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
    } catch (error) {
      toast.error("Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all focus-within:backdrop-blur-none">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Add About Section</h2>
        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Section Category</label>
              <select
                required
                value={formData.section_type}
                onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700"
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
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Display Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subtitle / Hook</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
              placeholder="E.g. Innovation in every step..."
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Narrative Content</label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Visual Icon (Class)</label>
              <input
                type="text"
                value={formData.icon_class}
                onChange={(e) => setFormData({ ...formData, icon_class: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700"
                placeholder="E.g. bi bi-star"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sort Position</label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Feature Image (Optional)</label>
            <div className="relative group overflow-hidden bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 hover:border-indigo-400 transition-all">
              <input 
                type="file" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="px-4 py-6 text-center text-sm font-bold text-gray-400 uppercase tracking-tighter transition group-hover:text-indigo-600">
                {imageFile ? imageFile.name : "Choose or drag image here"}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Authoring..." : "Publish Section"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-100 text-gray-400 font-black uppercase tracking-widest text-sm py-4 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all"
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
