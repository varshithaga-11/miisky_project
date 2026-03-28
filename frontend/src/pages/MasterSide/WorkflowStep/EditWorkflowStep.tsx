import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateWorkflowStep, getWorkflowStepById, WorkflowStep } from "./workflowstepapi";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Checkbox from "../../../components/form/input/Checkbox";
import Button from "../../../components/ui/button/Button";

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
      } finally {
        setFetching(false);
      }
    };
    fetchStep();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateWorkflowStep(id, formData);
      toast.success("Operational step recalibrated!");
      onSuccess();
      onClose();
    } catch (error) {
       console.error(error);
      toast.error("Failed to update process node");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4 text-left">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-800 font-sans italic">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Recalibrate <span className="text-blue-600">Node</span></h2>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mt-1">Modifying operational parameters for the clinical flow.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all font-sans italic">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {fetching ? (
          <div className="py-20 text-center text-gray-400 animate-pulse font-black uppercase tracking-widest text-xs italic font-sans italic font-sans italic">
            Synchronizing Node Parameters...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 font-sans italic">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">Step Nomenclature</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Biosensor Activation"
                  className="bg-gray-50 border-transparent focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <Label htmlFor="position" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">Priority Order</Label>
                <Input
                  id="position"
                  name="position"
                  type="number"
                  required
                  value={formData.position || 1}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
                  className="bg-gray-50 border-transparent focus:border-blue-500 font-mono font-black"
                />
              </div>

              <div className="md:col-span-2">
                 <Label htmlFor="description" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">Operational Intelligence</Label>
                 <TextArea
                   rows={4}
                   value={formData.description || ""}
                   onChange={(val) => setFormData({ ...formData, description: val })}
                   placeholder="Detailed process description..."
                   className="bg-gray-50 border-transparent focus:border-blue-500"
                 />
              </div>

              <div className="md:col-span-2 pb-2">
                <Checkbox
                  label="Visible in Production"
                  checked={formData.is_active || false}
                  onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-2"
                disabled={loading}
                type="button"
              >
                Abort Changes
              </Button>
              <Button
                className="flex-[2] py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-gray-900 shadow-2xl hover:bg-blue-600"
                disabled={loading}
                type="submit"
              >
                {loading ? "Materializing..." : "Commit Recalibration"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditWorkflowStep;
