import React, { useState } from "react";
import { toast } from "react-toastify";
import { createAboutSection, CompanyAboutSection } from "./companyaboutsectionapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddAboutSection: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyAboutSection>>({
    about_tagline: "About the company",
    about_title: "EXPERTISE AND COMPASSION SAVED MY LIFE",
    about_description: "",
    about_specialties: ["Preventive care", "Diagnostic testing", "Mental health services"],
    about_vision: ["To provide accessible and equitable", "To use innovative technology", "To empower patients"],
    about_experience_years: 30,
    about_experience_text: "Years of Experience in This Field",
    choose_tagline: "Why Choose Us",
    choose_title: "WHAT'S OUR SPECIALITY",
    choose_description: "",
    speciality_label: "Modern Technology",
    speciality_title: "Modern Technology",
    speciality_description: "",
    speciality_points: ["Your Health is Our Top Priority", "Compassionate Care, Innovative Treatments", "We Treat You Like Family", "Leading the Way in Medical Excellence"],
    video_url: "",
    is_active: true,
  });

  const [aboutImg1, setAboutImg1] = useState<File | null>(null);
  const [videoImg, setVideoImg] = useState<File | null>(null);

  const handleArrayChange = (field: keyof CompanyAboutSection, index: number, value: string) => {
    const list = [...(formData[field] as string[])];
    list[index] = value;
    setFormData({ ...formData, [field]: list });
  };

  const addArrayItem = (field: keyof CompanyAboutSection) => {
    const list = [...(formData[field] as string[]), ""];
    setFormData({ ...formData, [field]: list });
  };

  const removeArrayItem = (field: keyof CompanyAboutSection, index: number) => {
    const list = (formData[field] as string[]).filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: list });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        const val = (formData as any)[key];
        if (["about_specialties", "about_vision", "speciality_points"].includes(key)) {
          data.append(key, JSON.stringify(val));
        } else if (val !== undefined && val !== null) {
          data.append(key, val.toString());
        }
      });
      if (aboutImg1) data.append("about_image_1", aboutImg1);
      if (videoImg) data.append("video_image", videoImg);

      await createAboutSection(data);
      toast.success("About configuration added!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to save config");
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
        <h2 className="text-2xl font-black mb-8 text-gray-900 dark:text-white border-b pb-4">Configure About Section</h2>
        
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: About Us (Image 1) */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">Part 1: Main About Section (Expertise & Compassion)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tagline (e.g. About the company)</Label>
                <Input value={formData.about_tagline} onChange={(e) => setFormData({...formData, about_tagline: e.target.value})} disabled={loading} />
              </div>
              <div>
                <Label>Main Title (e.g. Expertise and Compassion...)</Label>
                <Input value={formData.about_title} onChange={(e) => setFormData({...formData, about_title: e.target.value})} disabled={loading} />
              </div>
            </div>

            <div>
              <Label>Main Description</Label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={3} 
                value={formData.about_description} 
                onChange={(e) => setFormData({...formData, about_description: e.target.value})} 
                disabled={loading} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Specialties List */}
              <div className="p-4 border rounded-lg dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <Label className="mb-0">Our Specialties</Label>
                    <button type="button" onClick={() => addArrayItem("about_specialties")} className="text-blue-600 hover:text-blue-700"><FiPlus /></button>
                </div>
                {formData.about_specialties?.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={item} onChange={(e) => handleArrayChange("about_specialties", i, e.target.value)} disabled={loading} />
                    <button type="button" onClick={() => removeArrayItem("about_specialties", i)} className="text-red-500"><FiTrash2 /></button>
                  </div>
                ))}
              </div>

              {/* Vision List */}
              <div className="p-4 border rounded-lg dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <Label className="mb-0">Our Vision</Label>
                    <button type="button" onClick={() => addArrayItem("about_vision")} className="text-blue-600 hover:text-blue-700"><FiPlus /></button>
                </div>
                {formData.about_vision?.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={item} onChange={(e) => handleArrayChange("about_vision", i, e.target.value)} disabled={loading} />
                    <button type="button" onClick={() => removeArrayItem("about_vision", i)} className="text-red-500"><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Experience Years (e.g. 30)</Label>
                <Input type="number" value={formData.about_experience_years} onChange={(e) => setFormData({...formData, about_experience_years: parseInt(e.target.value)})} disabled={loading} />
              </div>
              <div>
                <Label>Experience Subtext</Label>
                <Input value={formData.about_experience_text} onChange={(e) => setFormData({...formData, about_experience_text: e.target.value})} disabled={loading} />
              </div>
            </div>

            <div>
              <Label>Main About Image</Label>
              <Input type="file" onChange={(e) => setAboutImg1(e.target.files?.[0] || null)} disabled={loading} />
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Primary building/hospital image</p>
            </div>
          </div>

          <hr className="dark:border-gray-700" />

          {/* Section 2: Why Choose Us */}
          <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest">Part 2: Why Choose Us (Speciality Tabs)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Section Tagline (e.g. Why Choose Us)</Label>
                <Input value={formData.choose_tagline} onChange={(e) => setFormData({...formData, choose_tagline: e.target.value})} disabled={loading} />
              </div>
              <div>
                <Label>Section Title (e.g. What's Our Speciality)</Label>
                <Input value={formData.choose_title} onChange={(e) => setFormData({...formData, choose_title: e.target.value})} disabled={loading} />
              </div>
            </div>

            <div>
                <Label>Section Intro Description</Label>
                <textarea 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                    rows={2} 
                    value={formData.choose_description} 
                    onChange={(e) => setFormData({...formData, choose_description: e.target.value})} 
                    disabled={loading} 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-4">Active Speciality Info</h4>
                    <div>
                        <Label>Tab Label (e.g. Modern Technology)</Label>
                        <Input value={formData.speciality_label} onChange={(e) => setFormData({...formData, speciality_label: e.target.value})} disabled={loading} />
                    </div>
                    <div>
                        <Label>Heading Title</Label>
                        <Input value={formData.speciality_title} onChange={(e) => setFormData({...formData, speciality_title: e.target.value})} disabled={loading} />
                    </div>
                    <div>
                        <Label>Brief Description</Label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                            rows={3} 
                            value={formData.speciality_description} 
                            onChange={(e) => setFormData({...formData, speciality_description: e.target.value})} 
                            disabled={loading} 
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="mb-0 font-bold uppercase text-gray-400 text-xs">Feature Points</Label>
                        <button type="button" onClick={() => addArrayItem("speciality_points")} className="text-blue-600 hover:text-blue-700"><FiPlus /></button>
                    </div>
                    {formData.speciality_points?.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <Input value={item} onChange={(e) => handleArrayChange("speciality_points", i, e.target.value)} disabled={loading} />
                        <button type="button" onClick={() => removeArrayItem("speciality_points", i)} className="text-red-500"><FiTrash2 /></button>
                    </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Video Background Image</Label>
                <Input type="file" onChange={(e) => setVideoImg(e.target.files?.[0] || null)} disabled={loading} />
              </div>
              <div>
                <Label>Video URL (YouTube/MP4)</Label>
                <Input value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} disabled={loading} placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="is_active" className="mb-0 cursor-pointer text-sm font-bold">Activate this configuration on Home Page</Label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Discard Changes
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save About Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAboutSection;
