import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, ArrowLeft, Trash2 } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import DatePicker2 from "../../../components/form/date-picker2";
import TimePicker from "../../../components/form/timepicker";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchSupplyChainLeaves,
  createSupplyChainLeave,
  deleteSupplyChainLeave,
  SupplyChainLeave,
} from "../api";

function timeInputToApi(hhmm: string): string {
  if (!hhmm) return "";
  return hhmm.length === 5 ? `${hhmm}:00` : hhmm;
}

function timeFromFlatpickrDate(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatLeaveRange(r: SupplyChainLeave): string {
  if (r.leave_type === "partial") {
    const st = r.start_time || "—";
    const et = r.end_time || "—";
    return `${r.start_date} (${st} - ${et})`;
  }
  return r.start_date === r.end_date ? r.start_date : `${r.start_date} -> ${r.end_date}`;
}

export default function SupplyChainPlannedLeavePage() {
  const [rows, setRows] = useState<SupplyChainLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [useTimeWindow, setUseTimeWindow] = useState(false);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchSupplyChainLeaves();
      setRows(data);
    } catch (e) {
      console.error(e);
      toast.error("Could not load leave entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) {
      toast.error("Choose start and end dates.");
      return;
    }
    if (start > end) {
      toast.error("End date must be on or after start date.");
      return;
    }
    if (useTimeWindow && start !== end) {
      toast.error(
        "Half-day / specific hours apply to a single day only. For multiple days, leave this unchecked for full days, or add one row per day."
      );
      return;
    }
    if (useTimeWindow) {
      if (!timeStart || !timeEnd) {
        toast.error("Enter both start and end time for a half-day or partial window.");
        return;
      }
      if (timeStart >= timeEnd) {
        toast.error("End time must be after start time.");
        return;
      }
    }
    setSaving(true);
    try {
      await createSupplyChainLeave({
        leave_type: useTimeWindow ? "partial" : "full_day",
        start_date: start,
        end_date: end,
        start_time: useTimeWindow ? timeInputToApi(timeStart) : null,
        end_time: useTimeWindow ? timeInputToApi(timeEnd) : null,
        notes: notes.trim() || null,
      });
      toast.success("Leave saved. Micro kitchens you work with can see this.");
      setStart("");
      setEnd("");
      setUseTimeWindow(false);
      setTimeStart("");
      setTimeEnd("");
      setNotes("");
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Remove this leave block?")) return;
    try {
      await deleteSupplyChainLeave(id);
      toast.success("Removed.");
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Could not delete.");
    }
  };

  return (
    <>
      <PageMeta
        title="Planned leave | Supply chain"
        description="Mark days off so kitchens can reassign your deliveries"
      />
      <PageBreadcrumb pageTitle="Planned leave" />
      <ToastContainer position="top-right" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-3xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/supplychain/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <header className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <CalendarRange className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wide">Availability</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planned leave</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Add the dates you will not be available for deliveries. You can mark full days off, or only part of a
            day (e.g. half day). Micro kitchens can review this and use <strong>Daily reassignment</strong> to cover
            those slots.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Add leave</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <DatePicker2
              id="leave-start-date"
              label="From"
              value={start}
              onChange={(v) => setStart(v)}
              placeholder="Start date"
            />
            <DatePicker2
              id="leave-end-date"
              label="To"
              value={end}
              onChange={(v) => setEnd(v)}
              placeholder="End date"
              minDate={start || undefined}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={useTimeWindow}
              onChange={(e) => setUseTimeWindow(e.target.checked)}
            />
            <span>Half day / specific hours only (not the full day)</span>
          </label>
          {useTimeWindow && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3 bg-gray-50/80 dark:bg-gray-800/40">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use the <strong>same</strong> From and To date (one day), then set the time window you are away.
                For several full days off, uncheck this and use From/To as a date range.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <TimePicker
                    id="leave-time-start"
                    label="Unavailable from"
                    placeholder="Select start time"
                    timeFormat="24"
                    defaultTime={timeStart || undefined}
                    onChange={(selectedDates: Date[]) => {
                      if (selectedDates?.[0]) setTimeStart(timeFromFlatpickrDate(selectedDates[0]));
                    }}
                  />
                </div>
                <div>
                  <TimePicker
                    id="leave-time-end"
                    label="Unavailable until"
                    placeholder="Select end time"
                    timeFormat="24"
                    defaultTime={timeEnd || undefined}
                    onChange={(selectedDates: Date[]) => {
                      if (selectedDates?.[0]) setTimeEnd(timeFromFlatpickrDate(selectedDates[0]));
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-h-[72px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Annual leave, medical"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save leave"}
          </button>
        </form>

        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Your upcoming leave</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-sm">No leave entries yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((r) => (
                <li key={r.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white leading-snug">
                      {formatLeaveRange(r)}
                    </p>
                    {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
