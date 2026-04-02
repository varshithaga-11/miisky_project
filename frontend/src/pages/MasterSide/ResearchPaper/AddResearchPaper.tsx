import React, { useState } from "react";
import { toast } from "react-toastify";
import { createResearchPaper, ResearchPaper } from "./researchpapeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddResearchPaper: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ResearchPaper>>({
    title: "",
    authors: "",
    abstract: "",
    publication_date: "",
    published_date: "",
    document: "",
    position: 0,
    is_active: true,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [document1File, setDocument1File] = useState<File | null>(null);
  const [document2File, setDocument2File] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && key !== "document") data.append(key, val.toString());
      });
      if (pdfFile) data.append("document", pdfFile);
      if (document1File) data.append("document_1", document1File);
      if (document2File) data.append("document_2", document2File);

      await createResearchPaper(data as any);
      toast.success("Research paper added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add research paper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Add Research Paper</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Paper Title *</Label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Full title of the paper"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="authors">Authors</Label>
            <Input
              id="authors"
              type="text"
              value={formData.authors || ""}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              placeholder="e.g. Dr. June Smith, R. Williams"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <DatePicker2
                id="published_date"
                label="Published Date"
                value={formData.published_date || ""}
                onChange={(date) => setFormData({ ...formData, published_date: date })}
              />
            </div>
            <div>
              <Label htmlFor="position">Sort Order</Label>
              <Input
                id="position"
                type="number"
                value={formData.position || 0}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="abstract">Paper Abstract</Label>
            <textarea
              id="abstract"
              value={formData.abstract || ""}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-24 resize-none"
              placeholder="Summary of the research findings"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="document">Research Document *</Label>
            <div className="relative group overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all p-6 text-center">
              <input 
                id="document"
                type="file" 
                required
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                disabled={loading}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-bold text-xs truncate max-w-full">
                  {pdfFile ? pdfFile.name : "Click or Drag to Upload Document"}
                </span>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Max Size: 15MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document_1">Document 1 (Optional)</Label>
              <div className="relative group overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all p-4 text-center">
                <input 
                  id="document_1"
                  type="file" 
                  onChange={(e) => setDocument1File(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <span className="text-[10px] text-gray-500 font-bold block truncate">
                  {document1File ? document1File.name : "Upload Document 1"}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="document_2">Document 2 (Optional)</Label>
              <div className="relative group overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all p-4 text-center">
                <input 
                  id="document_2"
                  type="file" 
                  onChange={(e) => setDocument2File(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <span className="text-[10px] text-gray-500 font-bold block truncate">
                  {document2File ? document2File.name : "Upload Document 2"}
                </span>
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
            <Label htmlFor="is_active" className="mb-0 cursor-pointer text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 select-none">Live on Website</Label>
          </div>

          <div className="flex gap-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Paper"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResearchPaper;
