import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateJobApplication, getJobApplicationById, JobApplication } from "./jobapplicationapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  jobListings: any[];
}

const EditJobApplication: React.FC<Props> = ({ id, onSuccess, onClose, jobListings }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<JobApplication>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getJobApplicationById(id);
        setFormData({
            job: data.job,
            applicant_name: data.applicant_name,
            email: data.email,
            phone: data.phone,
            status: data.status,
            cover_letter: data.cover_letter
        });
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
      await updateJobApplication(id, formData);
      toast.success("Updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Edit Job Application</h2>
        
        {fetching ? (
          <div className="py-10 text-center text-gray-500 font-medium">Loading data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Job Listing</label>
              <select
                required
                value={formData.job || ""}
                onChange={(e) =>
                  setFormData({ ...formData, job: parseInt(e.target.value) || undefined })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Job</option>
                {jobListings.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Applicant Name</label>
              <input
                type="text"
                required
                value={formData.applicant_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, applicant_name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={formData.status || ""}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="applied">Applied</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Cover Letter</label>
              <textarea
                value={formData.cover_letter || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cover_letter: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={3}
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-md mt-2"
              >
                {loading ? "Saving..." : "Update Application"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-2.5 rounded-lg hover:bg-gray-50 active:scale-95 transition-all mt-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditJobApplication;
