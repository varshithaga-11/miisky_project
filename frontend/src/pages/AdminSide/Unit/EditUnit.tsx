import React, { useEffect, useState } from "react";
import { getUnitById, updateUnit } from "./unitapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';

const EditUnit: React.FC<{ unitId: number; isOpen: boolean; onClose: () => void; onUpdated: () => void }> = ({ unitId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && unitId) {
      getUnitById(unitId).then(data => setName(data.name)).catch(() => toast.error("Error loading."));
    }
  }, [isOpen, unitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUnit(unitId, { name });
      toast.success("Updated!");
      setTimeout(onUpdated, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || err.response?.data?.detail || err.message || "Failed to update unit.");
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
        <h2 className="text-xl font-bold mb-4">Edit Unit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Unit Name *</Label>
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

export default EditUnit;
