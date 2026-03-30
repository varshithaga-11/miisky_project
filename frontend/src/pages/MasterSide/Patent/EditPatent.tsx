import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updatePatent, Patent, getMedicalDevices } from "./patentapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";

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
      toast.success("Patent updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update patent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Edit Patent Record</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Patent Title *</Label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patent_number">Patent Number</Label>
              <Input
                id="patent_number"
                type="text"
                value={formData.patent_number || ""}
                onChange={(e) => setFormData({ ...formData, patent_number: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="inventors">Inventors</Label>
              <Input
                id="inventors"
                type="text"
                value={formData.inventors || ""}
                onChange={(e) => setFormData({ ...formData, inventors: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <DatePicker2
                id="filing_date"
                label="Filing Date"
                value={formData.filing_date || ""}
                onChange={(date) => setFormData({ ...formData, filing_date: date })}
              />
            </div>
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                type="text"
                value={formData.jurisdiction || ""}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="status">Current Status *</Label>
              <select
                id="status"
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm font-bold"
                disabled={loading}
              >
                <option value="filed">Filed</option>
                <option value="pending">Pending</option>
                <option value="granted">Granted</option>
                <option value="expired">Expired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="device">Linked Medical Device</Label>
              <select
                id="device"
                value={formData.device || ""}
                onChange={(e) => setFormData({ ...formData, device: parseInt(e.target.value) || undefined })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                disabled={loading}
              >
                <option value="">Select Medical Device (optional)</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="patent_document">Document Attachment</Label>
              <div className="relative group overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all p-4 text-center">
                <input 
                  id="patent_document"
                  type="file" 
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-[12rem]">{docFile ? docFile.name : patent.patent_document ? "Change existing document" : "Attach original file..."}</span>
                  {patent.patent_document && !docFile && <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">Fixed Asset</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="is_active" className="mb-0 cursor-pointer">Live on Website</Label>
          </div>

          <div className="flex gap-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Updating..." : "Update Patent"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatent;
