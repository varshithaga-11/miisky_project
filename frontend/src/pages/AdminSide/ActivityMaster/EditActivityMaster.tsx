import React, { useEffect, useState } from "react";
import { getActivityMasterById, updateActivityMaster } from "./api";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Props {
  recordId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditActivityMaster: React.FC<Props> = ({ recordId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isOther, setIsOther] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && recordId) {
      setLoading(true);
      getActivityMasterById(recordId)
        .then((data: { name: string; code: string; sort_order: number; is_other: boolean }) => {
          setName(data.name);
          setCode(data.code);
          setSortOrder(data.sort_order ?? 0);
          setIsOther(Boolean(data.is_other));
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, recordId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateActivityMaster(recordId, {
        name: name.trim(),
        code: code.trim(),
        sort_order: Number(sortOrder) || 0,
        is_other: isOther,
      });
      toast.success("Updated.");
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 500);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, unknown> } };
      if (ax.response?.data) Object.values(ax.response.data).forEach((msg) => toast.error(Array.isArray(msg) ? String(msg[0]) : String(msg)));
      else toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative mt-24">
        <button type="button" onClick={onClose} className="absolute top-3 right-3 w-10 h-10 text-4xl text-gray-500">
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit physical activity</h2>
        {loading ? (
          <div className="py-10 text-center">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={saving} />
            </div>
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required disabled={saving} />
            </div>
            <div>
              <Label htmlFor="sort_order">Sort order</Label>
              <Input
                id="sort_order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                disabled={saving}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_other"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={isOther}
                onChange={(e) => setIsOther(e.target.checked)}
                disabled={saving}
              />
              <Label htmlFor="is_other" className="mb-0 cursor-pointer">
                “Other” option (free text for users)
              </Label>
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

export default EditActivityMaster;
