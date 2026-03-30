import React, { useState } from "react";
import { toast } from "react-toastify";
import { createWebsiteReport, WebsiteReport } from "./websitereportapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  reportTypes: any[];
}

const AddWebsiteReport: React.FC<Props> = ({ onSuccess, onClose, reportTypes }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<WebsiteReport>>({
    requested_by_name: "",
    requested_by_email: "",
    report_type: undefined,
    message: "",
    status: "pending", 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createWebsiteReport(formData as WebsiteReport);
      toast.success("Website report added successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to add report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Add Website Report</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <Label htmlFor="requested_by_name">Requester Name *</Label>
            <Input
              id="requested_by_name"
              type="text"
              required
              placeholder="Full name of the requester"
              value={formData.requested_by_name || ""}
              onChange={(e) => setFormData({ ...formData, requested_by_name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="requested_by_email">Requester Email *</Label>
            <Input
              id="requested_by_email"
              type="email"
              required
              placeholder="email@example.com"
              value={formData.requested_by_email || ""}
              onChange={(e) => setFormData({ ...formData, requested_by_email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="report_type">Report Type *</Label>
            <select
              id="report_type"
              required
              value={formData.report_type || ""}
              onChange={(e) => setFormData({ ...formData, report_type: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm font-bold uppercase"
              disabled={loading}
            >
              <option value="">Select a report type...</option>
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <textarea
              id="message"
              required
              placeholder="Describe the issue or data request..."
              value={formData.message || ""}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-24 resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status || "pending"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              disabled={loading}
            >
              <option value="pending">Pending</option>
              <option value="generated">Generated</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWebsiteReport;
