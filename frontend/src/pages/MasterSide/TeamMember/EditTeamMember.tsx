import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateTeamMember, getTeamMemberById, TeamMember } from "./teammemberapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

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
      toast.success("Profile updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Team Member</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400">Loading profile data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  type="text"
                  required
                  value={formData.designation || ""}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: parseInt(e.target.value) || undefined })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-12 h-12 rounded border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 transition-opacity duration-300">
                      <img 
                        src={photoFile ? URL.createObjectURL(photoFile) : (formData.photo_url as string)} 
                        alt="preview" 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   <span className="text-xs text-gray-400">Current photo</span>
                </div>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="py-1.5"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="is_active" className="mb-0 cursor-pointer">Visible Profile</Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_doctor"
                    checked={formData.is_doctor || false}
                    onChange={(e) => setFormData({ ...formData, is_doctor: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="is_doctor" className="mb-0 cursor-pointer">Specialist (Doctor)</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Member"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditTeamMember;
