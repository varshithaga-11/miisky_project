import React, { useCallback, useEffect, useState } from "react";
import { createDeliverySlot, fetchApprovedKitchensMinimal, KitchenMinimal } from "./api";
import { dateTo24hTimeString } from "./timeUtils";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import TimePicker from "../../../components/form/timepicker";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Hook } from "flatpickr/dist/types/options";

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

const AddDeliverySlot: React.FC<Props> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [startTime24, setStartTime24] = useState("");
  const [endTime24, setEndTime24] = useState("");
  const [microKitchenId, setMicroKitchenId] = useState<string>("");
  const [kitchens, setKitchens] = useState<KitchenMinimal[]>([]);
  const [loading, setLoading] = useState(false);

  const onStartChange = useCallback<Hook>((selectedDates) => {
    if (selectedDates.length) {
      setStartTime24(dateTo24hTimeString(selectedDates[0]));
    } else {
      setStartTime24("");
    }
  }, []);

  const onEndChange = useCallback<Hook>((selectedDates) => {
    if (selectedDates.length) {
      setEndTime24(dateTo24hTimeString(selectedDates[0]));
    } else {
      setEndTime24("");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchApprovedKitchensMinimal();
        setKitchens(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setLoading(true);
    try {
      await createDeliverySlot({
        name: name.trim(),
        start_time: startTime24 || null,
        end_time: endTime24 || null,
        micro_kitchen: microKitchenId ? parseInt(microKitchenId, 10) : null,
      });
      toast.success("Delivery slot created.");
      onAdded();
      onClose();
    } catch (err: any) {
      console.error(err);
      const d = err?.response?.data;
      toast.error(d?.detail || d?.name?.[0] || "Failed to create slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <ToastContainer position="top-right" />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add delivery slot</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Slots can be global (all kitchens) or limited to one micro kitchen. Times use 12-hour format.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Morning 8–10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TimePicker
              id="delivery-slot-add-start"
              label="Start time"
              placeholder="Start time"
              timeFormat="12"
              minuteIncrement={5}
              onChange={onStartChange}
            />
            <TimePicker
              id="delivery-slot-add-end"
              label="End time"
              placeholder="End time"
              timeFormat="12"
              minuteIncrement={5}
              onChange={onEndChange}
            />
          </div>
          <div>
            <Label>Micro kitchen (optional)</Label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
              value={microKitchenId}
              onChange={(e) => setMicroKitchenId(e.target.value)}
            >
              <option value="">— Global (all kitchens) —</option>
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.brand_name || `Kitchen #${k.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeliverySlot;
