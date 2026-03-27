import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlogTag, getBlogTagById, BlogTag } from "./blogtagapi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditBlogTag: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogTag>>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getBlogTagById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load tag data");
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
      await updateBlogTag(id, formData);
      toast.success("Hashtag updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600">Edit Hashtag</h2>
        </div>
        
        {fetching ? (
          <div className="py-12 text-center text-gray-500 italic font-medium">Fetching tag details...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Tag Label</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">#</span>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
                >
                  {loading ? "Saving..." : "Update Tag"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Yield
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBlogTag;
