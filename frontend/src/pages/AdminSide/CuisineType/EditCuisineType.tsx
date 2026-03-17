import React, { useState, useEffect } from "react";
import { updateCuisineType, getCuisineTypeById } from "./cuisinetypeapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface EditCuisineTypeProps {
  cuisineId: number;
  onClose: () => void;
  onUpdated: () => void;
}

const EditCuisineType: React.FC<EditCuisineTypeProps> = ({ cuisineId, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cuisineId) {
       getCuisineTypeById(cuisineId)
        .then(data => {
            setName(data.name);
            setLoading(false);
        })
        .catch(() => {
            toast.error("Failed to load cuisine data");
            onClose();
        });
    }
  }, [cuisineId, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setSaving(true);
    try {
      await updateCuisineType(cuisineId, { name: name.trim() });
      toast.success("Cuisine type updated successfully!");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || "Failed to update cuisine type");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Edit Cuisine Type</h2>

        {loading ? (
             <div className="py-10 text-center">Loading...</div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Cuisine Name *</Label>
                    <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={saving}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button type="submit" disabled={saving}>{saving ? "Updating..." : "Update Cuisine"}</Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default EditCuisineType;
