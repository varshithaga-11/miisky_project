import React, { useState, useEffect } from "react";
import { updateFoodStep, getFoodStepList } from "./foodstepapi";
import { getFoodList, Food } from "../Food/foodapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from 'react-toastify';

interface EditFoodStepProps {
    editId: number;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const EditFoodStep: React.FC<EditFoodStepProps> = ({ editId, isOpen, onClose, onUpdated }) => {
  const [foodId, setFoodId] = useState("");
  const [stepNumber, setStepNumber] = useState("");
  const [instruction, setInstruction] = useState("");
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFoodList().then(setFoods).catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen && editId) {
        setLoading(true);
        getFoodStepList().then(list => {
            const item = list.find(s => s.id === editId);
            if (item) {
                setFoodId(String(item.food));
                setStepNumber(String(item.step_number));
                setInstruction(item.instruction);
            }
        }).finally(() => setLoading(false));
    }
  }, [isOpen, editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFoodStep(editId, {
        food: Number(foodId),
        step_number: Number(stepNumber),
        instruction
      });
      toast.success("Updated successfully!");
      setTimeout(onUpdated, 1000);
    } catch {
      toast.error("Failed to update preparation step.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative shadow-xl">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl font-bold text-gray-400 hover:text-gray-600">×</button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Preparation Step</h2>
        {loading ? <p className="text-center py-4">Loading step data...</p> : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Food Item *</Label>
              <Select
                value={foodId}
                onChange={val => setFoodId(val)}
                options={[{ value: "", label: "Select Food" }, ...foods.map(f => ({ value: String(f.id), label: f.name }))]}
              />
            </div>
            <div>
              <Label>Step Number *</Label>
              <Input 
                  type="number" 
                  value={stepNumber} 
                  onChange={e => setStepNumber(e.target.value)} 
                  required 
              />
            </div>
            <div>
              <Label>Instruction *</Label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditFoodStep;
