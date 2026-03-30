import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateAboutSection, CompanyAboutSection } from "./companyaboutsectionapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

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
        const skipKeys = ["id", "created_at", "updated_at", "image"];
        if (key === "bullet_points") {
          data.append(key, JSON.stringify(val));
        } else if (val !== undefined && val !== null && !skipKeys.includes(key)) {
          data.append(key, val.toString());
        }
      });
      if (imageFile) data.append("image", imageFile);

      await updateAboutSection(section.id!, data);
      toast.success("About section updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to update section";
      toast.error(msg.substring(0, 100));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit About Section</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="section_type">Section Category *</Label>
            <select
              id="section_type"
              required
              value={formData.section_type}
              onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              disabled={loading}
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
            <Label htmlFor="title">Display Title *</Label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="subtitle">Subtitle / Hook</Label>
            <Input
              id="subtitle"
              type="text"
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Innovation in every step..."
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="content">Narrative Content *</Label>
            <textarea
              id="content"
              required
              rows={5}
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="icon_class">Visual Icon (Class)</Label>
            <Input
              id="icon_class"
              type="text"
              value={formData.icon_class || ""}
              onChange={(e) => setFormData({ ...formData, icon_class: e.target.value })}
              placeholder="e.g. bi bi-star"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="position">Display Priority</Label>
            <Input
              id="position"
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="image">Featured Image</Label>
            <div className="flex items-center gap-4 mb-2">
               {section.image && (
                 <div className="w-16 h-16 rounded border overflow-hidden shrink-0">
                    <img src={section.image as any} alt="current" className="w-full h-full object-cover" />
                 </div>
               )}
               <div className="text-xs text-gray-400">
                  {section.image ? "Replace existing image" : "No image set"}
               </div>
            </div>
            <Input
              id="image"
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="py-1.5"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="is_active" className="mb-0 cursor-pointer">Live on Website</Label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update About Section"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAboutSection;
