import React, { useState } from "react";
import { toast } from "react-toastify";
import { createTeamMember, TeamMember } from "./teammemberapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  departments: any[];
}

const AddTeamMember: React.FC<Props> = ({ onSuccess, onClose, departments }) => {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: "",
    designation: "",
    department: undefined,
    email: "",
    phone: "",
    bio: "",
    linkedin_url: "",
    qualification: "",
    experience_years: 0,
    position: 1,
    is_doctor: false,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      
      if (photoFile) {
        data.append("photo", photoFile);
      }

      await createTeamMember(data as any);
      toast.success("Team member onboarded successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error("Failed to onboard team member. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Member <span className="text-blue-600">Onboarding</span></h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Integrating new talent into the Miisky Svasth ecosystem.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Identity / Full Name</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
              placeholder="e.g. Dr. Sarah Jenkins"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Designation</label>
            <input
              type="text"
              required
              value={formData.designation || ""}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
              placeholder="Chief Data Scientist"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Division / Dept</label>
            <select
              value={formData.department || ""}
              onChange={(e) => setFormData({ ...formData, department: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold uppercase"
            >
              <option value="">Station Assignment</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Communication / Email</label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-mono"
              placeholder="sarah@miisky.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Contact / Phone</label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Identity Manifest / Profile Photo</label>
            <div className="flex items-center gap-4">
               {photoFile && (
                 <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(photoFile)} alt="preview" className="w-full h-full object-cover" />
                 </div>
               )}
               <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="block w-full text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Professional Manifest / Bio</label>
            <textarea
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs h-24 resize-none"
              placeholder="Professional journey synopsis..."
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              />
              <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Visible Manifest</span>
            </label>
          </div>

          <div className="flex items-center">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_doctor || false}
                onChange={(e) => setFormData({ ...formData, is_doctor: e.target.checked })}
                className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              />
              <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Specialist Identity (Doctor)</span>
            </label>
          </div>

          <div className="md:col-span-2 flex gap-4 pt-6 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-xl border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all focus:ring-0"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-8 py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Materializing..." : "Initiate Onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMember;
