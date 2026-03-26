import React, { useState } from "react";
import { toast } from "react-toastify";
import { createFAQ, FAQ } from "./faqapi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const AddFAQ: React.FC<Props> = ({ onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQ>>({
    category: undefined,
    question: "",
    answer: "",
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createFAQ(formData as FAQ);
      toast.success("Knowledge item added!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Expand Knowledge Base</h2>
          <p className="text-gray-500 text-sm mt-1">Compose a new frequently asked question for the support portal.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Support Category</label>
            <select
              required
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Domain</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Inquiry / Question</label>
            <input
              type="text"
              required
              placeholder="e.g. How do I reset my credentials?"
              value={formData.question || ""}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Resolution / Answer</label>
            <textarea
              required
              placeholder="Provide a detailed solution..."
              value={formData.answer || ""}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all leading-relaxed"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pt-2">
            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Sort Priority</label>
              <input
                type="number"
                value={formData.position || 0}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center cursor-pointer group h-[42px]">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="ml-3 text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Visible to public</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-8 border-t pt-6">
             <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 hover:bg-black active:scale-[0.98] transition-all shadow-lg"
            >
              {loading ? "Publishing..." : "Publish to FAQ"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-100 text-gray-400 font-bold py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFAQ;
