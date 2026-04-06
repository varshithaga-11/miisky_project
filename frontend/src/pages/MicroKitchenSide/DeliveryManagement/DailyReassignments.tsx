import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import DatePicker2 from "../../../components/form/date-picker2";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchMealDeliveryAssignments,
  fetchSupplyChainUsers,
  reassignMealDelivery,
  MealDeliveryAssignment,
  SupplyChainUser,
} from "./api";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DailyReassignmentsPage() {
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<MealDeliveryAssignment[]>([]);
  const [staff, setStaff] = useState<SupplyChainUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassignId, setReassignId] = useState<number | null>(null);
  const [newPersonId, setNewPersonId] = useState("");
  const [reason, setReason] = useState("On leave");

  const load = async () => {
    try {
      setLoading(true);
      const [m, s] = await Promise.all([fetchMealDeliveryAssignments(date), fetchSupplyChainUsers()]);
      setRows(m);
      setStaff(s);
    } catch (e) {
      console.error(e);
      toast.error("Could not load meal deliveries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  const submitReassign = async () => {
    if (reassignId == null || !newPersonId) {
      toast.error("Choose a delivery person.");
      return;
    }
    try {
      const updated = await reassignMealDelivery(reassignId, parseInt(newPersonId, 10), reason);
      setRows((prev) => prev.map((r) => (r.id === reassignId ? { ...r, ...updated } : r)));
      setReassignId(null);
      setNewPersonId("");
      toast.success("Meal reassigned for this day only.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Reassign failed.");
    }
  };

  return (
    <>
      <PageMeta title="Daily meal reassignment | Micro Kitchen" />
      <PageBreadcrumb pageTitle="Daily meal reassignment" />
      <ToastContainer position="top-right" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/microkitchen/delivery"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Delivery hub
          </Link>
        </div>

        <header className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Daily meal reassignment</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              Reassign a single meal when the usual delivery person is unavailable. The global plan assignment is not
              changed — future meals still follow the default unless you change it under{" "}
              <Link className="text-indigo-600 underline" to="/microkitchen/delivery/global">
                global assignment
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <DatePicker2
                id="microkitchen-daily-reassign-date"
                label="Date"
                value={date}
                onChange={(v) => setDate(v)}
                placeholder="Select date"
              />
            </div>
            <button
              type="button"
              onClick={() => load()}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center text-gray-500">
            No active meal deliveries for this date. Assign meals from the nutritionist flow first; deliveries appear
            here when user meals exist for your kitchen.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Meal</th>
                  <th className="px-4 py-3 font-medium">Assigned to</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium w-40"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800/80">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {r.user_meal_details?.patient_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-gray-100">{r.user_meal_details?.food_name || "—"}</div>
                      <div className="text-xs text-gray-500">{r.user_meal_details?.meal_type || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      {r.delivery_person_details
                        ? `${r.delivery_person_details.first_name || ""} ${r.delivery_person_details.last_name || ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">{r.status.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setReassignId(r.id);
                          setNewPersonId(r.delivery_person != null ? String(r.delivery_person) : "");
                          setReason("On leave");
                        }}
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reassignId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reassign this meal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Only this delivery row is updated. Tomorrow’s route still follows the global assignment.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">New delivery person</label>
                <select
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={newPersonId}
                  onChange={(e) => setNewPersonId(e.target.value)}
                >
                  <option value="">Select…</option>
                  {staff.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Reason (optional)</label>
                <input
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReassign}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
