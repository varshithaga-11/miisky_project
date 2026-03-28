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
  const [icon_class, setIconClass] = useState("icon-18");
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
        icon_class,
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
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
        <div className="mb-8 border-b pb-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Add Cluster</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Department Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Department Head Name
              </label>
              <input
                type="text"
                value={head_name}
                onChange={(e) => setHeadName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Department Head Email
              </label>
              <input
                type="email"
                value={head_email}
                onChange={(e) => setHeadEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Position
              </label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Icon Class
              </label>
              <input
                type="text"
                value={icon_class}
                onChange={(e) => setIconClass(e.target.value)}
                placeholder="e.g. icon-18, icon-22"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center group cursor-pointer inline-flex">
              <input
                type="checkbox"
                id="add_dept_active"
                checked={is_active}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="add_dept_active" className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wide group-hover:text-blue-600 transition-colors cursor-pointer select-none">Active</label>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loading ? "Creating..." : "Create Cluster"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-400 font-black py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
