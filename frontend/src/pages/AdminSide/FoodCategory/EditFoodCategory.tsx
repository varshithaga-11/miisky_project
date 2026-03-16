import React, { useEffect, useState } from "react";
import { getFoodCategoryById, updateFoodCategory } from "./foodcategoryapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface EditFoodCategoryProps {
  categoryId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditFoodCategory: React.FC<EditFoodCategoryProps> = ({ categoryId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && categoryId) {
      setLoading(true);
      getFoodCategoryById(categoryId)
        .then((data) => {
          setName(data.name);
        })
        .catch(() => toast.error("Failed to load category data"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFoodCategory(categoryId, { name });
      toast.success("Food Category updated successfully!");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating category:", err);
      toast.error(err.response?.data?.name?.[0] || err.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Food Category</h2>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading category data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
                placeholder="e.g. Breakfast"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditFoodCategory;
