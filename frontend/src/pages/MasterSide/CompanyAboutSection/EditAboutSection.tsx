import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateAboutSection, CompanyAboutSection } from "./companyaboutsectionapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  section: CompanyAboutSection;
  onSuccess: () => void;
  onClose: () => void;
}

const EditAboutSection: React.FC<Props> = ({ section, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyAboutSection>>({});

  const [aboutImg1, setAboutImg1] = useState<File | null>(null);
  const [videoImg, setVideoImg] = useState<File | null>(null);

  useEffect(() => {
    if (section) {
      setFormData(section);
    }
  }, [section]);

  const handleArrayChange = (field: keyof CompanyAboutSection, index: number, value: string) => {
    const list = [...(formData[field] as string[])];
    list[index] = value;
    setFormData({ ...formData, [field]: list });
  };

  const addArrayItem = (field: keyof CompanyAboutSection) => {
    const list = [...(formData[field] as string[] || []), ""];
    setFormData({ ...formData, [field]: list });
  };

  const removeArrayItem = (field: keyof CompanyAboutSection, index: number) => {
    const list = (formData[field] as string[]).filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: list });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!section.id) return;
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        if (["about_specialties", "about_vision", "speciality_points"].includes(key)) {
          data.append(key, JSON.stringify(val));
        } else if (val !== undefined && val !== null && !["about_image_1", "about_image_2", "video_image", "about_image_1_url", "about_image_2_url", "video_image_url", "id", "created_at", "updated_at"].includes(key)) {
          data.append(key, val.toString());
        }
      });
      if (aboutImg1) data.append("about_image_1", aboutImg1);
      if (videoImg) data.append("video_image", videoImg);

      await updateAboutSection(section.id, data);
      toast.success("About configuration updated!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to update config");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-black mb-8 text-gray-900 dark:text-white border-b pb-4 text-center">Edit About Selection Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: About Us (Image 1) */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest text-center">Home Page: Primary About Section</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>About Tagline (Label above heading)</Label>
                <Input value={formData.about_tagline || ""} onChange={(e) => setFormData({...formData, about_tagline: e.target.value})} disabled={loading} />
              </div>
              <div>
                <Label>Main Emotional Heading</Label>
                <Input value={formData.about_title || ""} onChange={(e) => setFormData({...formData, about_title: e.target.value})} disabled={loading} />
              </div>
            </div>

            <div>
              <Label>Introductory Description Text (Paragraph)</Label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm shadow-sm"
                rows={3} 
                value={formData.about_description || ""} 
                onChange={(e) => setFormData({...formData, about_description: e.target.value})} 
                disabled={loading} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Specialties List */}
              <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 border rounded-xl dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <Label className="mb-0 text-blue-600 font-black text-xs uppercase tracking-wider">Features list 1: Specialties</Label>
                    <button type="button" onClick={() => addArrayItem("about_specialties")} className="text-blue-600 hover:text-blue-700 bg-blue-100 p-1 rounded-full"><FiPlus /></button>
                </div>
                {formData.about_specialties?.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-3">
                    <Input value={item} onChange={(e) => handleArrayChange("about_specialties", i, e.target.value)} disabled={loading} />
                    <button type="button" onClick={() => removeArrayItem("about_specialties", i)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                  </div>
                ))}
              </div>

              {/* Vision List */}
              <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 border rounded-xl dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <Label className="mb-0 text-orange-600 font-black text-xs uppercase tracking-wider">Features list 2: Vision</Label>
                    <button type="button" onClick={() => addArrayItem("about_vision")} className="text-orange-600 hover:text-orange-700 bg-orange-100 p-1 rounded-full"><FiPlus /></button>
                </div>
                {formData.about_vision?.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-3">
                    <Input value={item} onChange={(e) => handleArrayChange("about_vision", i, e.target.value)} disabled={loading} />
                    <button type="button" onClick={() => removeArrayItem("about_vision", i)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div>
                <Label>Experience Years (Number)</Label>
                <Input type="number" value={formData.about_experience_years || 0} onChange={(e) => setFormData({...formData, about_experience_years: parseInt(e.target.value) || 0})} disabled={loading} />
              </div>
              <div>
                <Label>Badge Subtext (Under number)</Label>
                <Input value={formData.about_experience_text || ""} onChange={(e) => setFormData({...formData, about_experience_text: e.target.value})} disabled={loading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <Label className="mb-4 block text-sm font-black uppercase tracking-widest text-blue-600">Part 1: Primary About Image</Label>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                    {aboutImg1 ? (
                      <img src={URL.createObjectURL(aboutImg1)} alt="New" className="w-full h-full object-cover" />
                    ) : formData.about_image_1_url ? (
                      <img src={formData.about_image_1_url} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                      <input type="file" className="hidden" onChange={(e) => setAboutImg1(e.target.files?.[0] || null)} />
                      <span className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">Change Image</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <Label className="mb-4 block text-sm font-black uppercase tracking-widest text-orange-600">Part 2: Why Choose Us Video Thumbnail</Label>
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                    {videoImg ? (
                      <img src={URL.createObjectURL(videoImg)} alt="New Video" className="w-full h-full object-cover" />
                    ) : formData.video_image_url ? (
                      <img src={formData.video_image_url} alt="Current Video" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No Video Thumbnail</div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                      <input type="file" className="hidden" onChange={(e) => setVideoImg(e.target.files?.[0] || null)} />
                      <span className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">Change Thumbnail</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="dark:border-gray-700" />

          {/* Section 2: Why Choose Us (Image 2) */}
          <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest text-center">Home Page: Speciality Features (Tabs Style)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Why Choose Us Tagline</Label>
                <Input value={formData.choose_tagline || ""} onChange={(e) => setFormData({...formData, choose_tagline: e.target.value})} disabled={loading} />
              </div>
              <div>
                <Label>Why Choose Us Title (Upper Case)</Label>
                <Input value={formData.choose_title || ""} onChange={(e) => setFormData({...formData, choose_title: e.target.value})} disabled={loading} />
              </div>
            </div>

            <div>
                <Label>Intro Concept Text</Label>
                <textarea 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                    rows={2} 
                    value={formData.choose_description || ""} 
                    onChange={(e) => setFormData({...formData, choose_description: e.target.value})} 
                    disabled={loading} 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-900/20 p-8 rounded-2xl border-2 border-dashed dark:border-gray-700">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6 bg-white dark:bg-gray-900 inline-block px-3 py-1 rounded-full border dark:border-gray-700 shadow-sm transition-all">Speciality Details</h4>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
                        <Label>Tab Label/Button Text</Label>
                        <Input value={formData.speciality_label || ""} onChange={(e) => setFormData({...formData, speciality_label: e.target.value})} disabled={loading} className="mb-4" />
                        
                        <Label>Detailed Heading</Label>
                        <Input value={formData.speciality_title || ""} onChange={(e) => setFormData({...formData, speciality_title: e.target.value})} disabled={loading} className="mb-4" />
                        
                        <Label>Narrative Explanation</Label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm shadow-inner"
                            rows={4} 
                            value={formData.speciality_description || ""} 
                            onChange={(e) => setFormData({...formData, speciality_description: e.target.value})} 
                            disabled={loading} 
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <Label className="mb-0 font-black text-blue-600 text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full inline-block dark:bg-blue-900/30 dark:text-blue-400">Point Breakdown</Label>
                        <button type="button" onClick={() => addArrayItem("speciality_points")} className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110"><FiPlus /></button>
                    </div>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {formData.speciality_points?.map((item, i) => (
                        <div key={i} className="flex gap-2 group animate-in slide-in-from-right-2 fade-in">
                            <Input value={item} onChange={(e) => handleArrayChange("speciality_points", i, e.target.value)} disabled={loading} className="shadow-sm" />
                            <button type="button" onClick={() => removeArrayItem("speciality_points", i)} className="text-gray-400 hover:text-red-500 transition-colors p-2"><FiTrash2 /></button>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-5 border rounded-xl bg-white dark:bg-gray-900/50 dark:border-gray-700">
                <Label className="mb-3 font-bold">Video Thumbnail Image</Label>
                {formData.video_image_url && !videoImg && (
                    <div className="mb-4 overflow-hidden rounded-lg h-32 border shadow-sm dark:border-gray-800">
                        <img src={formData.video_image_url} alt="current" className="w-full h-full object-cover" />
                    </div>
                )}
                <Input type="file" onChange={(e) => setVideoImg(e.target.files?.[0] || null)} disabled={loading} className="text-xs" />
              </div>
              <div className="p-5 border rounded-xl bg-white dark:bg-gray-900/50 dark:border-gray-700">
                <Label className="mb-3 font-bold">Action Video Link</Label>
                <div className="relative">
                    <Input value={formData.video_url || ""} onChange={(e) => setFormData({...formData, video_url: e.target.value})} disabled={loading} placeholder="Paste YouTube link here..." className="pl-4 pr-10 py-3" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl"><i className="bi bi-youtube"></i></div>
                </div>
                <p className="mt-3 text-[10px] text-gray-400 italic">This link will open when user clicks the play button over the thumbnail.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/40 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm transition-all hover:shadow-md">
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-6 h-6 rounded-lg border-2 border-blue-400 text-blue-600 focus:ring-4 focus:ring-blue-500/20 cursor-pointer transition-all appearance-none checked:bg-blue-600 checked:border-transparent"
                />
                <div className="absolute pointer-events-none opacity-0 checked-icon-show text-white text-xs font-bold w-6 h-6 flex items-center justify-center">
                    <i className="bi bi-check-lg"></i>
                </div>
            </div>
            <div>
                <Label htmlFor="is_active" className="mb-0 cursor-pointer text-base font-black text-blue-900 dark:text-blue-100">Live Production Status</Label>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Toggle this to show or hide all about/speciality sections on the homepage global view.</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pb-4 px-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="px-8 border-2 font-bold hover:bg-gray-50 transition-all active:scale-95">
              Discard Changes
            </Button>
            <Button type="submit" disabled={loading} className="px-10 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:translate-y-[-2px] active:scale-95">
              {loading ? "Syncing..." : "Update Web Configuration"}
            </Button>
          </div>
        </form>
      </div>
      <style>{`
        input[type="checkbox"]:checked ~ .checked-icon-show { opacity: 1; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default EditAboutSection;
