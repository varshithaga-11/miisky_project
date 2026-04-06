import React, { useCallback, useEffect, useState } from "react";
import { updateDeliverySlot, DeliverySlot, fetchApprovedKitchensMinimal, KitchenMinimal } from "./api";
import { backendTimeToDate, dateTo24hTimeString, normalizeBackendTime } from "./timeUtils";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import TimePicker from "../../../components/form/timepicker";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Hook } from "flatpickr/dist/types/options";

interface Props {
  slot: DeliverySlot;
  onClose: () => void;
  onUpdated: () => void;
}

const EditDeliverySlot: React.FC<Props> = ({ slot, onClose, onUpdated }) => {
  const [name, setName] = useState(slot.name);
  const [startTime24, setStartTime24] = useState(() => normalizeBackendTime(slot.start_time));
  const [endTime24, setEndTime24] = useState(() => normalizeBackendTime(slot.end_time));
  const [microKitchenId, setMicroKitchenId] = useState<string>(
    slot.micro_kitchen != null ? String(slot.micro_kitchen) : ""
  );
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
      await updateDeliverySlot(slot.id, {
        name: name.trim(),
        start_time: startTime24 || null,
        end_time: endTime24 || null,
        micro_kitchen: microKitchenId ? parseInt(microKitchenId, 10) : null,
      });
      toast.success("Delivery slot updated.");
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      const d = err?.response?.data;
      toast.error(d?.detail || d?.name?.[0] || "Failed to update slot.");
    } finally {
      setLoading(false);
    }
  };

  const startDefault = backendTimeToDate(slot.start_time);
  const endDefault = backendTimeToDate(slot.end_time);

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
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit delivery slot</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Times use 12-hour format.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TimePicker
              key={`start-${slot.id}-${slot.start_time ?? "x"}`}
              id={`delivery-slot-edit-${slot.id}-start`}
              label="Start time"
              placeholder="Start time"
              timeFormat="12"
              minuteIncrement={5}
              defaultTime={startDefault}
              onChange={onStartChange}
            />
            <TimePicker
              key={`end-${slot.id}-${slot.end_time ?? "x"}`}
              id={`delivery-slot-edit-${slot.id}-end`}
              label="End time"
              placeholder="End time"
              timeFormat="12"
              minuteIncrement={5}
              defaultTime={endDefault}
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
              {loading ? "Saving…" : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeliverySlot;
