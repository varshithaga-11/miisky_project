import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBriefcase } from "react-icons/fi";
import { getJobListingList, deleteJobListing, JobListing } from "./joblistingapi";
import { getDepartmentList } from "../Department/departmentapi";
import AddJobListing from "./AddJobListing";
import EditJobListing from "./EditJobListing";

const JobListingPage: React.FC = () => {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobListingList(currentPage, pageSize, search);
      setListings(data.results);
      setTotalItems(data.count);
    } catch (error) {
      console.error("Error fetching job listings:", error);
      toast.error("Failed to load job listings");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartmentList(1, 100);
      setDepartments(data.results);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  }, []);

  useEffect(() => {
    fetchListings();
    fetchDepartments();
  }, [fetchListings, fetchDepartments]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this job listing?")) return;
    try {
      await deleteJobListing(id);
      toast.success("Job listing deleted!");
      fetchListings();
    } catch (error: any) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FiBriefcase className="text-blue-600" />
          Job Listings
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Job
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search job titles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Job Type</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading jobs...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">No job listings found.</td></tr>
              ) : (
                listings.map((job) => (
                  <tr key={job.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-900">{job.title}</td>
                    <td className="px-6 py-4 text-gray-600 border-x border-gray-50 uppercase text-[10px] font-bold tracking-tight">
                      {job.job_type?.replace("_", " ") || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {job.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(job.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(job.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/20">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold">{listings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-semibold">{totalItems}</span>
          </p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-30 hover:bg-white transition shadow-sm">Previous</button>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-30 hover:bg-white transition shadow-sm">Next</button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddJobListing 
          departments={departments}
          onSuccess={() => fetchListings()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditJobListing 
          id={editingId} 
          departments={departments}
          onSuccess={() => fetchListings()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default JobListingPage;
