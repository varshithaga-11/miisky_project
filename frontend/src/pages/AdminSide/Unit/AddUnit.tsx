import React, { useState } from "react";
import { createUnit } from "./unitapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import { getUserRoleFromToken } from "../../../utils/auth";
import { FiInfo } from "react-icons/fi";

const AddUnit: React.FC<{ onClose: () => void; onAdd: () => void }> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const userRole = getUserRoleFromToken();
  const isAdmin = userRole === "admin" || userRole === "master";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUnit({ name });
      toast.success("Unit created!");
      setTimeout(onAdd, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.name?.[0] || err.response?.data?.detail || err.message || "Failed to create unit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm relative shadow-xl">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl">×</button>
        <h2 className="text-xl font-bold mb-4">Add Unit</h2>
        {!isAdmin && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Please don't repeat same word it may cause problems.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Unit Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Gram" />
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

export default AddUnit;
