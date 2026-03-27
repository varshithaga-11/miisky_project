import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateWebsiteReport, getWebsiteReportById, WebsiteReport } from "./websitereportapi";

interface Props {
  reportId: number;
  onSuccess: () => void;
  onClose: () => void;
  reportTypes: any[];
}

const EditWebsiteReport: React.FC<Props> = ({ reportId, onSuccess, onClose, reportTypes }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<WebsiteReport>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWebsiteReportById(reportId);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load report data");
      }
    };
    fetchData();
  }, [reportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateWebsiteReport(reportId, formData);
      toast.success("Report Manifest Recalibrated!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error("Recalibration Failed: Field mismatch detected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center text-gray-800">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Edit Report</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 leading-none">Modifying an established data transmission.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Requester</label>
            <input
              type="text"
              required
              value={formData.requested_by_name || ""}
              onChange={(e) => setFormData({ ...formData, requested_by_name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Email Channel</label>
            <input
              type="email"
              required
              value={formData.requested_by_email || ""}
              onChange={(e) => setFormData({ ...formData, requested_by_email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Report Schema</label>
            <select
              required
              value={formData.report_type || ""}
              onChange={(e) => setFormData({ ...formData, report_type: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold uppercase"
            >
              <option value="">Priority Hierarchy</option>
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Transmission Message</label>
            <textarea
              required
              value={formData.message || ""}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest leading-none">Operational Status</label>
            <select
              value={formData.status || "pending"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-xs font-bold uppercase"
            >
              <option value="pending">⏳ Pending Queue</option>
              <option value="generated">⚡ Data Generated</option>
              <option value="failed">❌ System Failure</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all focus:ring-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? "Recalibrating..." : "Commit Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWebsiteReport;
