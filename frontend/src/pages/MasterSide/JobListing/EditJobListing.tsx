import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateJobListing, getJobListingById, JobListing } from "./joblistingapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  departments: any[];
}

const EditJobListing: React.FC<Props> = ({ id, onSuccess, onClose, departments }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<JobListing>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getJobListingById(id);
        setFormData({
            title: data.title,
            department: data.department,
            job_type: data.job_type,
            location: data.location,
            salary_range: data.salary_range,
            job_description: data.job_description,
            requirements: data.requirements,
            is_active: data.is_active,
            experience_required: data.experience_required,
            qualification_required: data.qualification_required,
            openings: data.openings,
            short_description: data.short_description,
            tagline: data.tagline,
            expertise_text: data.expertise_text,
            detailed_description: data.detailed_description,
            application_form_link: data.application_form_link,
            responsibilities: data.responsibilities,
            benefits: data.benefits,
            application_deadline: data.application_deadline
        });
      } catch (error) {
        toast.error("Failed to load job listing data");
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
      await updateJobListing(id, formData);
      toast.success("Job listing updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update job listing");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Job Listing</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400">Loading job listing data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <Label htmlFor="short_description">Short Description (for Listing Page)</Label>
              <textarea
                id="short_description"
                value={formData.short_description || ""}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={2}
                placeholder="Brief summary shown on the careers list page..."
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tagline">Job/Department Tagline</Label>
              <Input
                id="tagline"
                type="text"
                value={formData.tagline || ""}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                disabled={loading}
                placeholder="e.g. Healthcare Expert / Professional Expertise"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="expertise_text">Expertise Overview</Label>
              <textarea
                id="expertise_text"
                value={formData.expertise_text || ""}
                onChange={(e) => setFormData({ ...formData, expertise_text: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={3}
                disabled={loading}
                placeholder="Medical professionals include doctors, nurses, pharmacists..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="detailed_description">Detailed Scope & Research</Label>
              <textarea
                id="detailed_description"
                value={formData.detailed_description || ""}
                onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={4}
                disabled={loading}
                placeholder="Their practitioners use a range of techniques and technologies..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="responsibilities">Core Responsibilities</Label>
              <textarea
                id="responsibilities"
                value={formData.responsibilities || ""}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={4}
                disabled={loading}
                placeholder="We are looking for a Data Scientist..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="requirements">Requirements & Skills</Label>
              <textarea
                id="requirements"
                value={formData.requirements || ""}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={3}
                disabled={loading}
                placeholder="e.g. bsc tholvi..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="benefits">What We Offer</Label>
              <textarea
                id="benefits"
                value={formData.benefits || ""}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={3}
                disabled={loading}
                placeholder="Competitive salary and benefits..."
              />
            </div>

            <div>
               <Label htmlFor="qualification_required">Education Required</Label>
               <Input
                 id="qualification_required"
                 type="text"
                 value={formData.qualification_required || ""}
                 onChange={(e) => setFormData({ ...formData, qualification_required: e.target.value })}
                 placeholder="e.g. Bachelor's or Higher"
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
              <Label htmlFor="job_description">Full Job Description (Internal Notes)</Label>
              <textarea
                id="job_description"
                required
                value={formData.job_description || ""}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={3}
                disabled={loading}
              />
            </div>

            <div>
              <DatePicker2
                id="application_deadline"
                label="Application Deadline"
                value={formData.application_deadline || ""}
                onChange={(date) => setFormData({ ...formData, application_deadline: date })}
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
              <Label htmlFor="is_active" className="mb-0 cursor-pointer">Live / Active</Label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Discard
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Job Listing"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditJobListing;
