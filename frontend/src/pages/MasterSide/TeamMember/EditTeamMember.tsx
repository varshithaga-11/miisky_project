import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateTeamMember, getTeamMemberById, TeamMember } from "./teammemberapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  departments: any[];
}

const EditTeamMember: React.FC<Props> = ({ id, onSuccess, onClose, departments }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getTeamMemberById(id);
        // Remove photo from formData to avoid sending string URL back as file
        const { photo, ...rest } = data;
        setFormData({ ...rest, photo_url: photo });
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'photo_url') {
          data.append(key, value.toString());
        }
      });
      
      if (photoFile) {
        data.append("photo", photoFile);
      }

      await updateTeamMember(id, data as any);
      toast.success("Profile recalibrated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error("Recalibration failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Edit Member</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 leading-none">Updating the persona of a Miisky Svasth talent.</p>
        </div>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Profile Data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Identity / Full Name</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
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
                 <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <img 
                      src={photoFile ? URL.createObjectURL(photoFile) : (formData.photo_url as string)} 
                      alt="preview" 
                      className="w-full h-full object-cover" 
                    />
                 </div>
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
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                />
                <span className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Visible Manifest</span>
              </label>
            </div>

            <div className="md:col-span-2 flex gap-4 pt-6 border-t mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 rounded-xl border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all focus:ring-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] px-8 py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? "Recalibrating..." : "Commit Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditTeamMember;
