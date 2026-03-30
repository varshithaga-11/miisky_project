import React, { useState } from "react";
import { toast } from "react-toastify";
import { createJobListing, JobListing } from "./joblistingapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  departments: any[];
}

const AddJobListing: React.FC<Props> = ({ onSuccess, onClose, departments }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<JobListing>>({
    title: "",
    short_description: "",
    application_form_link: "",
    job_description: "",
    requirements: "",
    location: "",
    salary_range: "",
    job_type: "full_time",
    department: undefined,
    is_active: true,
    experience_required: "",
    qualification_required: "",
    openings: 0,
    responsibilities: "",
    benefits: "",
    application_deadline: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createJobListing(formData as JobListing);
      toast.success("Job listing added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add job listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl relative max-h-[95vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Job Listing</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <select
              id="department"
              required
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
            <Label htmlFor="job_type">Job Type</Label>
            <select
              id="job_type"
              value={formData.job_type || ""}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              disabled={loading}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="experience_required">Experience Required</Label>
            <Input
              id="experience_required"
              type="text"
              value={formData.experience_required || ""}
              onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="salary_range">Salary Range</Label>
            <Input
              id="salary_range"
              type="text"
              value={formData.salary_range || ""}
              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="openings">Number of Openings</Label>
            <Input
              id="openings"
              type="number"
              value={formData.openings || 0}
              onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 0 })}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="short_description">Short Description</Label>
            <textarea
              id="short_description"
              value={formData.short_description || ""}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              rows={2}
              placeholder="Brief summary for list views..."
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="application_form_link">Application Form Link (External)</Label>
            <Input
              id="application_form_link"
              type="text"
              value={formData.application_form_link || ""}
              onChange={(e) => setFormData({ ...formData, application_form_link: e.target.value })}
              placeholder="https://forms.gle/..."
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="job_description">Full Job Description *</Label>
            <textarea
              id="job_description"
              required
              value={formData.job_description || ""}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="requirements">Requirements / Qualifications</Label>
            <textarea
              id="requirements"
              value={formData.requirements || ""}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="application_deadline">Application Deadline</Label>
            <Input
              id="application_deadline"
              type="date"
              value={formData.application_deadline || ""}
              onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
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
            <Label htmlFor="is_active" className="mb-0 cursor-pointer">Active / Published</Label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Discard
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Publish Job Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobListing;
