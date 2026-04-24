import React, { useState, useEffect, useRef } from "react";
import { Food } from "../Food/foodapi";
import { getIngredientList, Ingredient } from "../Ingredient/ingredientapi";
import { getUnitList, Unit } from "../Unit/unitapi";
import { getFoodIngredientList } from "../FoodIngredient/foodingredientapi";
import { getFoodStepList } from "../FoodStep/foodstepapi";
import { updateFullRecipe } from "./recipeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { toast, ToastContainer } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiList, FiEdit2 } from "react-icons/fi";

interface EditRecipeModalProps {
  isOpen: boolean;
  food: Food | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({ isOpen, food, onClose, onSuccess }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    
    const [ingredientRows, setIngredientRows] = useState([
        { ingredient: "", quantity: "", unit: "", notes: "" }
    ]);
    
    const [stepRows, setStepRows] = useState([
        { step_number: "1", instruction: "" }
    ]);
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [ingredientsLoaded, setIngredientsLoaded] = useState(false);
    const [unitsLoaded, setUnitsLoaded] = useState(false);
    const fetchingIngredientsRef = useRef(false);
    const fetchingUnitsRef = useRef(false);

    useEffect(() => {
        if (isOpen && food) {
            fetchInitialData();
        }
    }, [isOpen, food]);

    const fetchIngredients = async () => {
        if (ingredientsLoaded || fetchingIngredientsRef.current) return;
        fetchingIngredientsRef.current = true;
        try {
            const res = await getIngredientList(1, "all");
            setIngredients(res.results || []);
            setIngredientsLoaded(true);
        } catch (err) {
            console.error(err);
        } finally {
            fetchingIngredientsRef.current = false;
        }
    };

    const fetchUnits = async () => {
        if (unitsLoaded || fetchingUnitsRef.current) return;
        fetchingUnitsRef.current = true;
        try {
            const res = await getUnitList(1, "all");
            setUnits(res.results);
            setUnitsLoaded(true);
        } catch (err) {
            console.error(err);
        } finally {
            fetchingUnitsRef.current = false;
        }
    };

    const fetchInitialData = async () => {
        setInitialLoading(true);
        try {
            const [existingIngs, existingSteps, ingList, unitList] = await Promise.all([
                getFoodIngredientList(1, "all", undefined, food!.id),
                getFoodStepList(1, "all", undefined, food!.id),
                ingredients.length === 0 ? getIngredientList(1, "all") : Promise.resolve({ results: ingredients }),
                units.length === 0 ? getUnitList(1, "all") : Promise.resolve({ results: units })
            ]);
            
            if (ingredients.length === 0) {
                setIngredients(ingList.results || []);
                setIngredientsLoaded(true);
            }
            if (units.length === 0) {
                setUnits((unitList as any).results);
                setUnitsLoaded(true);
            }

            if (existingIngs.results && existingIngs.results.length > 0) {
                setIngredientRows(existingIngs.results.map((i: any) => ({
                    ingredient: String(i.ingredient),
                    quantity: String(i.quantity),
                    unit: String(i.unit),
                    notes: i.notes || ""
                })));
            } else {
                setIngredientRows([{ ingredient: "", quantity: "", unit: "", notes: "" }]);
            }

            if (existingSteps.results && existingSteps.results.length > 0) {
                setStepRows(existingSteps.results.sort((a: any, b: any) => a.step_number - b.step_number).map((s: any) => ({
                    step_number: String(s.step_number),
                    instruction: s.instruction
                })));
            } else {
                setStepRows([{ step_number: "1", instruction: "" }]);
            }


        } catch (err) {
            toast.error("Failed to load recipe data.");
        } finally {
            setInitialLoading(false);
        }
    };

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

    const handleUpdate = async () => {
        if (!food) return;

        const hasInvalidIng = ingredientRows.some(r => !r.ingredient || !r.quantity || !r.unit);
        const hasInvalidStep = stepRows.some(s => !s.step_number || !s.instruction);

        if (hasInvalidIng || hasInvalidStep) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await updateFullRecipe({
                food: food.id!,
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
            toast.success("Recipe updated successfully!");
            setTimeout(onSuccess, 1000);
        } catch (err) {
            toast.error("Failed to update.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !food) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-gray-600 z-10">×</button>
                
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                        <FiEdit2 className="text-blue-500" />
                        Edit Recipe: {food.name}
                    </h2>

                    {initialLoading ? (
                        <div className="py-20 text-center text-gray-500">Loading recipe content...</div>
                    ) : (
                        <div className="space-y-8">
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
                                                    <SearchableSelect<string>
                                                        value={row.ingredient}
                                                        onFocus={fetchIngredients}
                                                        onChange={v => handleIngChange(idx, "ingredient", v)}
                                                        options={ingredients.map(i => ({ value: String(i.id), label: i.name }))}
                                                        placeholder="Select Ingredient"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Input placeholder="Qty" type="number" value={row.quantity} onChange={e => handleIngChange(idx, "quantity", e.target.value)} />
                                                        <SearchableSelect<string>
                                                            value={row.unit}
                                                            onFocus={fetchUnits}
                                                            onChange={v => handleIngChange(idx, "unit", v)}
                                                            options={units.map(u => ({ value: String(u.id), label: u.name }))}
                                                            placeholder="Unit"
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
                                    onClick={handleUpdate} 
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <FiSave />
                                    {loading ? "Updating..." : "Update Recipe"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default EditRecipeModal;
