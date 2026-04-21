import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getAllPaymentPlans, verifyPayment, rejectPayment, stopPlan, finishPlan, updateDietPlan, UserDietPlanPayment } from "./api";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { FiCheckCircle, FiXCircle, FiCreditCard, FiImage, FiEdit, FiPower, FiFlag, FiCheckSquare } from "react-icons/fi";

import DatePicker2 from "../../../components/form/date-picker2";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";

const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

/** True when plan end_date is today or earlier (local calendar), so the plan may be marked completed. */
const isEndDateOnOrBeforeToday = (endDate: string | null | undefined): boolean => {
  if (!endDate) return false;
  const end = endDate.slice(0, 10);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const today = `${y}-${m}-${d}`;
  return end <= today;
};

const canMarkPlanCompletedByEndDate = (plan: UserDietPlanPayment): boolean => {
  if (plan.status === "completed") return false;
  return isEndDateOnOrBeforeToday(plan.end_date);
};

type FilterType = "all" | "uploaded" | "verified" | "suggested" | "payment_pending" | "active" | "completed" | "rejected";

const FILTERS: { key: FilterType; label: string; status?: string; payment_status?: string }[] = [
  { key: "all", label: "All" },
  { key: "uploaded", label: "Pending Verification", payment_status: "uploaded" },
  { key: "verified", label: "Verified", payment_status: "verified" },
  { key: "suggested", label: "Suggested", status: "suggested" },
  { key: "payment_pending", label: "Payment Pending", status: "payment_pending" },
  { key: "active", label: "Active", status: "active" },
  { key: "completed", label: "Completed", status: "completed" },
  { key: "rejected", label: "Rejected", status: "rejected" },
];

