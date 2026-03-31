import React, { useState } from "react";
import { toast } from "react-toastify";
import { createWorkflowStep, WorkflowStep } from "./workflowstepapi";
import Button from "../../../components/ui/button/Button";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Input from "../../../components/form/input/InputField";
import ImagePicker from "../../../components/form/ImagePicker";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const AddWorkflowStep: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Partial<WorkflowStep>[]>([
    { title: "", description: "", position: 1, is_active: true }
  ]);

  const handleAddRow = () => {
    const nextPos = steps.length > 0 ? (steps[steps.length - 1].position || 0) + 1 : 1;
    setSteps([...steps, { title: "", description: "", position: nextPos, is_active: true }]);
  };

  const handleRemoveRow = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      for (const step of steps) {
        if (!step.title) continue;
        
        const formData = new FormData();
        formData.append("title", step.title || "");
        formData.append("description", step.description || "");
        formData.append("position", String(step.position || 1));
        formData.append("is_active", String(step.is_active));
        if (step.image instanceof File) {
          formData.append("image", step.image);
        }
        if (step.icon_class) {
          formData.append("icon_class", step.icon_class);
        }

        await createWorkflowStep(formData);
      }
      toast.success("Workflow steps added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add workflow steps");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-6xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 text-center">Add Multiple Workflow Steps</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-24">Order</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider min-w-[200px]">Step Title *</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-32">Image</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-24 text-center">Active</th>
                  <th className="px-6 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {steps.map((step, index) => (
                  <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3 align-top">
                      <Input
                        type="number"
                        value={step.position}
                        onChange={(e) => handleChange(index, 'position', parseInt(e.target.value) || 1)}
                        className="w-full text-sm"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-3 align-top">
                      <Input
                        type="text"
                        required
                        value={step.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                        placeholder="Step name..."
                        className="w-full text-sm"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-3 align-top">
                      <textarea
                        rows={3}
                        value={step.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                        placeholder="Step details..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-2 py-3 align-top">
                      <ImagePicker
                        id={`image-${index}`}
                        label=""
                        value={step.image || null}
                        onChange={(file) => handleChange(index, 'image', file)}
                        className="w-full"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-3 text-center align-top pt-5">
                      <input
                        type="checkbox"
                        checked={step.is_active}
                        onChange={(e) => handleChange(index, 'is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        disabled={loading}
                      />
                    </td>
                    <td className="px-6 py-3 text-right align-top pt-5">
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          disabled={loading}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              disabled={loading}
            >
              <FiPlus /> Add Another Step
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Steps: <span className="font-bold text-gray-900 dark:text-gray-100">{steps.length}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Steps"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkflowStep;
