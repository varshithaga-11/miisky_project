import React, { useState } from "react";
import { createMealType, MealType } from "./mealtypeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserRoleFromToken } from "../../../utils/auth";
import { FiInfo } from "react-icons/fi";

interface AddMealTypeProps {
  onClose: () => void;
  onAdd: (newType: MealType) => void;
}

const AddMealType: React.FC<AddMealTypeProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const userRole = getUserRoleFromToken();
  const isAdmin = userRole === "admin" || userRole === "master";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newType: MealType = { name };
      const createdType = await createMealType(newType);
      toast.success("Meal Type created successfully!");
      setTimeout(() => {
        onAdd(createdType);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error creating meal type:", err);
      toast.error(err.response?.data?.name?.[0] || err.message || "Failed to create meal type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add New Meal Type</h2>
        
        {!isAdmin && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Please don't repeat same word it may cause problems.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Meal Type Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. Breakfast"
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

export default AddMealType;
