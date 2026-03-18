import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createFoodName, FoodName } from "./foodnameapi";
import { FoodGroup, getFoodGroupList } from "../FoodGroup/foodgroupapi";

interface AddFoodNameProps {
  onClose: () => void;
  onAdd: (newItem: FoodName) => void;
}

const AddFoodName: React.FC<AddFoodNameProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [foodGroupId, setFoodGroupId] = useState<string>("");
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFoodGroupList(1, "all")
      .then((res) => setFoodGroups(res.results))
      .catch((err) => console.error("Error fetching food groups:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: FoodName = {
        name,
        code: code || null,
        food_group: foodGroupId ? Number(foodGroupId) : null,
      };
      const created = await createFoodName(payload);
      toast.success("Food name created successfully!");
      setTimeout(() => {
        onAdd(created);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        Object.values(err.response.data).forEach((msg: any) => {
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        });
      } else {
        toast.error(err.message || "Failed to create food name");
      }
    } finally {
      setLoading(false);
    }
  };

  const groupOptions = [
    { value: "", label: "Select Food Group (optional)" },
    ...foodGroups.map((g) => ({ value: String(g.id), label: g.name })),
  ];

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add Food Name</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="food_group">Food Group</Label>
            <Select value={foodGroupId} onChange={(val) => setFoodGroupId(val)} options={groupOptions} className="w-full" disabled={loading} />
          </div>

          <div>
            <Label htmlFor="name">Food Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter food name"
            />
          </div>

          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} disabled={loading} placeholder="Enter code (optional)" />
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

export default AddFoodName;

