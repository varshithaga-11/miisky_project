import React, { useState, useEffect } from "react";
import { blogApi } from "../utils/api";
import { useLayout } from "../context/LayoutContext";
import Cta from "../components/sections/home2/Cta";
import { FiCheckCircle, FiUpload } from "react-icons/fi";

const BlogCreatePage: React.FC = () => {
  const { setHeaderStyle, setBreadcrumbTitle } = useLayout();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author_name: "",
    excerpt: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setHeaderStyle(3);
    setBreadcrumbTitle("Share Your Story");
  }, [setHeaderStyle, setBreadcrumbTitle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("author_name", formData.author_name);
    data.append("excerpt", formData.excerpt);
    data.append("is_active", "false"); 
    data.append("status", "draft");

    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await blogApi.create(data);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("Submission failed. Please check your data and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="boxed_wrapper">
        <section className="success-section centred pt_120 pb_120 bg-gray-50">
            <div className="auto-container">
                <div className="bg-white p-16 shadow-sm inline-block max-w-xl border border-gray-200">
                    <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Story Received</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">Thank you. Your contribution has been sent for review and will be published shortly.</p>
                    <a href="/website/blog" className="theme-btn btn-one"><span>Return to Blog</span></a>
                </div>
            </div>
        </section>
        <Cta />
      </div>
    );
  }

  return (
    <div className="boxed_wrapper text-left font-sans">
      <section className="blog-create-section pt_100 pb_120 bg-white">
        <div className="auto-container">
          <div className="max-w-3xl mx-auto">
            {/* Minimalist Heading */}
            <div className="mb-14 text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Share Your Story</h2>
                <p className="text-gray-400 font-medium">Contribute to the Miisky healthcare community.</p>
                <div className="w-16 h-1 bg-blue-600 mx-auto mt-6"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Section 1: Core Details */}
                <div className="space-y-8">
                    <div className="form-group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Post Headline</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter a compelling title..."
                            className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-bold text-3xl text-gray-900 placeholder:text-gray-200"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="form-group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Contributor Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Your full name"
                                className="w-full px-0 py-3 bg-transparent border-b border-gray-100 focus:border-blue-600 outline-none transition-all font-semibold text-gray-800"
                                value={formData.author_name}
                                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Brief Summary</label>
                            <input
                                type="text"
                                required
                                placeholder="A short intro (1 sentence)"
                                className="w-full px-0 py-3 bg-transparent border-b border-gray-100 focus:border-blue-600 outline-none transition-all font-semibold text-gray-800"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Visual Asset */}
                <div className="form-group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Featured Image</label>
                    <div className="relative group overflow-hidden border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className={`w-full min-h-[300px] flex flex-col items-center justify-center`}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-10">
                                    <FiUpload className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select Visual Cover</p>
                                </div>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>

                {/* Section 3: Manuscript */}
                <div className="form-group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Full Manuscript Content</label>
                    <textarea
                        required
                        placeholder="Start writing your healthcare insights..."
                        rows={12}
                        className="w-full px-8 py-8 bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-600 outline-none transition-all font-medium text-gray-800 leading-relaxed text-lg"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                </div>

                <div className="pt-10 text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="theme-btn btn-one w-full py-6 text-sm font-black uppercase tracking-[0.3em] !bg-blue-600 hover:!bg-blue-700 shadow-lg shadow-blue-600/20"
                    >
                        <span>{loading ? "Transmitting..." : "Submit Publication"}</span>
                    </button>
                    <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Submissions undergo an editorial review process.</p>
                </div>
            </form>
          </div>
        </div>
      </section>
      <Cta />
    </div>
  );
};

export default BlogCreatePage;
