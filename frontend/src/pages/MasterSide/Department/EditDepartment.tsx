import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getDepartmentById, updateDepartment, Department } from "./departmentapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ImagePicker from "../../../components/form/ImagePicker";
import IconPickerDropdown from "../../../components/form/IconPickerDropdown";
import { DEPARTMENT_ICONS, getDepartmentIcon } from "../../../utils/departmentIcons";

interface EditDepartmentProps {
  departmentId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (department: Department) => void;
}

const EditDepartment: React.FC<EditDepartmentProps> = ({
  departmentId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [head_name, setHeadName] = useState("");
  const [head_email, setHeadEmail] = useState("");
  const [position, setPosition] = useState(1);
  const [icon_class, setIconClass] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [short_description, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tagline, setTagline] = useState("");
  const [expertise_text, setExpertiseText] = useState("");
  const [key_features, setKeyFeatures] = useState("");
  const [is_active, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && departmentId) {
      const fetchDepartment = async () => {
        try {
          const data = await getDepartmentById(departmentId);
          setName(data.name);
          setDescription(data.description || "");
          setHeadName(data.head_name || "");
          setHeadEmail(data.head_email || "");
          setPosition(data.position || 1);
          setIconClass(data.icon_class || "");
          setShortDescription(data.short_description || "");
          setTagline(data.tagline || "");
          setExpertiseText(data.expertise_text || "");
          if (data.key_features && Array.isArray(data.key_features)) {
            setKeyFeatures(data.key_features.join('\n'));
          } else {
            setKeyFeatures("");
          }
          setImageUrl(data.image || null);
          setIsActive(data.is_active !== false);
        } catch (error: any) {
          console.error("Error fetching department:", error);
          toast.error("Failed to load department");
        }
      };
      fetchDepartment();
    }
  }, [isOpen, departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description || "");
      formData.append("short_description", short_description || "");
      formData.append("tagline", tagline || "");
      formData.append("expertise_text", expertise_text || "");
      
      if (key_features) {
        const featuresArray = key_features.split('\n').filter(line => line.trim() !== "");
        formData.append("key_features", JSON.stringify(featuresArray));
      } else {
        formData.append("key_features", JSON.stringify([]));
      }
      
      formData.append("head_name", head_name || "");
      formData.append("head_email", head_email || "");
      formData.append("position", String(position));
      formData.append("icon_class", icon_class);
      formData.append("is_active", String(is_active));
      if (image) formData.append("image", image);

      const updated = await updateDepartment(departmentId, formData as any);
      toast.success("Department updated successfully!");
      onUpdated(updated);
      onClose();
    } catch (error: any) {
      console.error("Error updating department:", error);
      toast.error(error.response?.data?.detail || "Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Department</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description">Main Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              rows={3}
              placeholder="Detailed treatment and care overview..."
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="tagline">Tagline / Brief Subtitle</Label>
            <Input
              id="tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Operations and logistics"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="expertise_text">Professional Expertise Overview</Label>
            <textarea
              id="expertise_text"
              value={expertise_text}
              onChange={(e) => setExpertiseText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              rows={2}
              placeholder="Professional medical services and expertise..."
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="key_features">Key Department Features (One per line)</Label>
            <textarea
              id="key_features"
              value={key_features}
              onChange={(e) => setKeyFeatures(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm font-mono"
              rows={4}
              placeholder="State-of-the-art facilities&#10;Dedicated professionals"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="head_name">Head Name</Label>
              <Input
                id="head_name"
                type="text"
                value={head_name}
                onChange={(e) => setHeadName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="head_email">Head Email</Label>
              <Input
                id="head_email"
                type="email"
                value={head_email}
                onChange={(e) => setHeadEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value))}
              min="1"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="icon_class">Department Icon</Label>
            <IconPickerDropdown
              value={icon_class}
              onChange={setIconClass}
              icons={DEPARTMENT_ICONS}
              getIcon={getDepartmentIcon}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="short_description">Short Description</Label>
            <Input
              id="short_description"
              type="text"
              value={short_description}
              onChange={(e) => setShortDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <ImagePicker
              id="image"
              label="Department Image"
              value={image}
              previewUrl={imageUrl || ""}
              onChange={(file) => setImage(file)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={is_active}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="is_active" className="mb-0 cursor-pointer">Active</Label>
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Department"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartment;
