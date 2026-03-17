import React, { useState } from "react";
import { createCuisineType, CuisineType } from "./cuisinetypeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AddCuisineTypeProps {
  onClose: () => void;
  onAdd: (newCuisine: CuisineType) => void;
}

const AddCuisineType: React.FC<AddCuisineTypeProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setLoading(true);
    try {
      const resp = await createCuisineType({ name: name.trim() });
      toast.success("Cuisine type created successfully!");
      setTimeout(() => {
        onAdd(resp);
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || "Failed to create cuisine type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Add New Cuisine Type</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Cuisine Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Indian"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Cuisine"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCuisineType;
