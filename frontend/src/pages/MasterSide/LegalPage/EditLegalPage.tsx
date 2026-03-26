import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateLegalPage, LegalPage } from "./legalpageapi";

interface Props {
  page: LegalPage;
  onSuccess: () => void;
  onClose: () => void;
}

const EditLegalPage: React.FC<Props> = ({ page, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<LegalPage>>(page);

  useEffect(() => {
    setFormData(page);
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLegalPage(page.id!, formData as any);
      toast.success("Legal page updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update legal page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Legal Page</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Type</label>
              <select
                required
                value={formData.page_type}
                onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="privacy_policy">Privacy Policy</option>
                <option value="terms_of_service">Terms of Service</option>
                <option value="cookie_policy">Cookie Policy</option>
                <option value="disclaimer">Disclaimer</option>
                <option value="refund_policy">Refund & Cancellation Policy</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (Full Text)</label>
            <textarea
              required
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 font-serif"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <input
                type="text"
                value={formData.version || ""}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Effective Date</label>
              <input
                type="date"
                value={formData.effective_date || ""}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Updated</label>
              <input
                type="date"
                value={formData.last_updated || ""}
                onChange={(e) => setFormData({ ...formData, last_updated: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span className="text-sm font-medium">Active (Visible on Website)</span>
          </label>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Updating..." : "Update Legal Page"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLegalPage;
