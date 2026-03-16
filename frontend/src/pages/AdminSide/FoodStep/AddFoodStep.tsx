import React, { useState, useEffect } from "react";
import { createFoodStep } from "./foodstepapi";
import { getFoodList, Food } from "../Food/foodapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from 'react-toastify';
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface AddFoodStepProps {
  onClose: () => void;
  onAdd: () => void;
  initialFoodId?: string;
}

interface StepForm {
  step_number: string;
  instruction: string;
}

const AddFoodStep: React.FC<AddFoodStepProps> = ({ onClose, onAdd, initialFoodId }) => {
  const [foodId, setFoodId] = useState(initialFoodId || "");
  const [steps, setSteps] = useState<StepForm[]>([{ step_number: "1", instruction: "" }]);
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFoodList().then(setFoods).catch(console.error);
  }, []);

  const addStepRow = () => {
    const nextStepNum = steps.length > 0 ? (Math.max(...steps.map(s => parseInt(s.step_number) || 0)) + 1).toString() : "1";
    setSteps([...steps, { step_number: nextStepNum, instruction: "" }]);
  };

  const removeStepRow = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, field: keyof StepForm, value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodId) {
      toast.error("Please select a food item.");
      return;
    }

    const invalidStep = steps.find(s => !s.step_number || !s.instruction);
    if (invalidStep) {
      toast.error("Please fill in all step numbers and instructions.");
      return;
    }

    setLoading(true);
    try {
      // Send multiple requests (or ideally a bulk request if backend supported it)
      for (const step of steps) {
        await createFoodStep({
          food: Number(foodId),
          step_number: Number(step.step_number),
          instruction: step.instruction
        });
      }
      toast.success(`${steps.length} preparation step(s) added!`);
      setTimeout(onAdd, 1000);
    } catch (err: any) {
      toast.error("Failed to add preparation steps.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl font-bold text-gray-400 hover:text-gray-600">×</button>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Add Preparation Steps</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <Label>Selected Food Item *</Label>
            <Select
              value={foodId}
              onChange={val => setFoodId(val)}
              options={[{ value: "", label: "Select Food" }, ...foods.map(f => ({ value: String(f.id), label: f.name }))]}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Instructions</h3>
                <button 
                  type="button" 
                  onClick={addStepRow}
                  className="flex items-center gap-1 text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  <FiPlus /> Add Step
                </button>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="w-20">
                  <Label className="text-xs">Step #</Label>
                  <Input 
                    type="number" 
                    value={step.step_number} 
                    onChange={e => handleStepChange(index, "step_number", e.target.value)} 
                    required 
                    className="h-10"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Instruction *</Label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[80px]"
                    value={step.instruction}
                    onChange={(e) => handleStepChange(index, "instruction", e.target.value)}
                    placeholder="Enter detailed instruction..."
                    required
                  />
                </div>
                {steps.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeStepRow(index)}
                    className="mt-6 text-red-500 hover:text-red-700 p-2"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save All Steps"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodStep;
