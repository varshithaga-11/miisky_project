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
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: "",
    designation: "",
    department: undefined,
    email: "",
    phone: "",
    bio: "",
    photo: "",
    linkedin_url: "",
    qualification: "",
    experience_years: 0,
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTeamMember(formData as TeamMember);
      toast.success("Team member onboarded!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Onboard New Team Member</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Full professional name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Designation</label>
            <input
              type="text"
              required
              value={formData.designation || ""}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Lead Researcher"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Department</label>
            <select
              value={formData.department || ""}
              onChange={(e) => setFormData({ ...formData, department: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="work-email@miisky.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Phone</label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedin_url || ""}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Qualifications</label>
            <input
              type="text"
              value={formData.qualification || ""}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Master's in Biomedical Engineering"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Professional Bio</label>
            <textarea
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={4}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Photo URL</label>
            <input
              type="url"
              value={formData.photo || ""}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Link to profile picture"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors">Visible on Website</span>
            </label>
          </div>

          <div className="md:col-span-2 flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
            >
              {loading ? "Onboarding..." : "Onboard Member"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMember;
