import React, { useState, useEffect } from "react";
import { getFoodList, Food } from "../Food/foodapi";
import { getIngredientList, Ingredient } from "../Ingredient/ingredientapi";
import { getUnitList, Unit } from "../Unit/unitapi";
import { saveFullRecipe } from "./recipeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiList, FiBox } from "react-icons/fi";

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    
    const [selectedFoodId, setSelectedFoodId] = useState("");
    
    const [ingredientRows, setIngredientRows] = useState([
        { ingredient: "", quantity: "", unit: "", notes: "" }
    ]);
    
    const [stepRows, setStepRows] = useState([
        { step_number: "1", instruction: "" }
    ]);
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            getFoodList().then(setFoods).catch(console.error);
            getIngredientList().then(setIngredients).catch(console.error);
            getUnitList().then(setUnits).catch(console.error);
        }
    }, [isOpen]);

    const addIngredientRow = () => {
        setIngredientRows([...ingredientRows, { ingredient: "", quantity: "", unit: "", notes: "" }]);
    };
    const removeIngredientRow = (index: number) => {
        if (ingredientRows.length > 1) setIngredientRows(ingredientRows.filter((_, i) => i !== index));
    };
    const handleIngChange = (index: number, field: string, value: string) => {
        const updated = [...ingredientRows];
        (updated[index] as any)[field] = value;
        setIngredientRows(updated);
    };

    const addStepRow = () => {
        const nextNum = stepRows.length > 0 ? (Math.max(...stepRows.map(s => parseInt(s.step_number) || 0)) + 1).toString() : "1";
        setStepRows([...stepRows, { step_number: nextNum, instruction: "" }]);
    };
    const removeStepRow = (index: number) => {
        if (stepRows.length > 1) setStepRows(stepRows.filter((_, i) => i !== index));
    };
    const handleStepChange = (index: number, field: string, value: string) => {
        const updated = [...stepRows];
        (updated[index] as any)[field] = value;
        setStepRows(updated);
    };

    const handleSave = async () => {
        if (!selectedFoodId) {
            toast.error("Please select a Food item first.");
            return;
        }

        const hasInvalidIng = ingredientRows.some(r => !r.ingredient || !r.quantity || !r.unit);
        const hasInvalidStep = stepRows.some(s => !s.step_number || !s.instruction);

        if (hasInvalidIng || hasInvalidStep) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await saveFullRecipe({
                food: Number(selectedFoodId),
                ingredients: ingredientRows.map(r => ({
                    ingredient: Number(r.ingredient),
                    quantity: Number(r.quantity),
                    unit: Number(r.unit),
                    notes: r.notes
                })),
                steps: stepRows.map(s => ({
                    step_number: Number(s.step_number),
                    instruction: s.instruction
                }))
            });
            toast.success("Recipe saved!");
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } catch (err) {
            toast.error("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-gray-600 z-10">×</button>
                
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                        <FiPlus className="text-blue-500" />
                        Create Full Recipe
                    </h2>

                    <div className="space-y-8">
                        {/* Food Selection */}
                        <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FiBox /> Select Food Item *
                            </label>
                            <Select
                                value={selectedFoodId}
                                onChange={setSelectedFoodId}
                                options={[{ value: "", label: "Choose a Food..." }, ...foods.map(f => ({ value: String(f.id), label: f.name }))]}
                                className="max-w-md"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Ingredients */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-green-600">
                                        <FiList /> Ingredients
                                    </h3>
                                    <button onClick={addIngredientRow} className="text-green-600 hover:bg-green-50 p-1.5 rounded-full transition-colors">
                                        <FiPlus size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {ingredientRows.map((row, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl relative border border-gray-100 dark:border-gray-700">
                                            <div className="grid grid-cols-1 gap-3">
                                                <Select
                                                    value={row.ingredient}
                                                    onChange={v => handleIngChange(idx, "ingredient", v)}
                                                    options={[{ value: "", label: "Ingredient" }, ...ingredients.map(i => ({ value: String(i.id), label: i.name }))]}
                                                />
                                                <div className="flex gap-2">
                                                    <Input placeholder="Qty" type="number" value={row.quantity} onChange={e => handleIngChange(idx, "quantity", e.target.value)} />
                                                    <Select
                                                        value={row.unit}
                                                        onChange={v => handleIngChange(idx, "unit", v)}
                                                        options={[{ value: "", label: "Unit" }, ...units.map(u => ({ value: String(u.id), label: u.name }))]}
                                                    />
                                                </div>
                                                <Input placeholder="Notes" value={row.notes} onChange={e => handleIngChange(idx, "notes", e.target.value)} />
                                            </div>
                                            {ingredientRows.length > 1 && (
                                                <button onClick={() => removeIngredientRow(idx)} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border hover:text-red-700">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Steps */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-orange-600">
                                        <FiList /> Steps
                                    </h3>
                                    <button onClick={addStepRow} className="text-orange-600 hover:bg-orange-50 p-1.5 rounded-full transition-colors">
                                        <FiPlus size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {stepRows.map((row, idx) => (
                                        <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl relative border border-gray-100 dark:border-gray-700">
                                            <div className="w-14">
                                                <Input type="number" value={row.step_number} onChange={e => handleStepChange(idx, "step_number", e.target.value)} />
                                            </div>
                                            <textarea
                                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                rows={2}
                                                placeholder="Step instruction..."
                                                value={row.instruction}
                                                onChange={e => handleStepChange(idx, "instruction", e.target.value)}
                                            />
                                            {stepRows.length > 1 && (
                                                <button onClick={() => removeStepRow(idx)} className="text-red-500 hover:text-red-700 pt-2">
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                            <Button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <FiSave />
                                {loading ? "Saving..." : "Save All"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default AddRecipeModal;
