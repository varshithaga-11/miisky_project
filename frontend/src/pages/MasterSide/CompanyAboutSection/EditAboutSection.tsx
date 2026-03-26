import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateAboutSection, CompanyAboutSection } from "./companyaboutsectionapi";

interface Props {
  section: CompanyAboutSection;
  onSuccess: () => void;
  onClose: () => void;
}

const EditAboutSection: React.FC<Props> = ({ section, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyAboutSection>>(section);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData(section);
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        if (key === "bullet_points") {
          data.append(key, JSON.stringify(val));
        } else if (val !== undefined && val !== null && key !== "image") { // Don't send the old image string as a file
          data.append(key, val.toString());
        }
      });
      if (imageFile) data.append("image", imageFile);

      await updateAboutSection(section.id!, data);
      toast.success("Section updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-sm transition-all animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Edit About Section</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
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
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700 underline underline-offset-4 decoration-indigo-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subtitle / Hook</label>
            <input
              type="text"
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700 italic placeholder:text-gray-300"
              placeholder="E.g. Innovation in every step..."
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Narrative Content</label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-gray-100/50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700 leading-relaxed font-serif"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sort Position</label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 outline-none focus:ring-2 ring-indigo-500 transition-all font-bold text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Active Status</label>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-2xl hover:bg-white border hover:border-indigo-200 transition-all">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 border-none outline-none focus:ring-0"
                />
                <span className="text-sm font-black uppercase text-gray-500 tracking-tighter">Live on Website</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Featured Image</label>
            <div className="relative group overflow-hidden bg-gray-50 rounded-2xl border-2 border-dashed border-indigo-400/30 hover:border-indigo-500 transition-all">
              <input 
                type="file" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center justify-between px-6 py-6 font-black uppercase text-gray-400 tracking-widest text-xs">
                <span>{imageFile ? imageFile.name : section.image ? "Change existing image" : "Browse for image"}</span>
                {section.image && !imageFile && (
                  <img src={section.image as any} alt="Current" className="w-12 h-12 rounded object-cover border border-white" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm py-5 rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {loading ? "Committing..." : "Update Section"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white border-2 border-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px] px-8 rounded-3xl hover:bg-red-50 hover:text-red-400 hover:border-red-100 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAboutSection;
