import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { createMealPackage, getMealTypeList } from "./api";
import { toast } from "react-toastify";
import Checkbox from "../../../components/form/input/Checkbox";

interface AddMealPackageProps {
  onClose: () => void;
  onAdd: () => void;
}

const AddMealPackage: React.FC<AddMealPackageProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    meal_types: [] as number[],
    description: "",
    is_active: true,
    sort_order: 0,
    estimation_amount: "" as any,
  });
  const [mealTypes, setMealTypes] = useState<{ id: number; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMealTypes();
  }, []);

  const fetchMealTypes = async () => {
    try {
      const data = await getMealTypeList();
      setMealTypes(data);
    } catch (error) {
      console.error("Error fetching meal types:", error);
    }
  };

  const handleToggleMealType = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      meal_types: prev.meal_types.includes(id)
        ? prev.meal_types.filter((t) => t !== id)
        : [...prev.meal_types, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (formData.meal_types.length === 0) {
        toast.error("At least one meal type must be selected.");
        return;
    }

    setIsSubmitting(true);
    try {
      await createMealPackage(formData);
      toast.success("Meal package created successfully.");
      onAdd();
    } catch (error: any) {
      toast.error(error.response?.data?.name?.[0] || "Failed to create meal package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[500px] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Meal Package</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create a new package template for diet plans.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Package Name <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            placeholder="e.g. Breakfast + Lunch"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Select Meal Types <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {mealTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.meal_types.includes(type.id)}
                  onChange={() => handleToggleMealType(type.id)}
                />
                <span className="text-sm dark:text-white/90">{type.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            placeholder="Describe this package..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <Label>Estimation Amount (₹)</Label>
          <Input
            type="number"
            placeholder="e.g. 150"
            value={formData.estimation_amount}
            onChange={(e) => setFormData({ ...formData, estimation_amount: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2 mt-8">
            <Checkbox
              checked={formData.is_active}
              onChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label className="mb-0">Is Active</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Package"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMealPackage;
