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
    portfolio_url: "",
    linkedin_url: "",
    current_ctc: "",
    expected_ctc: "",
    notice_period: "",
    years_of_experience: undefined,
    status: "applied",
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.job) {
        toast.error("Please select a job listing");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("job", String(formData.job));
      data.append("applicant_name", formData.applicant_name || "");
      data.append("email", formData.email || "");
      data.append("phone", formData.phone || "");
      data.append("cover_letter", formData.cover_letter || "");
      data.append("status", formData.status || "applied");
      data.append("portfolio_url", formData.portfolio_url || "");
      data.append("linkedin_url", formData.linkedin_url || "");
      data.append("current_ctc", formData.current_ctc || "");
      data.append("expected_ctc", formData.expected_ctc || "");
      data.append("notice_period", formData.notice_period || "");
      if (formData.years_of_experience !== undefined) {
        data.append("years_of_experience", String(formData.years_of_experience));
      }
      if (resumeFile) {
        data.append("resume", resumeFile);
      }

      await createJobApplication(data);
      toast.success("Job application added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[95vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Add Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                type="number"
                step="0.5"
                placeholder="e.g. 3.5"
                value={formData.years_of_experience || ""}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseFloat(e.target.value) || undefined })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_url || ""}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                type="url"
                placeholder="https://john.dev"
                value={formData.portfolio_url || ""}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="current_ctc">Current CTC</Label>
              <Input
                id="current_ctc"
                type="text"
                placeholder="e.g. 10 LPA"
                value={formData.current_ctc || ""}
                onChange={(e) => setFormData({ ...formData, current_ctc: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="expected_ctc">Expected CTC</Label>
              <Input
                id="expected_ctc"
                type="text"
                placeholder="e.g. 15 LPA"
                value={formData.expected_ctc || ""}
                onChange={(e) => setFormData({ ...formData, expected_ctc: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="notice_period">Notice Period</Label>
              <Input
                id="notice_period"
                type="text"
                placeholder="e.g. 30 Days"
                value={formData.notice_period || ""}
                onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="resume">Resume (PDF)</Label>
            <input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              disabled={loading}
            />
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
