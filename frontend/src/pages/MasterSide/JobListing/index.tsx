import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit, FiSearch } from "react-icons/fi";
import { getJobListingList, deleteJobListing, JobListing } from "./joblistingapi";
import { getDepartmentList } from "../Department/departmentapi";
import AddJobListing from "./AddJobListing";
import EditJobListing from "./EditJobListing";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const JobListingPage: React.FC = () => {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobListingList(currentPage, pageSize, search);
      setListings(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
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
    <>
      <PageMeta title="Job Listing Management" description="Manage job vacancies efficiently" />
      <PageBreadcrumb pageTitle="Job Listings" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search job titles..."
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
              <FiPlus /> Add Job
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Job Title</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Department</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Job Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Loading listings...</TableCell>
                </TableRow>
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No job listings found</TableCell>
                </TableRow>
              ) : (
                listings.map((job, index) => (
                  <TableRow key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-bold text-gray-900 text-theme-sm dark:text-white">
                        {job.title}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                           {departments.find(d => d.id === job.department)?.name || "-"}
                         </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                        {job.job_type?.replace("_", " ")}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.is_active ? "bg-green-50 text-green-600 dark:bg-green-900/30" : "bg-red-50 text-red-600 dark:bg-red-900/30"
                        }`}>
                            {job.is_active ? "Active" : "Inactive"}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => setEditingId(job.id!)}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(job.id!)}><FiTrash2 /></button>
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
    </>
  );
};

export default JobListingPage;

