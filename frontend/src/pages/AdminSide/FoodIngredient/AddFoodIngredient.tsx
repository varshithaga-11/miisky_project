import React, { useState, useEffect } from "react";
import { createFoodIngredient } from "./foodingredientapi";
import { getFoodList, Food } from "../Food/foodapi";
import { getIngredientList, Ingredient } from "../Ingredient/ingredientapi";
import { getUnitList, Unit } from "../Unit/unitapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from 'react-toastify';
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface AddFoodIngredientProps {
  onClose: () => void;
  onAdd: () => void;
  initialFoodId?: string;
}

interface IngredientForm {
  ingredient: string;
  quantity: string;
  unit: string;
  notes: string;
}

const AddFoodIngredient: React.FC<AddFoodIngredientProps> = ({ onClose, onAdd, initialFoodId }) => {
  const [foodId, setFoodId] = useState(initialFoodId || "");
  const [ingredientRows, setIngredientRows] = useState<IngredientForm[]>([
    { ingredient: "", quantity: "", unit: "", notes: "" }
  ]);
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFoodList().then(setFoods).catch(console.error);
    getIngredientList().then(setIngredients).catch(console.error);
    getUnitList().then(setUnits).catch(console.error);
  }, []);

  const addIngredientRow = () => {
    setIngredientRows([...ingredientRows, { ingredient: "", quantity: "", unit: "", notes: "" }]);
  };

  const removeIngredientRow = (index: number) => {
    if (ingredientRows.length > 1) {
      setIngredientRows(ingredientRows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (index: number, field: keyof IngredientForm, value: string) => {
    const updatedRows = [...ingredientRows];
    updatedRows[index][field] = value;
    setIngredientRows(updatedRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodId) {
      toast.error("Please select a food item.");
      return;
    }

    const invalidRow = ingredientRows.find(r => !r.ingredient || !r.quantity || !r.unit);
    if (invalidRow) {
      toast.error("Please fill in all ingredients, quantities, and units.");
      return;
    }

    setLoading(true);
    try {
      for (const row of ingredientRows) {
        await createFoodIngredient({
          food: Number(foodId),
          ingredient: Number(row.ingredient),
          quantity: Number(row.quantity),
          unit: Number(row.unit),
          notes: row.notes
        });
      }
      toast.success(`${ingredientRows.length} ingredient(s) added!`);
      setTimeout(onAdd, 1000);
    } catch {
      toast.error("Failed to add ingredients.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-4xl relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl font-bold text-gray-400 hover:text-gray-600">×</button>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Add Recipe Ingredients</h2>
        
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
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Ingredients List</h3>
                <button 
                  type="button" 
                  onClick={addIngredientRow}
                  className="flex items-center gap-1 text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                >
                  <FiPlus /> Add Ingredient
                </button>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold uppercase text-gray-500">
                <div className="col-span-4">Ingredient *</div>
                <div className="col-span-2">Qty *</div>
                <div className="col-span-2">Unit *</div>
                <div className="col-span-3">Notes</div>
                <div className="col-span-1"></div>
            </div>

            {ingredientRows.map((row, index) => (
              <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-4 bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="md:col-span-4">
                  <Label className="md:hidden">Ingredient *</Label>
                  <Select
                    value={row.ingredient}
                    onChange={val => handleRowChange(index, "ingredient", val)}
                    options={[{ value: "", label: "Select" }, ...ingredients.map(i => ({ value: String(i.id), label: i.name }))]}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="md:hidden">Qty *</Label>
                  <Input 
                    type="number" 
                    value={row.quantity} 
                    onChange={e => handleRowChange(index, "quantity", e.target.value)} 
                    placeholder="Qty"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="md:hidden">Unit *</Label>
                  <Select
                    value={row.unit}
                    onChange={val => handleRowChange(index, "unit", val)}
                    options={[{ value: "", label: "Select" }, ...units.map(u => ({ value: String(u.id), label: u.name }))]}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label className="md:hidden">Notes</Label>
                  <Input 
                    value={row.notes} 
                    onChange={e => handleRowChange(index, "notes", e.target.value)} 
                    placeholder="e.g. shredded"
                  />
                </div>
                <div className="md:col-span-1 flex items-center justify-end">
                  {ingredientRows.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeIngredientRow(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save All Ingredients"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodIngredient;
