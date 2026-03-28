import React, { useState } from "react";
import { toast } from "react-toastify";
import { createWorkflowStep, WorkflowStep } from "./workflowstepapi";
import Button from "../../../components/ui/button/Button";
import { FiPlus, FiTrash2, FiLayers } from "react-icons/fi";

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
        await createWorkflowStep(step as WorkflowStep);
      }
      toast.success("Workflow steps deployed successfully!");
      onSuccess();
      onClose();
    } catch (error) {
       console.error(error);
      toast.error("Process deployment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4 text-left">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-1 w-full max-w-5xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.3rem]">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200 dark:border-gray-700 font-sans italic">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-600 text-white flex items-center justify-center rounded-2xl shadow-xl shadow-blue-500/20">
                 <FiLayers className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Clinical <span className="text-blue-600">Sequencer</span></h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Architecting multi-node operational workflows.</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="group p-3 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all border border-transparent hover:border-gray-200">
              <svg className="w-6 h-6 text-gray-400 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white font-sans italic">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest w-20">Seq</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest min-w-[200px]">Node Title</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Process Logic (Description)</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest w-24">Live</th>
                    <th className="px-6 py-5 text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {steps.map((step, index) => (
                    <tr key={index} className="group hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={step.position}
                          onChange={(e) => handleChange(index, 'position', parseInt(e.target.value) || 1)}
                          className="w-full bg-transparent border-none focus:ring-0 font-mono font-black text-blue-600 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          required
                          value={step.title}
                          onChange={(e) => handleChange(index, 'title', e.target.value)}
                          placeholder="Node name..."
                          className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-900 dark:text-white placeholder:text-gray-300 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          rows={1}
                          value={step.description}
                          onChange={(e) => handleChange(index, 'description', e.target.value)}
                          placeholder="Operational details..."
                          className="w-full bg-transparent border-none focus:ring-0 text-xs text-gray-500 placeholder:text-gray-300 resize-none py-1"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                         <input
                           type="checkbox"
                           checked={step.is_active}
                           onChange={(e) => handleChange(index, 'is_active', e.target.checked)}
                           className="w-5 h-5 rounded border-gray-200 text-blue-600 focus:ring-0"
                         />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-3 px-6 py-3 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-all group font-sans italic"
              >
                <FiPlus className="group-hover:rotate-90 transition-transform" />
                Append Process Link
              </button>

              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic font-sans italic">
                 Sequencing <span className="text-blue-600">{steps.length}</span> nodes in manifest
              </div>
            </div>

            <div className="flex gap-4 pt-10 border-t border-gray-200 dark:border-gray-700 font-sans italic">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-2 rounded-2xl"
                disabled={loading}
              >
                Discard manifest
              </Button>
              <Button
                className="flex-[2] py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl bg-gray-900 shadow-2xl hover:bg-blue-600 group active:scale-[0.98]"
                disabled={loading}
                type="submit"
              >
                {loading ? "Materializing Nodes..." : "Deploy Clinical Sequence"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWorkflowStep;
