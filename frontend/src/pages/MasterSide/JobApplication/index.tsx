import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getJobApplicationList, deleteJobApplication, JobApplication } from "./jobapplicationapi";
import { getJobListingList } from "../JobListing/joblistingapi";
import AddJobApplication from "./AddJobApplication";
import EditJobApplication from "./EditJobApplication";

const JobApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [jobListings, setJobListings] = useState<any[]>([]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobApplicationList(currentPage, pageSize, search);
      setApplications(data.results);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  const fetchJobListings = useCallback(async () => {
    try {
      const data = await getJobListingList(1, 100);
      setJobListings(data.results);
    } catch (error) {
      console.error("Failed to load job listings");
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchJobListings();
  }, [fetchApplications, fetchJobListings]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteJobApplication(id);
      toast.success("Deleted!");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> Add Application
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center gap-2">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="flex-1 outline-none" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr> : applications.length === 0 ? <tr><td colSpan={4} className="text-center py-4 text-gray-500">No applications</td></tr> : applications.map((app) => <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{app.applicant_name}</td>
                <td className="px-6 py-4">{app.email}</td>
                <td className="px-6 py-4"><span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{app.status || "new"}</span></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(app.id!)} className="text-blue-600 hover:text-blue-800"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(app.id!)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>)
              }
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddJobApplication 
          onSuccess={() => fetchApplications()} 
          onClose={() => setIsAddModalOpen(false)} 
          jobListings={jobListings}
        />
      )}

      {editingId && (
        <EditJobApplication 
          id={editingId} 
          onSuccess={() => fetchApplications()} 
          onClose={() => setEditingId(null)} 
          jobListings={jobListings}
        />
      )}
    </div>
  );
};

export default JobApplicationPage;
