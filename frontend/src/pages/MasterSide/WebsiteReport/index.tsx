import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getWebsiteReportList, deleteWebsiteReport, WebsiteReport } from "./websitereportapi";
import { getReportTypeList } from "../ReportType/reporttypeapi";
import AddWebsiteReport from "./AddWebsiteReport";
import EditWebsiteReport from "./EditWebsiteReport";

const WebsiteReportPage: React.FC = () => {
  const [reports, setReports] = useState<WebsiteReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reportTypes, setReportTypes] = useState<any[]>([]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWebsiteReportList(1, 100, search);
      setReports(data.results);
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [search]);

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
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    generated: "bg-green-100 text-green-700 border-green-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Feedback & Reports</h1>
            <p className="text-gray-500 mt-1">Monitor and respond to website issues reported by users.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
          >
            <FiPlus strokeWidth={3} /> Log New Report
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-white flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search reports by requester name or email..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-gray-700 transition-all outline-none placeholder:text-gray-400" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Report Identity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Source</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && reports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400 italic">Synchronizing reports database...</td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FiSearch size={32} />
                        </div>
                        <p className="text-xl font-bold text-gray-400">No active reports</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{report.requested_by_name}</div>
                        <div className="text-xs text-gray-500 font-medium lowercase tracking-tight">{report.requested_by_email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                          {reportTypes.find(t => t.id === report.report_type)?.name || "External Log"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold border leading-none transition-all ${
                          statusColors[report.status || "pending"] || statusColors.pending
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                             report.status === "generated" ? "bg-green-500" : report.status === "failed" ? "bg-red-500" : "bg-yellow-500"
                          }`}></span>
                          {(report.status || "pending").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setEditingId(report.id!)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-50"
                            title="Edit Report"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(report.id!)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-50"
                            title="Remove Permanently"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default WebsiteReportPage;
