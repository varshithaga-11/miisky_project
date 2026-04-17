import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, ArrowLeft, Trash2 } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import DatePicker2 from "../../../components/form/date-picker2";
import TimePicker from "../../../components/form/timepicker";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchSupplyChainLeavesPaginated,
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [period, setPeriod] = useState("this_month");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [useTimeWindow, setUseTimeWindow] = useState(false);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This week" },
    { value: "last_week", label: "Last week" },
    { value: "this_month", label: "This month" },
    { value: "last_month", label: "Last month" },
    { value: "next_month", label: "Next month" },
    { value: "this_year", label: "This year" },
    { value: "custom_range", label: "Custom range" },
  ];

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchSupplyChainLeavesPaginated({
        page,
        limit: pageSize,
        period,
        start_date: period === "custom_range" ? filterStartDate || undefined : undefined,
        end_date: period === "custom_range" ? filterEndDate || undefined : undefined,
      });
      setRows(data.results);
      setCount(data.count);
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      console.error(e);
      toast.error("Could not load leave entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, period, filterStartDate, filterEndDate]);

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
      setPage(1);
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: number) => {
    setLeaveToDelete(id);
  };

  const confirmRemove = async () => {
    if (leaveToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteSupplyChainLeave(leaveToDelete);
      toast.success("Leave entry removed successfully");
      setLeaveToDelete(null);
      if (rows.length === 1 && page > 1) {
        setPage((p) => p - 1);
        return;
      }
      await load();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Could not delete leave entry.");
    } finally {
      setIsDeleting(false);
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
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Your upcoming leave</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  if (e.target.value !== "custom_range") {
                    setFilterStartDate("");
                    setFilterEndDate("");
                  }
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {period === "custom_range" && (
                <>
                  <DatePicker2
                    id="leave-filter-start-date"
                    value={filterStartDate}
                    onChange={(v) => {
                      setFilterStartDate(v);
                      setPage(1);
                    }}
                    maxDate={filterEndDate || undefined}
                    placeholder="Filter from"
                  />
                  <DatePicker2
                    id="leave-filter-end-date"
                    value={filterEndDate}
                    onChange={(v) => {
                      setFilterEndDate(v);
                      setPage(1);
                    }}
                    minDate={filterStartDate || undefined}
                    placeholder="Filter to"
                  />
                </>
              )}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    Show {n}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500">
              Showing {count === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, count)} of {count}
            </p>
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
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      <ConfirmationModal
        isOpen={leaveToDelete !== null}
        onClose={() => setLeaveToDelete(null)}
        onConfirm={confirmRemove}
        isLoading={isDeleting}
        title="Remove Leave Entry?"
        message="Are you sure you want to delete this planned leave? This might affect kitchen reassignment planning."
        confirmText="Remove Leave"
      />
    </>
  );
}
