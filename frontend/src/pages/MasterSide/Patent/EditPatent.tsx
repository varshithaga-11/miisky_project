import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updatePatent, Patent, getMedicalDevices } from "./patentapi";

interface Props {
  patent: Patent;
  onSuccess: () => void;
  onClose: () => void;
}

const EditPatent: React.FC<Props> = ({ patent, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<Patent>>(patent);
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData(patent);
    getMedicalDevices().then(setDevices).catch(() => toast.error("Could not load devices"));
  }, [patent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null && key !== "patent_document") {
          data.append(key, val.toString());
        }
      });
      if (docFile) data.append("patent_document", docFile);

      await updatePatent(patent.id!, data);
      toast.success("Patent updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update patent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-10 w-full max-w-3xl max-h-screen overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        <h2 className="text-4xl font-black text-blue-900 mb-8 tracking-tighter">Edit IP Record</h2>
        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-blue-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Patent Number</label>
              <input
                type="text"
                value={formData.patent_number || ""}
                onChange={(e) => setFormData({ ...formData, patent_number: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              />
            </div>
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Inventors</label>
              <input
                type="text"
                value={formData.inventors || ""}
                onChange={(e) => setFormData({ ...formData, inventors: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 text-xs font-sans">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Filing Date</label>
              <input
                type="date"
                value={formData.filing_date || ""}
                onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700"
              />
            </div>
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Jurisdiction</label>
              <input
                type="text"
                value={formData.jurisdiction || ""}
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
                value={formData.device || ""}
                onChange={(e) => setFormData({ ...formData, device: parseInt(e.target.value) || undefined })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-4 ring-blue-100 transition-all font-bold text-gray-700 text-sm"
              >
                <option value="">Select Medical Device (optional)</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-4 text-xs">
              <label className="block font-black text-gray-400 uppercase tracking-widest pl-1">Document Attachment</label>
              <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-dashed border-blue-900/10 hover:border-blue-900/30 transition-all">
                <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="flex items-center justify-between px-5 py-4 text-sm font-bold text-blue-900/40">
                  <span className="truncate max-w-[12rem]">{docFile ? docFile.name : patent.patent_document ? "Change existing document" : "Attach original file..."}</span>
                  {patent.patent_document && !docFile && <span className="bg-blue-900/10 px-2 py-1 rounded text-[10px] text-blue-900 font-black tracking-widest">FIXED</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-900 text-white font-black uppercase tracking-widest text-sm py-5 rounded-[1.25rem] shadow-2xl shadow-blue-200 hover:bg-black transition-all"
            >
              {loading ? "Persisting..." : "Update Application"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-10 bg-white border border-gray-100 text-gray-400 font-bold rounded-[1.25rem] hover:bg-gray-50 transition-all active:scale-95"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatent;
