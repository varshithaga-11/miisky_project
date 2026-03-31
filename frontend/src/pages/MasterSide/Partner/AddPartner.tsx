import React, { useState } from "react";
import { toast } from "react-toastify";
import { createPartner, Partner } from "./partnerapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ImagePicker from "../../../components/form/ImagePicker";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddPartner: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: "",
    description: "",
    website_url: "",
    logo_alt_text: "",
    display_on_home: false,
    position: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      
      if (logoFile) {
        data.append("logo", logoFile);
      }

      await createPartner(data as any);
      toast.success("Partner added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Partner</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Partner Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter partner name"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              rows={3}
              placeholder="Brief description of the partnership"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url || ""}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          <div>
            <ImagePicker
              id="logo"
              label="Brand Logo"
              value={logoFile}
              onChange={(file) => setLogoFile(file)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="logo_alt_text">Logo Alt Text</Label>
            <Input
              id="logo_alt_text"
              type="text"
              value={formData.logo_alt_text || ""}
              onChange={(e) => setFormData({ ...formData, logo_alt_text: e.target.value })}
              placeholder="Partner logo description"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              value={formData.position || 0}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="is_active" className="mb-0 cursor-pointer">Active Publication</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="display_on_home"
                checked={formData.display_on_home || false}
                onChange={(e) => setFormData({ ...formData, display_on_home: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="display_on_home" className="mb-0 cursor-pointer">Show on Home Page</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Partner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPartner;
