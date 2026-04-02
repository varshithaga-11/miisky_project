import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updatePartner, getPartnerById } from "./partnerapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ImagePicker from "../../../components/form/ImagePicker";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditPartner: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({});
  const partnerTypes = [
    { value: 'academic', label: 'Academic / Research' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'supply_chain', label: 'Supply Chain' },
    { value: 'government', label: 'Government' },
    { value: 'investor', label: 'Investor' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getPartnerById(id);
        setFormData({
            name: data.name,
            description: data.description,
            partner_type: data.partner_type || "other",
            collaboration_details: data.collaboration_details,
            since_year: data.since_year,
            website_url: data.website_url,
            position: data.position,
            is_active: data.is_active,
            logo_url: data.logo
        });
      } catch (error) {
        toast.error("Failed to load data");
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
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'logo_url' && value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      
      if (logoFile) {
        data.append("logo", logoFile);
      }

      await updatePartner(id, data);
      toast.success("Updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Partner</h2>
        
        {fetching ? (
          <div className="py-10 text-center text-gray-500">Loading data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Partner Name *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partner_type">Partner Category *</Label>
                <select
                  id="partner_type"
                  required
                  value={formData.partner_type || "other"}
                  onChange={(e) => setFormData({ ...formData, partner_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  disabled={loading}
                >
                  {partnerTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="since_year">Partner Since (Year)</Label>
                <Input
                  id="since_year"
                  type="number"
                  value={formData.since_year || ""}
                  onChange={(e) => setFormData({ ...formData, since_year: parseInt(e.target.value) || undefined })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Brief Description</Label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={2}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="collaboration_details">Full Collaboration Scope</Label>
              <textarea
                id="collaboration_details"
                value={formData.collaboration_details || ""}
                onChange={(e) => setFormData({ ...formData, collaboration_details: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                rows={3}
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
                disabled={loading}
              />
            </div>

            <div>
              <ImagePicker
                id="logo"
                label="Brand Logo"
                value={logoFile}
                previewUrl={formData.logo_url}
                onChange={(file) => setLogoFile(file)}
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
                <Label htmlFor="is_active" className="mb-0 cursor-pointer">Active Status</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Partner"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditPartner;
