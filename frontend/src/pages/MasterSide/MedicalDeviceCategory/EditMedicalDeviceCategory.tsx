import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateMedicalDeviceCategory, getMedicalDeviceCategoryById } from "./medicaldevicecategoryapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import IconPickerDropdown from "../../../components/form/IconPickerDropdown";
import { DEVICE_CATEGORY_ICONS, getDeviceCategoryIcon } from "../../../utils/deviceCategoryIcons";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditMedicalDeviceCategory: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const data = await getMedicalDeviceCategoryById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load category data");
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
        if (!key.endsWith('_url') && value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      if (formData.icon_class) data.append("icon_class", formData.icon_class);

      await updateMedicalDeviceCategory(id, data as any);
      toast.success("Sector updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update sector");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Edit Device Category</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Retrieving Details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="e.g. Radiological Diagnostics"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="icon_class">Category Icon</Label>
              <IconPickerDropdown
                value={formData.icon_class || ""}
                onChange={(val) => setFormData({ ...formData, icon_class: val })}
                icons={DEVICE_CATEGORY_ICONS}
                getIcon={getDeviceCategoryIcon}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Operational Scope / Description</Label>
              <textarea
                id="description"
                placeholder="Define the utility and scope of this category..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-24 resize-none"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <Label htmlFor="is_active" className="mb-0 cursor-pointer text-xs">Live on Website</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditMedicalDeviceCategory;
