import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateWorkflowStep, getWorkflowStepById, WorkflowStep } from "./workflowstepapi";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import ImagePicker from "../../../components/form/ImagePicker";

interface Props {
  id: number;
  onSuccess: () => void;
  onClose: () => void;
}

const EditWorkflowStep: React.FC<Props> = ({ id, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkflowStep>>({});

  useEffect(() => {
    const fetchStep = async () => {
      setFetching(true);
      try {
        const data = await getWorkflowStepById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Failed to load step details");
        onClose();
      } finally {
        setFetching(false);
      }
    };
    fetchStep();
  }, [id, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title || "");
      data.append("description", formData.description || "");
      data.append("position", String(formData.position || 1));
      data.append("is_active", String(formData.is_active));
      
      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }
      if (formData.icon_class) {
        data.append("icon_class", formData.icon_class);
      }

      await updateWorkflowStep(id, data);
      toast.success("Workflow step updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update step");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Edit Workflow Step</h2>
        
        {fetching ? (
          <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Retreiving Step Details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Step Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Planning"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="position">Position (Order)</Label>
                <Input
                  id="position"
                  name="position"
                  type="number"
                  required
                  value={formData.position || 1}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of this step..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm h-28 resize-none"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <ImagePicker
                  id="image"
                  label="Step Image"
                  value={formData.image || null}
                  previewUrl={formData.image_url}
                  onChange={(file) => setFormData({ ...formData, image: file || undefined })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 pb-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  disabled={loading}
                />
                <Label htmlFor="is_active" className="mb-0 cursor-pointer">Active / Published</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t mt-6">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Updating..." : "Update Step"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditWorkflowStep;
