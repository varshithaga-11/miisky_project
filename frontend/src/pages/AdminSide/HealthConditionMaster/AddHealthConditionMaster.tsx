import React, { useState } from "react";
import { createHealthConditionMaster } from "./api";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CATEGORY_OPTIONS = [
  { value: "chronic", label: "Chronic" },
  { value: "infectious", label: "Infectious" },
  { value: "metabolic", label: "Metabolic" },
  { value: "digestive", label: "Digestive" },
  { value: "other", label: "Other" },
];

interface Props {
  onClose: () => void;
  onAdd: () => void;
}

const AddHealthConditionMaster: React.FC<Props> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createHealthConditionMaster({ name: name.trim(), category, sort_order: Number(sortOrder) || 0 });
      toast.success("Health condition created.");
      setTimeout(() => {
        onAdd();
        onClose();
      }, 500);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, unknown> } };
      const errors = ax.response?.data;
      if (errors) {
        Object.values(errors).forEach((msg) => {
          toast.error(Array.isArray(msg) ? String(msg[0]) : String(msg));
        });
      } else {
        toast.error("Failed to create.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add health condition</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} placeholder="e.g. Type 2 diabetes" />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={category}
              onChange={(val) => setCategory(String(val))}
              options={CATEGORY_OPTIONS}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHealthConditionMaster;
