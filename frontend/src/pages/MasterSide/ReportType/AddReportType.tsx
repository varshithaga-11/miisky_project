import React, { useState } from "react";
import { toast } from "react-toastify";
import { createReportType, ReportType } from "./reporttypeapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddReportType: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ReportType>>({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReportType(formData as ReportType);
      toast.success("Classification schema updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add report type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl relative border border-gray-100">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight uppercase tracking-widest text-lg">Define Reporting Logic</h2>
          <p className="text-gray-500 text-xs mt-1 font-bold uppercase tracking-wider">Establish a new classification for system reports and analytics.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest leading-none">Schema Identifier</label>
            <input
              type="text"
              required
              placeholder="e.g. Clinical Incident Report"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-gray-700"
            />
          </div>

          <div className="mb-8">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest leading-none">Logic Definition</label>
            <textarea
              placeholder="Detailed description of the reporting requirements..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-black active:scale-[0.98] transition-all shadow-xl"
            >
              {loading ? "Establishing..." : "Save Schema"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-100 text-gray-400 font-bold py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportType;
