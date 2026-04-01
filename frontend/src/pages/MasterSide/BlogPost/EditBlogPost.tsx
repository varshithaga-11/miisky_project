import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateBlogPost, getBlogPostById, BlogPost } from "./blogpostapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";
import ImagePicker from "../../../components/form/ImagePicker";
import MultiSelect from "../../../components/form/MultiSelect";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
  categories: any[];
  tags: any[];
}

const EditBlogPost: React.FC<Props> = ({ id, onSuccess, onClose, categories, tags }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogPost>>({});
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [authorFile, setAuthorFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getBlogPostById(id);
        setFormData({
          ...data,
          tag_ids: data.tags ? data.tags.map((tag: any) => tag.id) : []
        });
      } catch (error) {
        toast.error("Failed to load blog post");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

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
    
    if (formData.tag_ids && formData.tag_ids.length > 0) {
      formData.tag_ids.forEach(id => data.append("tag_ids", String(id)));
    } else {
      // If no tags selected, we might want to tell the server to clear them
      // Depending on backend logic, empty list might be ignored in field-based form data
    }
    
    if (imageFile) data.append("image", imageFile);
    if (authorFile) data.append("author_image", authorFile);

    try {
      await updateBlogPost(id, data as any);
      toast.success("Blog post updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-5xl relative max-h-[95vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Blog Post</h2>
        
        {fetching ? (
          <div className="py-40 text-center text-gray-400">Loading blog post data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <Label htmlFor="title">Post Title *</Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      required
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) || undefined })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                      disabled={loading}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="read_time">Read Time</Label>
                    <Input
                      id="read_time"
                      type="text"
                      value={formData.read_time || ""}
                      onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                      disabled={loading}
                    />
                  </div>
              </div>

              <div>
                <MultiSelect
                  label="Tags"
                  options={tags.map(tag => ({ value: String(tag.id), text: tag.name }))}
                  onChange={(selected) => setFormData({ ...formData, tag_ids: selected.map(id => parseInt(id)) })}
                  defaultSelected={(formData.tag_ids || []).map(id => String(id))}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="author_name">Author Name</Label>
                    <Input
                      id="author_name"
                      type="text"
                      value={formData.author_name || ""}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="author_designation">Author Designation</Label>
                    <Input
                      id="author_designation"
                      type="text"
                      value={formData.author_designation || ""}
                      onChange={(e) => setFormData({ ...formData, author_designation: e.target.value })}
                      disabled={loading}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ImagePicker
                      id="image"
                      label="Featured Image"
                      value={imageFile}
                      previewUrl={formData.image}
                      onChange={(file) => setImageFile(file)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <ImagePicker
                      id="author_image"
                      label="Author Image"
                      value={authorFile}
                      previewUrl={formData.author_image}
                      onChange={(file) => setAuthorFile(file)}
                      disabled={loading}
                    />
                  </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt / Short Description</Label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  rows={2}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="content">Post Content *</Label>
                <textarea
                  id="content"
                  required
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  rows={12}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-100 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Publication Settings</h3>
                  
                  <div>
                    <DatePicker2
                      id="published_at"
                      label="Public Date"
                      value={formData.published_at?.split("T")[0] || ""}
                      onChange={(date: string) => setFormData({ ...formData, published_at: date })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="position">Display Priority</Label>
                    <Input
                      id="position"
                      type="number"
                      value={formData.position || 0}
                      onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status || "draft"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                      disabled={loading}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active || false}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor="is_active" className="mb-0 cursor-pointer">Live / Active</Label>
                  </div>

                  <div className="pt-6 space-y-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Updating..." : "Update Post"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="w-full"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
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
