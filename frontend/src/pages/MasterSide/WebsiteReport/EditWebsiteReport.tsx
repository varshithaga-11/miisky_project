import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateWebsiteReport, getWebsiteReportById, WebsiteReport } from "./websitereportapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  reportTypes: any[];
}

const EditWebsiteReport: React.FC<Props> = ({ id, onSuccess, onClose, reportTypes }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<WebsiteReport>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getWebsiteReportById(id);
        setFormData(data);
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
      await updateWebsiteReport(id, formData);
      toast.success("Report updated!");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 text-center">Manage Report #{id}</h2>
        
        {fetching ? (
          <div className="py-12 text-center text-gray-500 font-medium italic">Loading report details...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Requester Name</label>
              <input
                type="text"
                required
                value={formData.requested_by_name || ""}
                onChange={(e) => setFormData({ ...formData, requested_by_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Requester Email</label>
              <input
                type="email"
                required
                value={formData.requested_by_email || ""}
                onChange={(e) => setFormData({ ...formData, requested_by_email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Issue Type</label>
              <select
                required
                value={formData.report_type || ""}
                onChange={(e) => setFormData({ ...formData, report_type: parseInt(e.target.value) || undefined })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Type</option>
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Message Content</label>
              <textarea
                required
                value={formData.message || ""}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Status Update</label>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-blue-700 bg-blue-50/50"
              >
                <option value="new">🆕 New</option>
                <option value="in_progress">⚙️ In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-3.5 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
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

export default EditWebsiteReport;
