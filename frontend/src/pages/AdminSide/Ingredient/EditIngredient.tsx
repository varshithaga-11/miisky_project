import React, { useEffect, useState } from "react";
import { getIngredientById, updateIngredient } from "./ingredientapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';

const EditIngredient: React.FC<{ ingredientId: number; isOpen: boolean; onClose: () => void; onUpdated: () => void }> = ({ ingredientId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ingredientId) {
      getIngredientById(ingredientId).then(data => setName(data.name)).catch(() => toast.error("Error loading."));
    }
  }, [isOpen, ingredientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateIngredient(ingredientId, { name });
      toast.success("Updated!");
      setTimeout(onUpdated, 1000);
    } catch {
      toast.error("Failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm relative shadow-xl">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl">×</button>
        <h2 className="text-xl font-bold mb-4">Edit Ingredient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Ingredient Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIngredient;
