import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createPatent, Patent, getMedicalDevices } from "./patentapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddPatent: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<Patent>>({
    title: "",
    patent_number: "",
    application_number: "",
    inventors: "",
    abstract: "",
    filing_date: "",
    grant_date: "",
    expiry_date: "",
    jurisdiction: "India",
    status: "filed",
    external_link: "",
    technology_area: "",
    device: undefined,
    is_active: true,
  });
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    getMedicalDevices().then(setDevices).catch(() => toast.error("Could not load devices"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) data.append(key, val.toString());
      });
      if (docFile) data.append("patent_document", docFile);

      await createPatent(data);
      toast.success("Patent filed successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add patent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] p-10 w-full max-w-3xl max-h-screen overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-4xl font-black text-blue-900 mb-8 tracking-tighter">New Patent Application</h2>
        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-blue-900 placeholder:text-blue-200"
              placeholder="Full official patent title..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Patent / App Number</label>
              <input
                type="text"
                value={formData.patent_number}
                onChange={(e) => setFormData({ ...formData, patent_number: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              />
            </div>
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Inventors</label>
              <input
                type="text"
                value={formData.inventors}
                onChange={(e) => setFormData({ ...formData, inventors: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
                placeholder="Comma separated names..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Filing Date</label>
              <input
                type="date"
                value={formData.filing_date}
                onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              />
            </div>
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Jurisdiction</label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              />
            </div>
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Current Status</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              >
                <option value="filed">Filed</option>
                <option value="pending">Pending</option>
                <option value="granted">Granted</option>
                <option value="expired">Expired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Linked Device</label>
              <select
                value={formData.device}
                onChange={(e) => setFormData({ ...formData, device: parseInt(e.target.value) || undefined })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              >
                <option value="">Select Medical Device (optional)</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Patent Document (PDF)</label>
              <div className="relative overflow-hidden bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="px-5 py-4 text-sm font-bold text-gray-400 truncate">{docFile ? docFile.name : "Attach original file..."}</div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-900 text-white font-black uppercase tracking-widest text-sm py-5 rounded-[1.25rem] shadow-2xl shadow-blue-200 hover:bg-blue-800 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Registering..." : "Record Patent"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-400 font-bold px-10 rounded-[1.25rem] hover:bg-red-50 hover:text-red-400 transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatent;
