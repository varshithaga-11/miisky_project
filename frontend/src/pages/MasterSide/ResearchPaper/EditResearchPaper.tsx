import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateResearchPaper, getResearchPaperById, ResearchPaper } from "./researchpapeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditResearchPaper: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<ResearchPaper>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [document1File, setDocument1File] = useState<File | null>(null);
  const [document2File, setDocument2File] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getResearchPaperById(id);
        setFormData({
            title: data.title,
            authors: data.authors,
            abstract: data.abstract,
            methodology: data.methodology,
            references: data.references,
            key_findings: Array.isArray(data.key_findings) ? data.key_findings.join('\n') : data.key_findings,
            publication_date: data.publication_date,
            published_date: data.published_date,
            document: data.document,
            document_url: data.document_url,
            document_1_url: data.document_1_url,
            document_2_url: data.document_2_url,
            position: data.position,
            is_active: data.is_active
        });
      } catch (error) {
        toast.error("Failed to load research paper data");
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
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null && key !== "document" && key !== "document_url") {
          if (key === "key_findings") {
            const findingsArray = (val as string).split('\n').filter(line => line.trim() !== "");
            data.append(key, JSON.stringify(findingsArray));
          } else {
            data.append(key, val.toString());
          }
        }
      });
      if (pdfFile) data.append("document", pdfFile);
      if (document1File) data.append("document_1", document1File);
      if (document2File) data.append("document_2", document2File);

      await updateResearchPaper(id, data as any);
      toast.success("Research paper updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update research paper");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Edit Research Paper</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Retrieving Details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Paper Title *</Label>
              <Input
                id="title"
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                placeholder="e.g. Dr. Jane Smith, John Doe"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-20 resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="methodology">Methodology</Label>
              <textarea
                id="methodology"
                value={formData.methodology || ""}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-28 resize-none"
                placeholder="Describe the research methodology & introduction"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="key_findings">Key Findings (One per line)</Label>
              <textarea
                id="key_findings"
                value={formData.key_findings || ""}
                onChange={(e) => setFormData({ ...formData, key_findings: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-24 resize-none font-mono"
                placeholder="Result A&#10;Result B&#10;Result C"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="references">References</Label>
              <textarea
                id="references"
                value={formData.references || ""}
                onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-20 resize-none"
                placeholder="Cite sources or provide a summary of references"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="document">Research Document</Label>
              <div className="relative group overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all p-6 text-center">
                <input 
                  id="document"
                  type="file" 
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span className="truncate max-w-[12rem]">
                      {pdfFile ? pdfFile.name : formData.document_url ? "Update Existing Document" : "Attach File..."}
                    </span>
                    {formData.document_url && !pdfFile && (
                      <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </span>
                    )}
                  </div>
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
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-bold block truncate max-w-full">
                      {document1File ? document1File.name : formData.document_1_url ? "Update Document 1" : "Upload Document 1"}
                    </span>
                    {formData.document_1_url && !document1File && (
                      <span className="text-[8px] text-green-600 font-black uppercase tracking-widest">Already Saved</span>
                    )}
                  </div>
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
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-bold block truncate max-w-full">
                      {document2File ? document2File.name : formData.document_2_url ? "Update Document 2" : "Upload Document 2"}
                    </span>
                    {formData.document_2_url && !document2File && (
                      <span className="text-[8px] text-green-600 font-black uppercase tracking-widest">Already Saved</span>
                    )}
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
              <Label htmlFor="is_active" className="mb-0 cursor-pointer text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 select-none">Live on Website</Label>
            </div>

            <div className="flex gap-2 pt-4 border-t mt-6">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : "Update Paper"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditResearchPaper;
