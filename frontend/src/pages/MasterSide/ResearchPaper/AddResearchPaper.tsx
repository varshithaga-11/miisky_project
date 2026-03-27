import React, { useState } from "react";
import { toast } from "react-toastify";
import { createResearchPaper, ResearchPaper } from "./researchpapeapi";

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
    pdf_file: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createResearchPaper(formData as ResearchPaper);
      toast.success("Research paper published!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add paper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Publish Paper</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Paper Title</label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Full title of the paper"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Authors</label>
            <input
              type="text"
              value={formData.authors || ""}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Dr. June Smith, R. Williams"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Published Date</label>
              <input
                type="date"
                value={formData.published_date || ""}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Position</label>
              <input
                type="number"
                value={formData.position || 0}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Abstract</label>
            <textarea
              value={formData.abstract || ""}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={4}
              placeholder="Summary of the research findings"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">PDF File URL</label>
            <input
              type="url"
              value={formData.pdf_file || ""}
              onChange={(e) => setFormData({ ...formData, pdf_file: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="https://example.com/research.pdf"
            />
          </div>

          <div>
            <div className="flex items-center group cursor-pointer inline-flex mt-2">
              <input
                type="checkbox"
                id="add_paper_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="add_paper_active" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Active Status</label>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Publishing..." : "Publish Paper"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResearchPaper;
