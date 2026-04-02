import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createPatent, getMedicalDevices } from "./patentapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddPatent: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    title: "",
    patent_number: "",
    application_number: "",
    inventors: "",
    abstract: "",
    innovation_summary: "",
    technical_specifications: "",
    filing_date: "",
    grant_date: "",
    expiry_date: "",
    jurisdiction: "India",
    status: "filed",
    external_link: "",
    technology_area: "",
    device: "",
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
        if (val !== undefined && val !== null && val !== "") data.append(key, val.toString());
      });
      if (docFile) data.append("patent_document", docFile);

      await createPatent(data);
      toast.success("Patent added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add patent");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Add Patent Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Patent Title *</Label>
            <Input
              id="title"
              type="text"
              required
              placeholder="Full official patent title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patent_number">Patent / App Number</Label>
              <Input
                id="patent_number"
                type="text"
                value={formData.patent_number}
                onChange={(e) => setFormData({ ...formData, patent_number: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="inventors">Inventors</Label>
              <Input
                id="inventors"
                type="text"
                placeholder="Comma separated names..."
                value={formData.inventors}
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
                value={formData.filing_date}
                onChange={(date) => setFormData({ ...formData, filing_date: date })}
              />
            </div>
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                type="text"
                value={formData.jurisdiction}
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                disabled={loading}
              >
                <option value="filed">Filed</option>
                <option value="pending">Pending</option>
                <option value="granted">Granted</option>
                <option value="expired">Expired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

          <div>
            <Label htmlFor="innovation_summary">Innovation Summary</Label>
            <textarea
              id="innovation_summary"
              value={formData.innovation_summary}
              onChange={(e) => setFormData({ ...formData, innovation_summary: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm h-24 resize-none"
              placeholder="Elevate quality of life globally through leading-edge medical tech..."
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="technical_specifications">Technical Specifications</Label>
            <textarea
              id="technical_specifications"
              value={formData.technical_specifications}
              onChange={(e) => setFormData({ ...formData, technical_specifications: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm h-28 resize-none"
              placeholder="Describe biometric feedback loops, machine learning models, etc."
              disabled={loading}
            />
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="device">Linked Medical Device</Label>
              <select
                id="device"
                value={formData.device}
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                disabled={loading}
              >
                <option value="">Select Device (Optional)</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="patent_document">Patent Document (PDF)</Label>
              <div className="relative group overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all p-4 text-center">
                <input 
                  id="patent_document"
                  type="file" 
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400 font-bold text-xs truncate max-w-full">
                    {docFile ? docFile.name : "Attach Original PDF"}
                  </span>
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
              {loading ? "Adding..." : "Add Patent"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatent;
