import React, { useState } from "react";
import { toast } from "react-toastify";
import { createDepartment, Department } from "./departmentapi";

interface AddDepartmentProps {
  onClose: () => void;
  onAdd: (department: Department) => void;
}

const AddDepartment: React.FC<AddDepartmentProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [head_name, setHeadName] = useState("");
  const [head_email, setHeadEmail] = useState("");
  const [position, setPosition] = useState(1);
  const [is_active, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setLoading(true);
    try {
      const newDepartment: Department = {
        name,
        description: description || undefined,
        head_name: head_name || undefined,
        head_email: head_email || undefined,
        position,
        is_active,
      };

      const created = await createDepartment(newDepartment);
      toast.success("Department created successfully!");
      onAdd(created);
      onClose();
    } catch (error: any) {
      console.error("Error creating department:", error);
      toast.error(error.response?.data?.detail || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Department</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Department Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Department Head Name
            </label>
            <input
              type="text"
              value={head_name}
              onChange={(e) => setHeadName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Department Head Email
            </label>
            <input
              type="email"
              value={head_email}
              onChange={(e) => setHeadEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
              min="1"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={is_active}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
