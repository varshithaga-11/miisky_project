import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import SearchableSelect from "../../../components/form/SearchableSelect";
import "react-toastify/dist/ReactToastify.css";
import { getFoodNameById, updateFoodName } from "./foodnameapi";
import { FoodGroup, getFoodGroupList } from "../FoodGroup/foodgroupapi";

interface EditFoodNameProps {
  foodNameId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditFoodName: React.FC<EditFoodNameProps> = ({ foodNameId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [image, setImage] = useState<File | string | null>(null);
  const [foodGroupId, setFoodGroupId] = useState<string>("");
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image || typeof image === "string") {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  useEffect(() => {
    getFoodGroupList(1, "all")
      .then((res) => setFoodGroups(res.results))
      .catch((err) => console.error("Error fetching food groups:", err));
  }, []);

  useEffect(() => {
    if (!isOpen || !foodNameId) return;
    setLoading(true);
    getFoodNameById(foodNameId)
      .then((data) => {
        setName(data.name || "");
        setCode(data.code || "");
        setImage(data.image || null);
        setFoodGroupId(data.food_group ? String(data.food_group) : "");
      })
      .catch(() => toast.error("Failed to load food name"))
      .finally(() => setLoading(false));
  }, [foodNameId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFoodName(foodNameId, {
        name,
        code: code || null,
        food_group: foodGroupId ? Number(foodGroupId) : null,
        image: image instanceof File ? image : undefined,
      });
      toast.success("Food name updated successfully!");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        Object.values(err.response.data).forEach((msg: any) => {
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        });
      } else {
        toast.error(err.message || "Failed to update food name");
      }
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = [
    { value: "", label: "Select Food Group (optional)" },
    ...foodGroups.map((g) => ({ value: String(g.id), label: g.name })),
  ];

  if (!isOpen) return null;

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
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Food Name</h2>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="food_group">Food Group</Label>
              <SearchableSelect
                value={foodGroupId}
                onChange={(val) => setFoodGroupId(String(val))}
                options={groupOptions}
                className="w-full"
                disabled={saving}
                placeholder="Select Food Group"
              />
            </div>

            <div>
              <Label htmlFor="name">Food Name *</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} />
            </div>

            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} disabled={saving} />
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2"
                disabled={saving}
              />
              {(preview || (image && typeof image === "string")) && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">{preview ? "New Preview:" : "Current Image:"}</p>
                  <img 
                    src={preview || (image as string)} 
                    alt="Food logo" 
                    className="h-20 w-20 object-cover rounded-lg border border-gray-200" 
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditFoodName;

