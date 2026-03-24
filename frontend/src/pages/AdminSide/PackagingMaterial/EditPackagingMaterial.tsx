import React, { useEffect, useState } from "react";
import { getPackagingMaterialById, updatePackagingMaterial } from "./api";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface EditPackagingMaterialProps {
  packagingMaterialId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditPackagingMaterial: React.FC<EditPackagingMaterialProps> = ({ packagingMaterialId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && packagingMaterialId) {
      setLoading(true);
      getPackagingMaterialById(packagingMaterialId)
        .then((data) => {
          setName(data.name);
          setDescription(data.description || "");
        })
        .catch(() => toast.error("Failed to load packaging material data"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, packagingMaterialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePackagingMaterial(packagingMaterialId, { name, description });
      toast.success("Packaging Material updated successfully!");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating packaging material:", err);
      toast.error(err.response?.data?.name?.[0] || err.message || "Failed to update packaging material");
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
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Packaging Material</h2>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading packaging material data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Material Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
                placeholder="e.g. Plastic Box"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                placeholder="Describe the packaging material..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
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

export default EditPackagingMaterial;
