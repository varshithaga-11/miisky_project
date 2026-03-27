import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit, FiSearch } from "react-icons/fi";
import { getWebsiteReportList, deleteWebsiteReport, WebsiteReport } from "./websitereportapi";
import { getReportTypeList } from "../ReportType/reporttypeapi";
import AddWebsiteReport from "./AddWebsiteReport";
import EditWebsiteReport from "./EditWebsiteReport";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const WebsiteReportPage: React.FC = () => {
  const [reports, setReports] = useState<WebsiteReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reportTypes, setReportTypes] = useState<any[]>([]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWebsiteReportList(currentPage, pageSize, search);
      setReports(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  const fetchReportTypes = useCallback(async () => {
    try {
      const data = await getReportTypeList(1, 100);
      setReportTypes(data.results);
    } catch (error) {
      console.error("Failed to load report types");
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchReportTypes();
  }, [fetchReports, fetchReportTypes]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this report record permanently?")) return;
    try {
      await deleteWebsiteReport(id);
      toast.success("Record deleted!");
      fetchReports();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    generated: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <>
      <PageMeta title="System Feedback & Reports" description="Monitor and respond to website issues reported by users" />
      <PageBreadcrumb pageTitle="Website Reports" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
              <FiPlus /> Log New Report
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Report Identity</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type / Source</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Synchronizing reports matrix...</TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No reports detected</TableCell>
                </TableRow>
              ) : (
                reports.map((report, index) => (
                  <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div>
                           <div className="font-bold text-gray-900 text-theme-sm dark:text-white uppercase tracking-tight truncate max-w-[200px]">
                              {report.requested_by_name}
                           </div>
                           <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                              {report.requested_by_email}
                           </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 uppercase dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                           {reportTypes.find(t => t.id === report.report_type)?.name || "External Log"}
                         </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none ${
                          statusColors[report.status || "pending"] || statusColors.pending
                        }`}>
                            {report.status || "pending"}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => setEditingId(report.id!)}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(report.id!)}><FiTrash2 /></button>
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
        <AddWebsiteReport 
          onSuccess={() => fetchReports()} 
          onClose={() => setIsAddModalOpen(false)} 
          reportTypes={reportTypes}
        />
      )}

      {editingId && (
        <EditWebsiteReport 
          reportId={editingId} 
          onSuccess={() => fetchReports()} 
          onClose={() => setEditingId(null)} 
          reportTypes={reportTypes}
        />
      )}
    </>
  );
};

export default WebsiteReportPage;

