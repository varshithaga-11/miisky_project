import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiSearch, FiUserPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import Button from "../../../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllNutritionists,
  getMappingSummary,
  getUnmappedPatients,
  getGroupedMappings,
  MappingRecord,
  SimpleUser,
} from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../components/ui/table";
import AssignNutritionistModal from "./AssignNutritionistModal";
import ReassignNutrition from "./ReassignNutrition";

const UserNutritionMappingPage: React.FC = () => {
  const [records, setRecords] = useState<MappingRecord[]>([]);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Data for dependencies/dropdowns
  const [unmappedPatients, setUnmappedPatients] = useState<SimpleUser[]>([]);
  const [nutritionists, setNutritionists] = useState<SimpleUser[]>([]);
  const [mappings, setMappings] = useState<any[]>([]); // For reassign modal

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [allotmentFilter, setAllotmentFilter] = useState("");
  const [mappingStatus, setMappingStatus] = useState<"all" | "mapped" | "unmapped">("all");
  const [selectedNutritionistId, setSelectedNutritionistId] = useState<string>("all");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        mapping_status: mappingStatus !== "all" ? mappingStatus : undefined,
        nutritionist_id: selectedNutritionistId !== "all" ? selectedNutritionistId : undefined,
        allotted_by: allotmentFilter || undefined,
      };

      const res = await getMappingSummary(params);
      setRecords(res.results);
      setCount(res.count);
      setTotalPages(res.total_pages ?? Math.max(1, Math.ceil(res.count / pageSize)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mapping records");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data (nutritionists for filter, unmapped for assign modal, all mappings for reassign modal)
  const fetchAuxiliaryData = async () => {
     try {
       const [nutsRes, unmappedRes, groupedRes] = await Promise.all([
         getAllNutritionists(),
         getUnmappedPatients(),
         getGroupedMappings(),
       ]);
       setNutritionists(nutsRes);
       setUnmappedPatients(unmappedRes);
       setMappings(groupedRes);
     } catch (err) {
       console.error(err);
     }
  };

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  // Fetch summary records when filters, page size, or page changes
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, debouncedSearch, mappingStatus, selectedNutritionistId, allotmentFilter]);

  // Reset page to 1 when filters change (page size resets page in its select handler)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, mappingStatus, selectedNutritionistId, allotmentFilter]);

  const handleAssignSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  const handleReassignSuccess = () => {
    setIsReassignOpen(false);
    fetchData();
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="User–Nutritionist Mapping" description="Map patients to nutritionists" />
      <PageBreadcrumb pageTitle="User–Nutritionist Mapping" />

      <div className="mb-6 space-y-4">
        {/* Filters Row 1: Search & Allotted By */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient/nut/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by Allotted By..."
                value={allotmentFilter}
                onChange={(e) => setAllotmentFilter(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button size="sm" variant="outline" className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2" onClick={() => setIsReassignOpen(true)}>
              <FiRefreshCw className="w-4 h-4" />
              Reassign
            </Button>
            <Button size="sm" className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20" onClick={() => setIsModalOpen(true)}>
              <FiUserPlus className="w-4 h-4" />
              Assign
            </Button>
          </div>
        </div>

        {/* Filters Row 2: Status & Nutritionist Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
          <select
            value={mappingStatus}
            onChange={(e) => setMappingStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="all">All Mapping Status</option>
            <option value="mapped">Mapped Patients</option>
            <option value="unmapped">Unmapped Patients</option>
          </select>

          <select
            value={selectedNutritionistId}
            onChange={(e) => setSelectedNutritionistId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="all">Select Specific Nutritionist...</option>
            {nutritionists.map(n => (
              <option key={n.id} value={n.id}>
                {n.first_name || n.last_name ? `${n.first_name || ""} ${n.last_name || ""}` : n.username} ({n.username})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400 px-1">
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            Total: {count}
            {count > 0 && (
              <span className="text-gray-400 dark:text-gray-500">
                {" "}
                · Page {currentPage} of {Math.max(1, totalPages)} · {pageSize} per page
              </span>
            )}
          </span>
          <label className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            <span className="text-gray-600 dark:text-gray-300">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 px-1.5 py-0.5 text-gray-800 dark:text-white"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {(searchTerm || allotmentFilter || mappingStatus !== "all" || selectedNutritionistId !== "all") && (
            <button 
              onClick={() => { 
                setSearchTerm(""); 
                setAllotmentFilter(""); 
                setMappingStatus("all");
                setSelectedNutritionistId("all");
              }}
              className="text-blue-600 hover:underline ml-2 text-xs"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Patient</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Nutritionist</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Allotted By</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                      Loading mapping records...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                      {searchTerm ? "No matching records found." : "No patient records available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r, idx) => (
                    <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <TableCell className="px-5 py-4 text-xs text-gray-500">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 dark:text-white/90">
                            {r.first_name || r.last_name ? `${r.first_name || ""} ${r.last_name || ""}` : r.username}
                          </span>
                          <span className="text-[11px] text-gray-500">{r.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.is_mapped ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {r.nutritionist_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                        {r.allotted_by_name || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && count > 0 && totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, count)} of {count} (limit {pageSize})
            </div>
          </div>
        )}
      </div>

      {isReassignOpen && (
        <ReassignNutrition
          onClose={() => setIsReassignOpen(false)}
          onSuccess={handleReassignSuccess}
          allotments={mappings}
        />
      )}

      {isModalOpen && (
        <AssignNutritionistModal
          onClose={() => setIsModalOpen(false)}
          onAssign={handleAssignSuccess}
          unmappedPatients={unmappedPatients}
        />
      )}
    </>
  );
};

export default UserNutritionMappingPage;
