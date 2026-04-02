import React, { useState, useEffect } from "react";
import { updateFoodIngredient, getFoodIngredientList } from "./foodingredientapi";
import { getFoodList, Food } from "../Food/foodapi";
import { getIngredientList, Ingredient } from "../Ingredient/ingredientapi";
import { getUnitList, Unit } from "../Unit/unitapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from 'react-toastify';

interface EditFoodIngredientProps {
    editId: number;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const EditFoodIngredient: React.FC<EditFoodIngredientProps> = ({ editId, isOpen, onClose, onUpdated }) => {
  const [foodId, setFoodId] = useState("");
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState("");
  const [notes, setNotes] = useState("");
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFoodList().then(res => setFoods((res as any).results || res)).catch(console.error);
    getIngredientList().then(res => setIngredients((res as any).results || res)).catch(console.error);
    getUnitList().then(res => setUnits((res as any).results || res)).catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen && editId) {
        setLoading(true);
        // Using getFoodIngredientList to find the specific item since we don't have getById yet
        getFoodIngredientList().then(res => {
            const list = (res as any).results || res;
            const item = (list as any[]).find((fi: any) => fi.id === editId);
            if (item) {
                setFoodId(String(item.food));
                setIngredientId(String(item.ingredient));
                setQuantity(String(item.quantity));
                setUnitId(String(item.unit));
                setNotes(item.notes || "");
            }
        }).finally(() => setLoading(false));
    }
  }, [isOpen, editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateFoodIngredient(editId, {
        food: Number(foodId),
        ingredient: Number(ingredientId),
        quantity: Number(quantity),
        unit: Number(unitId),
        notes
      });
      toast.success("Updated!");
      setTimeout(onUpdated, 1000);
    } catch {
      toast.error("Failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative shadow-xl">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl">×</button>
        <h2 className="text-xl font-bold mb-4">Edit Recipe Ingredient</h2>
        {loading ? <p>Loading...</p> : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Food *</Label>
              <Select
                value={foodId}
                onChange={val => setFoodId(val)}
                options={[{ value: "", label: "Select Food" }, ...foods.map(f => ({ value: String(f.id), label: f.name }))]}
              />
            </div>
            <div>
              <Label>Ingredient *</Label>
              <Select
                value={ingredientId}
                onChange={val => setIngredientId(val)}
                options={[{ value: "", label: "Select Ingredient" }, ...ingredients.map(i => ({ value: String(i.id), label: i.name }))]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity *</Label>
                <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
              <div>
                <Label>Unit *</Label>
                <Select
                  value={unitId}
                  onChange={val => setUnitId(val)}
                  options={[{ value: "", label: "Select Unit" }, ...units.map(u => ({ value: String(u.id), label: u.name }))]}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditFoodIngredient;
