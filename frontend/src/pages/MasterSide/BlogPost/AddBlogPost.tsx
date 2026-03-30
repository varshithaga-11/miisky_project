import React, { useState } from "react";
import { toast } from "react-toastify";
import { createBlogPost, BlogPost } from "./blogpostapi";
import { FiImage, FiUploadCloud, FiUser } from "react-icons/fi";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
}

const AddBlogPost: React.FC<Props> = ({ onSuccess, onClose, categories }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    read_time: "5 min",
    category: undefined,
    author_name: "",
    excerpt: "",
    published_at: "",
    position: 0,
    is_active: true,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [authorFile, setAuthorFile] = useState<File | null>(null);

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
    data.append("excerpt", formData.excerpt || "");
    data.append("read_time", formData.read_time || "5 min");
    data.append("is_active", String(formData.is_active));
    data.append("status", formData.status || "draft");
    data.append("position", String(formData.position || 0));
    if (formData.published_at) data.append("published_at", formData.published_at);
    
    if (imageFile) data.append("image", imageFile);
    if (authorFile) data.append("author_image", authorFile);

    try {
      await createBlogPost(data as any);
      toast.success("Blog post published successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic text-blue-600 tracking-tight">Post Manifest</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="md:col-span-8 space-y-8">
            <div>
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Main Headline</label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-b-2 border-gray-100 focus:border-blue-600 py-4 outline-none transition-all font-black text-4xl tracking-tighter placeholder:text-gray-200"
                placeholder="The Future of Miisky..."
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div>
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Category</label>
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
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Read Time estimate</label>
                  <input
                    type="text"
                    value={formData.read_time || ""}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-gray-700"
                    placeholder="e.g. 5 min"
                  />
                </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Author Profile</label>
              <div className="flex items-center gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <div className="relative group shrink-0">
                   <div className="w-20 h-20 rounded-full bg-white border-2 border-blue-200 overflow-hidden flex items-center justify-center relative">
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
                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-black text-xl text-blue-900 placeholder:text-blue-200"
                    placeholder="Authors Full Name"
                  />
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mt-1">Lead Contributor</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Editorial Excerpt</label>
              <textarea
                value={formData.excerpt || ""}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-gray-600"
                rows={2}
                placeholder="Sum up the core message in two sentences..."
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Main Manuscript</label>
              <textarea
                required
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-6 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-gray-800"
                rows={16}
                placeholder="Unleash the full story..."
              />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="md:col-span-4 space-y-8">
            <div className="sticky top-0 space-y-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-4 uppercase tracking-widest font-mono">Hero Visual</label>
                  <div className="relative group">
                    <div className={`w-full h-64 rounded-3xl border-4 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden transition-all ${!imagePreview ? 'hover:border-blue-400 hover:bg-white bg-gray-50' : ''}`}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover shadow-2xl scale-100 group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="text-center p-8">
                          <FiImage className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                          <p className="text-sm text-gray-300 font-black uppercase tracking-widest">Primary Cover</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-3xl p-8 space-y-6 shadow-2xl shadow-blue-900/20">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em] font-mono">Publish Date</label>
                      <input
                        type="date"
                        value={formData.published_at || ""}
                        onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                        className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em] font-mono">Display Sequence</label>
                      <input
                        type="number"
                        value={formData.position || 0}
                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em] font-mono">Publication Status</label>
                      <select
                        value={formData.status || "draft"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      >
                        <option value="draft" className="text-gray-900">Draft</option>
                        <option value="published" className="text-gray-900">Published</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-black text-gray-300 uppercase tracking-widest">Live Status</label>
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
                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl disabled:opacity-50 hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-600/20 text-sm uppercase tracking-[0.1em]"
                      >
                        {loading ? <span className="animate-pulse">Broadcasting...</span> : "Release Manuscript"}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full border-2 border-white/10 text-gray-400 font-bold py-4 rounded-2xl hover:bg-white/5 active:scale-95 transition-all text-xs uppercase tracking-widest"
                      >
                        Trash Draft
                      </button>
                    </div>
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogPost;
