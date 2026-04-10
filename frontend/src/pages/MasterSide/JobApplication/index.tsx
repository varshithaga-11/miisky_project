import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { FiPlus, FiTrash2, FiEdit, FiSearch, FiFileText } from "react-icons/fi";
import { getJobApplicationList, deleteJobApplication, JobApplication } from "./jobapplicationapi";
import { getJobListingList } from "../JobListing/joblistingapi";
import AddJobApplication from "./AddJobApplication";
import EditJobApplication from "./EditJobApplication";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const JobApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobApplicationList(currentPage, pageSize, search);
      setApplications(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
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

  const handleDelete = (id: number) => {
    setIdToDelete(id);
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteJobApplication(idToDelete);
      toast.success("Application deleted successfully!");
      setIdToDelete(null);
      fetchApplications();
    } catch (error) {
      toast.error("Failed to delete application.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusStyle = (status: string = "new") => {
    switch (status.toLowerCase()) {
      case "reviewed": return "bg-blue-50 text-blue-600 dark:bg-blue-900/30";
      case "shortlisted": return "bg-green-50 text-green-600 dark:bg-green-900/30";
      case "rejected": return "bg-red-50 text-red-600 dark:bg-red-900/30";
      default: return "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30";
    }
  };

  return (
    <>
      <PageMeta title="Recruitment Pipeline" description="Manage candidate applications and hiring workflow" />
      <PageBreadcrumb pageTitle="Job Applications" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button 
                size="sm" 
                className="inline-flex items-center gap-2"
                onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus /> Add application
            </Button>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                ]}
                className="w-20"
              />
              <span className="text-sm text-gray-400 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
           <div>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Applicant Details</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Target Role</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Exp.</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pipeline Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Documents</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Loading talent pool...</TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No applications found</TableCell>
                </TableRow>
              ) : (
                applications.map((app, index) => (
                  <TableRow key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-theme-sm dark:text-white uppercase tracking-tight">{app.applicant_name}</span>
                            <span className="text-xs text-gray-400 lowercase">{app.email}</span>
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 uppercase tracking-tight dark:bg-indigo-900/30">
                            {jobListings.find(j => j.id === app.job)?.title || "General Application"}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 dark:bg-gray-800 dark:text-gray-300">
                            {app.years_of_experience || 0} Yrs
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                            {app.status || "New"}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        {app.resume ? (
                           <a href={app.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50/50">
                             <FiFileText /> RESUME
                           </a>
                        ) : (
                           <span className="text-gray-400 italic text-[10px]">NO RESUME</span>
                        )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => setEditingId(app.id!)}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(app.id!)}><FiTrash2 /></button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
           <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

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

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Job Application?"
        message="Are you sure you want to permanently delete this job application record? This action cannot be undone."
        confirmText="Delete Application"
      />
    </>
  );
};

export default JobApplicationPage;