const PatientPaymentVerificationPage: React.FC = () => {
  const [plans, setPlans] = useState<UserDietPlanPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [verifyModal, setVerifyModal] = useState<UserDietPlanPayment | null>(null);
  const [rejectModal, setRejectModal] = useState<UserDietPlanPayment | null>(null);
  const [stopModal, setStopModal] = useState<UserDietPlanPayment | null>(null);
  const [finishModal, setFinishModal] = useState<UserDietPlanPayment | null>(null);
  const [editModal, setEditModal] = useState<UserDietPlanPayment | null>(null);
  const [startDate, setStartDate] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [kitchenSearch, setKitchenSearch] = useState("");


  const fetchPlans = async () => {
    setLoading(true);
    try {
      const f = FILTERS.find((x) => x.key === filter);
      const trimmedKitchenSearch = kitchenSearch.trim();
      const params =
        f?.status || f?.payment_status || startDateFilter || endDateFilter || trimmedKitchenSearch
          ? {
              status: f?.status,
              payment_status: f?.payment_status,
              start_date: startDateFilter || undefined,
              end_date: endDateFilter || undefined,
              search: trimmedKitchenSearch || undefined,
            }
          : undefined;
      const data = await getAllPaymentPlans(params);
      setPlans(data);
    } catch (error) {
      toast.error("Failed to load payment plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [filter, startDateFilter, endDateFilter, kitchenSearch]);

  const getMinStartDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleVerify = async () => {
    if (!verifyModal) return;
    setActionLoading(verifyModal.id);
    try {
      await verifyPayment(verifyModal.id, startDate || undefined);
      setPlans((prev) => prev.filter((p) => p.id !== verifyModal.id));
      setVerifyModal(null);
      setStartDate("");
      toast.success("Payment verified. Plan is now active!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Verification failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (plan: UserDietPlanPayment) => {
    setRejectModal(plan);
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      await rejectPayment(rejectModal.id);
      fetchPlans();
      toast.success("Payment rejected. Patient can re-upload.");
      setRejectModal(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async () => {
    if (!stopModal) return;
    setActionLoading(stopModal.id);
    try {
      await stopPlan(stopModal.id);
      fetchPlans();
      toast.success("Diet plan stopped.");
      setStopModal(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinish = async () => {
    if (!finishModal) return;
    setActionLoading(finishModal.id);
    try {
      await finishPlan(finishModal.id);
      fetchPlans();
      toast.success("Diet plan marked as finished.");
      setFinishModal(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    setActionLoading(editModal.id);
    try {
      await updateDietPlan(editModal.id, { start_date: startDate });
      fetchPlans();
      toast.success("Plan updated successfully.");
      setEditModal(null);
      setStartDate("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-50/50 dark:bg-gray-900/50 pb-12">
      <PageMeta
        title="Payment Verification"
        description="Verify patient payment screenshots and activate diet plans"
      />
      <PageBreadcrumb pageTitle="Patient Payment Verification" />
      <ToastContainer position="bottom-right" />

      <div className="max-w-full min-w-0 px-4 md:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Patient Payment & Plans
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View all plans suggested by nutritionists. Verify payments and assign start dates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.key
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <DatePicker2
              key={`table-filter-start-${startDateFilter || "empty"}`}
              id="table-filter-start-date"
              label="Start Date"
              value={startDateFilter}
              onChange={(date) => setStartDateFilter(date)}
              placeholder="Select start date"
            />
            <DatePicker2
              key={`table-filter-end-${endDateFilter || "empty"}`}
              id="table-filter-end-date"
              label="End Date"
              value={endDateFilter}
              onChange={(date) => setEndDateFilter(date)}
              placeholder="Select end date"
            />
            <div>
              <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Micro Kitchen
              </label>
              <input
                type="text"
                value={kitchenSearch}
                onChange={(e) => setKitchenSearch(e.target.value)}
                placeholder="Search by kitchen name or code"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDateFilter("");
                  setEndDateFilter("");
                  setKitchenSearch("");
                }}
                disabled={!startDateFilter && !endDateFilter && !kitchenSearch.trim()}
                className="h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>Showing {plans.length} entries</div>
        </div>

        {loading ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-8">
            <div className="animate-pulse text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-20 text-center">
            <FiCreditCard size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter">No plans found</h3>
            <p className="text-gray-500 mt-2">No records match the selected filter.</p>
          </div>
        ) : (
          <div className="max-w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full min-w-0 w-full overflow-x-auto pb-2">
              <Table className="w-max min-w-[1700px] whitespace-nowrap">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patient</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nutritionist</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Plan</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Kitchen</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Paid</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Payment</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Screenshot</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {plans.map((plan, index) => (
                    <TableRow key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {plan.user_details?.first_name} {plan.user_details?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{plan.user_details?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {plan.nutritionist_details?.first_name} {plan.nutritionist_details?.last_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {plan.diet_plan_details?.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ₹{plan.diet_plan_details?.final_amount} • {plan.diet_plan_details?.no_of_days} days
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        {plan.micro_kitchen_details ? (
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {plan.micro_kitchen_details.brand_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {plan.micro_kitchen_details.cuisine_type || "—"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        {plan.approved_on ? (
                          <span>{new Date(plan.approved_on).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        {plan.diet_plan_details?.final_amount ? (
                          <span>₹{plan.diet_plan_details.final_amount}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        {plan.amount_paid ? (
                          <span>₹{plan.amount_paid}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            plan.status === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : plan.status === "suggested"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : plan.status === "payment_pending"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  :                           plan.status === "completed"
                                    ? "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400"
                                    : plan.status === "rejected"
                                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-500"
                          }`}
                        >
                          {plan.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            plan.payment_status === "verified"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : plan.payment_status === "uploaded"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : plan.payment_status === "failed"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-500"
                          }`}
                        >
                          {plan.payment_status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        {plan.payment_screenshot ? (
                          <a
                            href={getMediaUrl(plan.payment_screenshot)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <FiImage size={14} /> View
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                        {plan.payment_uploaded_on && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(plan.payment_uploaded_on).toLocaleString()}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        {plan.payment_status === "uploaded" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setVerifyModal(plan);
                                setStartDate(getMinStartDate());
                              }}
                              disabled={actionLoading !== null}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg"
                            >
                              <FiCheckCircle size={14} /> Verify
                            </button>
                            <button
                              onClick={() => handleReject(plan)}
                              disabled={actionLoading !== null}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                            >
                              <FiXCircle size={14} />
                            </button>
                          </div>
                        ) : plan.payment_status === "verified" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditModal(plan);
                                setStartDate(plan.start_date || "");
                              }}
                              disabled={actionLoading !== null}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                              title="Edit Plan"
                            >
                              <FiEdit size={16} />
                            </button>
                            {plan.status !== "stopped" && (
                              <button
                                onClick={() => setStopModal(plan)}
                                disabled={actionLoading !== null}
                                className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                                title="Stop Plan"
                              >
                                <FiPower size={16} />
                              </button>
                            )}
                            {plan.status !== "completed" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setFinishModal(plan)}
                                  disabled={actionLoading !== null}
                                  className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg"
                                  title="Finish Plan (any time)"
                                >
                                  <FiFlag size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFinishModal(plan)}
                                  disabled={actionLoading !== null || !canMarkPlanCompletedByEndDate(plan)}
                                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                  title={
                                    !plan.end_date
                                      ? "Plan end date is not set"
                                      : !isEndDateOnOrBeforeToday(plan.end_date)
                                        ? "Mark as completed is available on or after the plan end date"
                                        : "Mark plan as completed"
                                  }
                                >
                                  <FiCheckSquare size={14} />
                                  Completed
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Verify Modal - Assign Start Date */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              Verify Payment & Assign Start Date
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {verifyModal.diet_plan_details?.title} – {verifyModal.user_details?.first_name}{" "}
              {verifyModal.user_details?.last_name}
            </p>
            <div className="mb-6">
              <DatePicker2
                id="verify-start-date"
                label="Start Date *"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                placeholder="Select date"
                minDate={getMinStartDate()}
              />
              {verifyModal.diet_plan_details?.no_of_days && (
                <p className="text-xs text-gray-500 mt-2">
                  End date will be {verifyModal.diet_plan_details.no_of_days} days from start.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setVerifyModal(null);
                  setStartDate("");
                }}
                className="flex-1 py-3 rounded-xl font-bold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={actionLoading !== null || !startDate}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  "..."
                ) : (
                  <>
                    <FiCheckCircle /> Verify & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={rejectModal !== null}
        onClose={() => setRejectModal(null)}
        onConfirm={confirmReject}
        isLoading={actionLoading === rejectModal?.id}
        title="Reject Payment?"
        message="Are you sure you want to reject this payment? The patient will be able to re-upload their payment screenshot."
        confirmText="Reject Payment"
      />

      <ConfirmationModal
        isOpen={stopModal !== null}
        onClose={() => setStopModal(null)}
        onConfirm={handleStop}
        isLoading={actionLoading === stopModal?.id}
        title="Stop Plan?"
        message="Are you sure you want to STOP this diet plan? No further meals will be processed."
        confirmText="Stop Plan"
      />

      <ConfirmationModal
        isOpen={finishModal !== null}
        onClose={() => setFinishModal(null)}
        onConfirm={handleFinish}
        isLoading={actionLoading === finishModal?.id}
        title="Finish Plan?"
        message="Are you sure you want to mark this plan as FINISHED?"
        confirmText="Finish Plan"
      />

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase italic tracking-tighter">
              Edit Plan Details
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {editModal.diet_plan_details?.title} – {editModal.user_details?.first_name}
            </p>
            <div className="mb-6">
              <DatePicker2
                id="edit-start-date"
                label="Start Date *"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                placeholder="Select date"
                minDate={getMinStartDate()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditModal(null);
                  setStartDate("");
                }}
                className="flex-1 py-3 rounded-xl font-bold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={actionLoading !== null || !startDate}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPaymentVerificationPage;
