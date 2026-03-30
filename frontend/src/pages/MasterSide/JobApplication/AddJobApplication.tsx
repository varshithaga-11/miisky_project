import React, { useState } from "react";
import { toast } from "react-toastify";
import { createJobApplication, JobApplication } from "./jobapplicationapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  jobListings: any[];
}

const AddJobApplication: React.FC<Props> = ({ onSuccess, onClose, jobListings }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    job: undefined,
    applicant_name: "",
    email: "",
    phone: "",
    cover_letter: "",
    status: "applied",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.job) {
        toast.error("Please select a job listing");
        setLoading(false);
        return;
      }
      await createJobApplication(formData as JobApplication);
      toast.success("Job application added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Add Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="job">Job Listing *</Label>
            <select
              id="job"
              required
              value={formData.job || ""}
              onChange={(e) => setFormData({ ...formData, job: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm font-bold"
              disabled={loading}
            >
              <option value="">Select Job Position</option>
              {jobListings.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="applicant_name">Applicant Name *</Label>
            <Input
              id="applicant_name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.applicant_name || ""}
              onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
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
                placeholder="+1 234 567 890"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Application Status</Label>
            <select
              id="status"
              value={formData.status || ""}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400 text-sm font-bold uppercase tracking-widest"
              disabled={loading}
            >
              <option value="applied">Applied</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <Label htmlFor="cover_letter">Cover Letter / Notes</Label>
            <textarea
              id="cover_letter"
              placeholder="Tell us about the applicant..."
              value={formData.cover_letter || ""}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-24 resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobApplication;
