import React, { useState, useEffect } from "react";
import { createFood, createFoodNutrition, Food, FoodNutrition, getCuisineTypeList, CuisineType } from "./foodapi";
import { getMealTypeList, MealType } from "../MealType/mealtypeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import MultiSelect from "../../../components/form/MultiSelect";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddFoodProps {
  onClose: () => void;
  onAdd: (newFood: Food) => void;
}

const AddFood: React.FC<AddFoodProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Nutrition state
  const [nutrition, setNutrition] = useState<Partial<FoodNutrition>>({
    calories: undefined,
    protein: undefined,
    carbs: undefined,
    fat: undefined,
    fiber: undefined,
    sugar: undefined,
    saturated_fat: undefined,
    trans_fat: undefined,
    sodium: undefined,
    potassium: undefined,
    calcium: undefined,
    iron: undefined,
    vitamin_a: undefined,
    vitamin_c: undefined,
    vitamin_d: undefined,
    vitamin_b12: undefined,
    cholesterol: undefined,
    glycemic_index: undefined,
    serving_size: "",
  });

  useEffect(() => {
    getMealTypeList(1, "all").then(res => setMealTypes(res.results)).catch(console.error);
    getCuisineTypeList(1, "all").then(res => setCuisines(res.results)).catch(console.error);
  }, []);

  const handleNutritionChange = (field: keyof FoodNutrition, value: any) => {
    setNutrition(prev => ({ ...prev, [field]: value === "" ? undefined : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMealTypes.length === 0) {
      toast.error("Please select at least one meal type");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      // Append many-to-many fields
      selectedMealTypes.forEach(id => formData.append("meal_types", id));
      selectedCuisines.forEach(id => formData.append("cuisine_types", id));
      
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
      }

      const createdFood = await createFood(formData);
      
      // Create nutrition record
      await createFoodNutrition({
        ...nutrition,
        food: createdFood.id,
      });

      toast.success("Food item and nutrition details created successfully!");
      setTimeout(() => {
        onAdd(createdFood);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error creating food:", err);
      toast.error(err.message || "Failed to create food item");
    } finally {
      setLoading(false);
    }
  };

  const mealTypeOptions = mealTypes.map(m => ({ value: String(m.id), text: m.name }));
  const cuisineOptions = cuisines.map(c => ({ value: String(c.id), text: c.name }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-5xl relative max-h-[95vh] overflow-y-auto mt-5">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-2">Add Food & Detailed Nutrition</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Basic Info & Macros */}
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider border-b dark:border-gray-700 pb-1">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <MultiSelect label="Meal Types *" options={mealTypeOptions} onChange={setSelectedMealTypes} />
                  </div>
                  <div className="md:col-span-2">
                    <MultiSelect label="Cuisine Types" options={cuisineOptions} onChange={setSelectedCuisines} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Food Name *</Label>
                    <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} placeholder="e.g. Ragi Idli" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea id="description" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} rows={2} />
                  </div>
                  <div>
                    <Label htmlFor="image">Image</Label>
                    <input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700" disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="serving_size">Serving Size</Label>
                    <Input id="serving_size" type="text" value={nutrition.serving_size} onChange={(e) => handleNutritionChange("serving_size", e.target.value)} placeholder="e.g. 100g, 3-4" disabled={loading} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider border-b dark:border-gray-700 pb-1">Primary Macronutrients</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories (kcal)</Label>
                    <Input id="calories" type="number" step="0.1" value={nutrition.calories} onChange={(e) => handleNutritionChange("calories", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input id="protein" type="number" step="0.1" value={nutrition.protein} onChange={(e) => handleNutritionChange("protein", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input id="carbs" type="number" step="0.1" value={nutrition.carbs} onChange={(e) => handleNutritionChange("carbs", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input id="fat" type="number" step="0.1" value={nutrition.fat} onChange={(e) => handleNutritionChange("fat", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input id="fiber" type="number" step="0.1" value={nutrition.fiber} onChange={(e) => handleNutritionChange("fiber", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="glycemic_index">Glycemic Index</Label>
                    <Input id="glycemic_index" type="number" step="0.1" value={nutrition.glycemic_index} onChange={(e) => handleNutritionChange("glycemic_index", e.target.value)} disabled={loading} />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Advanced Macros, Minerals, Vitamins */}
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider border-b dark:border-gray-700 pb-1">Detailed Macros & Fats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="sugar">Sugar (g)</Label>
                    <Input id="sugar" type="number" step="0.1" value={nutrition.sugar} onChange={(e) => handleNutritionChange("sugar", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="saturated_fat">Sat. Fat (g)</Label>
                    <Input id="saturated_fat" type="number" step="0.1" value={nutrition.saturated_fat} onChange={(e) => handleNutritionChange("saturated_fat", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="trans_fat">Trans Fat (g)</Label>
                    <Input id="trans_fat" type="number" step="0.1" value={nutrition.trans_fat} onChange={(e) => handleNutritionChange("trans_fat", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="cholesterol">Cholesterol (mg)</Label>
                    <Input id="cholesterol" type="number" step="0.1" value={nutrition.cholesterol} onChange={(e) => handleNutritionChange("cholesterol", e.target.value)} disabled={loading} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider border-b dark:border-gray-700 pb-1">Minerals (mg)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="sodium">Sodium</Label>
                    <Input id="sodium" type="number" step="0.1" value={nutrition.sodium} onChange={(e) => handleNutritionChange("sodium", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="potassium">Potassium</Label>
                    <Input id="potassium" type="number" step="0.1" value={nutrition.potassium} onChange={(e) => handleNutritionChange("potassium", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="calcium">Calcium</Label>
                    <Input id="calcium" type="number" step="0.1" value={nutrition.calcium} onChange={(e) => handleNutritionChange("calcium", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="iron">Iron</Label>
                    <Input id="iron" type="number" step="0.1" value={nutrition.iron} onChange={(e) => handleNutritionChange("iron", e.target.value)} disabled={loading} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-primary-500 uppercase text-xs tracking-wider border-b dark:border-gray-700 pb-1">Vitamins</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="vitamin_a">Vit A</Label>
                    <Input id="vitamin_a" type="number" step="0.1" value={nutrition.vitamin_a} onChange={(e) => handleNutritionChange("vitamin_a", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="vitamin_c">Vit C</Label>
                    <Input id="vitamin_c" type="number" step="0.1" value={nutrition.vitamin_c} onChange={(e) => handleNutritionChange("vitamin_c", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="vitamin_d">Vit D</Label>
                    <Input id="vitamin_d" type="number" step="0.1" value={nutrition.vitamin_d} onChange={(e) => handleNutritionChange("vitamin_d", e.target.value)} disabled={loading} />
                  </div>
                  <div>
                    <Label htmlFor="vitamin_b12">Vit B12</Label>
                    <Input id="vitamin_b12" type="number" step="0.1" value={nutrition.vitamin_b12} onChange={(e) => handleNutritionChange("vitamin_b12", e.target.value)} disabled={loading} />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 border-t dark:border-gray-700 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Food with Details"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFood;
