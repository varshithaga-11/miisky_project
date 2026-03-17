import React, { useState, useEffect } from "react";
import { updateHealthParameter, getHealthParameterById } from "./healthparameterapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast } from 'react-toastify';

interface EditHealthParameterProps {
  id: number;
  onClose: () => void;
  onUpdate: () => void;
}

const EditHealthParameter: React.FC<EditHealthParameterProps> = ({ id, onClose, onUpdate }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchHP();
  }, [id]);

  const fetchHP = async () => {
    try {
      const data = await getHealthParameterById(id);
      setName(data.name);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await updateHealthParameter(id, { name });
      toast.success("Updated successfully!");
      onUpdate();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white pb-2">
          Edit Health Parameter
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
            <div>
            <Label htmlFor="name">Parameter Name*</Label>
            <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            </div>
            <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={saveLoading}>
                Cancel
            </Button>
            <Button type="submit" disabled={saveLoading}>
                {saveLoading ? "Saving..." : "Save Changes"}
            </Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditHealthParameter;
