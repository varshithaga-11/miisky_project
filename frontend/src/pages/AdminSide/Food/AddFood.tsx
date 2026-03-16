import React, { useState, useEffect } from "react";
import { createFood, Food } from "./foodapi";
import { getFoodCategoryList, FoodCategory } from "../FoodCategory/foodcategoryapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddFoodProps {
  onClose: () => void;
  onAdd: (newFood: Food) => void;
}

const AddFood: React.FC<AddFoodProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFoodCategoryList().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", categoryId);
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
      }

      const createdFood = await createFood(formData);
      toast.success("Food item created successfully!");
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

  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))
  ];

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add New Food</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
              options={categoryOptions}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="name">Food Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. Ragi Idli"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Short description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFood;
