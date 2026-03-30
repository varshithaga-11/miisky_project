import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlogPost, getBlogPostById, BlogPost } from "./blogpostapi";
import { FiImage, FiUploadCloud, FiUser, FiZap } from "react-icons/fi";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const EditBlogPost: React.FC<Props> = ({ id, onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({});
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [authorFile, setAuthorFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getBlogPostById(id);
        setFormData(data);
        if (data.image) setImagePreview(data.image);
        if (data.author_image) setAuthorPreview(data.author_image);
      } catch (error) {
        toast.error("Failed to load article");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuthorFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAuthorPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title || "");
    data.append("content", formData.content || "");
    if (formData.category) data.append("category", String(formData.category));
    data.append("author_name", formData.author_name || "");
    data.append("author_designation", formData.author_designation || "");
    data.append("excerpt", formData.excerpt || "");
    data.append("read_time", formData.read_time || "5 min");
    data.append("is_active", String(formData.is_active));
    data.append("status", formData.status || "draft");
    data.append("position", String(formData.position || 0));
    
    if (formData.published_at) {
        const dateOnly = formData.published_at.split("T")[0];
        data.append("published_at", dateOnly);
    }
    
    if (imageFile) data.append("image", imageFile);
    if (authorFile) data.append("author_image", authorFile);

    try {
      await updateBlogPost(id, data as any);
      toast.success("Publication revised successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to revise publication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 flex items-center justify-between">
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600 flex items-center gap-3">
             <FiZap className="w-8 h-8" /> Refine Publication
           </h2>
           <div className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">Revision Index: #{id}</div>
        </div>
        
        {fetching ? (
          <div className="py-40 text-center">
             <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
             <div className="font-black text-gray-400 uppercase tracking-widest text-xs italic">Syncing editorial manifest...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Main Content Area */}
            <div className="md:col-span-8 space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest ">Revised Headline</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-4 outline-none transition-all font-black text-4xl tracking-tighter text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Category Manifest</label>
                    <select
                      required
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-gray-700"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Duration Estimate</label>
                    <input
                      type="text"
                      value={formData.read_time || ""}
                      onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-gray-700"
                    />
                  </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Contributor Profile</label>
                <div className="flex items-center gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <div className="relative group shrink-0">
                     <div className="w-20 h-20 rounded-full bg-white border-2 border-blue-200 overflow-hidden flex items-center justify-center relative shadow-lg">
                        {authorPreview ? (
                          <img src={authorPreview} alt="Author" className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="w-10 h-10 text-blue-200" />
                        )}
                        <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <FiUploadCloud className="text-white w-6 h-6" />
                        </div>
                        <input type="file" accept="image/*" onChange={handleAuthorImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>
                  </div>
                  <div className="flex-1">
                     <input
                      type="text"
                      value={formData.author_name || ""}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 font-black text-xl text-blue-900"
                      placeholder="Enter Lead Author"
                    />
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mt-1">Lead Contributor</p>
                  </div>
                  <div className="flex-1 border-l border-blue-100 pl-6 text-left">
                     <input
                      type="text"
                      value={formData.author_designation || ""}
                      onChange={(e) => setFormData({ ...formData, author_designation: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-sm text-blue-800 placeholder:text-blue-200"
                      placeholder="Designation / Role"
                    />
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1">Professional Title</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">SEO Excerpt</label>
                <textarea
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-gray-600"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Main Manuscript Content</label>
                <textarea
                  required
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-gray-800 leading-relaxed"
                  rows={14}
                />
              </div>
            </div>

            {/* Sidebar Area */}
            <div className="md:col-span-4 space-y-8">
              <div className="sticky top-0 space-y-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-4 uppercase tracking-widest font-mono">Cover Visual</label>
                  <div className="relative group shadow-2xl rounded-3xl overflow-hidden">
                    <div className="w-full h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                        <FiImage className="w-16 h-16 text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                         <span className="text-white font-black uppercase text-xs tracking-widest bg-blue-600 px-4 py-2 rounded-lg">Upload New Hero</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-3xl p-8 space-y-6 shadow-2xl">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest font-mono">Publish Date</label>
                      <input
                        type="date"
                        value={formData.published_at?.split("T")[0] || ""}
                        onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                        className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest font-mono">Display Order</label>
                      <input
                        type="number"
                        value={formData.position || 0}
                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest font-mono">Publication Status</label>
                      <select
                        value={formData.status || "draft"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      >
                        <option value="draft" className="text-gray-900">Draft (Review Needed)</option>
                        <option value="published" className="text-gray-900">Published (Visible)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-black text-gray-300 uppercase tracking-widest">Visibility</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_active || false}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="pt-6 space-y-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl disabled:opacity-50 hover:bg-blue-500 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20"
                      >
                        {loading ? <span className="animate-pulse">Materializing Changes...</span> : "Commit Revision"}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full border border-white/10 text-gray-500 font-bold py-4 rounded-2xl hover:bg-white/5 active:scale-95 transition-all text-xs uppercase tracking-widest"
                      >
                        Discard Refinement
                      </button>
                    </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBlogPost;
