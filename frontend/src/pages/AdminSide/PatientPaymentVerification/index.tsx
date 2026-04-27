import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  getAllPaymentPlans,
  verifyPayment,
  rejectPayment,
  stopPlan,
  finishPlan,
  updateDietPlan,
  downloadInvoice,
  buildInvoiceFilename,
  UserDietPlanPayment,
  getKitchensDropdown,
  getPatientsDropdown,
  getNutritionistsDropdown,
  getPlansDropdown,
} from "./api";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { FiCheckCircle, FiXCircle, FiCreditCard, FiImage, FiEdit, FiPower, FiFlag, FiCheckSquare, FiDownload } from "react-icons/fi";

import DatePicker2 from "../../../components/form/date-picker2";
import Select from "../../../components/form/Select";
import SearchableSelect from "../../../components/form/SearchableSelect";
import Label from "../../../components/form/Label";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import axios from "axios";

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


const PatientPaymentVerificationPage: React.FC = () => {
  const [plans, setPlans] = useState<UserDietPlanPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState<number | null>(null);
  const [verifyModal, setVerifyModal] = useState<UserDietPlanPayment | null>(null);
  const [rejectModal, setRejectModal] = useState<UserDietPlanPayment | null>(null);
  const [stopModal, setStopModal] = useState<UserDietPlanPayment | null>(null);
  const [finishModal, setFinishModal] = useState<UserDietPlanPayment | null>(null);
  const [editModal, setEditModal] = useState<UserDietPlanPayment | null>(null);
  const [startDate, setStartDate] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [kitchenSearch, setKitchenSearch] = useState("");
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedNutritionist, setSelectedNutritionist] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [nutritionists, setNutritionists] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);


  const fetchPlans = async () => {
    setLoading(true);
    try {
      let s = selectedStatus === "all" ? undefined : selectedStatus;
      let ps = undefined;
      
      if (s === "uploaded") { ps = "uploaded"; s = undefined; }
      if (s === "verified") { ps = "verified"; s = undefined; }

      const params = {
        status: s,
        payment_status: ps,
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
        search: kitchenSearch.trim() || undefined,
        micro_kitchen: selectedKitchen || undefined,
        user: selectedPatient || undefined,
        nutritionist: selectedNutritionist || undefined,
        diet_plan: selectedPlan || undefined,
        period: selectedPeriod || undefined,
      };
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
  }, [startDateFilter, endDateFilter, kitchenSearch, selectedKitchen, selectedPatient, selectedNutritionist, selectedPlan, selectedPeriod, selectedStatus]);

  const loadKitchens = async () => {
    if (kitchens.length > 0) return;
    try {
      const res = await getKitchensDropdown();
      setKitchens(res || []);
    } catch (err) {
      console.error("Failed to load kitchens", err);
    }
  };

  const loadPatients = async () => {
    if (patients.length > 0) return;
    try {
      const res = await getPatientsDropdown();
      setPatients(res || []);
    } catch (err) {
      console.error("Failed to load patients", err);
    }
  };

  const loadNutritionists = async () => {
    if (nutritionists.length > 0) return;
    try {
      const res = await getNutritionistsDropdown();
      setNutritionists(res || []);
    } catch (err) {
      console.error("Failed to load nutritionists", err);
    }
  };

  const loadPlansList = async () => {
    if (plansList.length > 0) return;
    try {
      const res = await getPlansDropdown();
      setPlansList(res || []);
    } catch (err) {
      console.error("Failed to load plans", err);
    }
  };

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

  const handleDownloadInvoice = async (plan: UserDietPlanPayment) => {
    setInvoiceLoading(plan.id);
    const patientName = `${plan.user_details?.first_name || ""} ${plan.user_details?.last_name || ""}`.trim();
    const planName = plan.diet_plan_details?.title || "";
    const preferredFilename = buildInvoiceFilename(patientName, planName);
    try {
      await downloadInvoice(plan.id, preferredFilename);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Invoice download failed");
    } finally {
      setInvoiceLoading(null);
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


        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Micro Kitchen</Label>
              <SearchableSelect
                value={selectedKitchen}
                onChange={(val) => setSelectedKitchen(val as string)}
                onFocus={loadKitchens}
                options={[
                  { value: "", label: "All Kitchens" },
                  ...kitchens.map((k) => ({ value: String(k.id), label: k.brand_name })),
                ]}
                placeholder="Search Kitchen..."
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Patient</Label>
              <SearchableSelect
                value={selectedPatient}
                onChange={(val) => setSelectedPatient(val as string)}
                onFocus={loadPatients}
                options={[
                  { value: "", label: "All Patients" },
                  ...patients.map((p) => ({ value: String(p.id), label: `${p.first_name} ${p.last_name}` })),
                ]}
                placeholder="Search Patient..."
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Nutritionist</Label>
              <SearchableSelect
                value={selectedNutritionist}
                onChange={(val) => setSelectedNutritionist(val as string)}
                onFocus={loadNutritionists}
                options={[
                  { value: "", label: "All Nutritionists" },
                  ...nutritionists.map((n) => ({ value: String(n.id), label: `${n.first_name} ${n.last_name}` })),
                ]}
                placeholder="Search Nutritionist..."
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Plan</Label>
              <SearchableSelect
                value={selectedPlan}
                onChange={(val) => setSelectedPlan(val as string)}
                onFocus={loadPlansList}
                options={[
                  { value: "", label: "All Plans" },
                  ...plansList.map((p) => ({ value: String(p.id), label: p.title })),
                ]}
                placeholder="Search Plan..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Month Period</Label>
              <Select
                value={selectedPeriod}
                onChange={(val) => setSelectedPeriod(val)}
                options={[
                  { value: "all", label: "All Time" },
                  { value: "this_month", label: "This Month" },
                  { value: "last_month", label: "Last Month" },
                  { value: "next_month", label: "Next Month" },
                  { value: "this_quarter", label: "This Quarter" },
                  { value: "this_year", label: "This Year" },
                  { value: "custom_range", label: "Custom Range" },
                ]}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Status</Label>
              <Select
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "uploaded", label: "Pending Verification" },
                  { value: "verified", label: "Verified" },
                  { value: "suggested", label: "Suggested" },
                  { value: "payment_pending", label: "Payment Pending" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
            </div>
            <div className="lg:col-span-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Search Bar</Label>
              <div className="relative">
                <input
                  type="text"
                  value={kitchenSearch}
                  onChange={(e) => setKitchenSearch(e.target.value)}
                  placeholder="Search name, code..."
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedKitchen("");
                  setSelectedPatient("");
                  setSelectedNutritionist("");
                  setSelectedPlan("");
                  setSelectedPeriod("this_month");
                  setSelectedStatus("all");
                  setKitchenSearch("");
                  setStartDateFilter("");
                  setEndDateFilter("");
                }}
                className="h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {selectedPeriod === "custom_range" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <DatePicker2
                id="table-filter-start-date"
                label="Start Date (Custom)"
                value={startDateFilter}
                onChange={(date) => setStartDateFilter(date)}
                placeholder="Select start date"
              />
              <DatePicker2
                id="table-filter-end-date"
                label="End Date (Custom)"
                value={endDateFilter}
                onChange={(date) => setEndDateFilter(date)}
                placeholder="Select end date"
              />
            </div>
          )}
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
                              type="button"
                              onClick={() => handleDownloadInvoice(plan)}
                              disabled={actionLoading !== null || invoiceLoading === plan.id}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Download invoice PDF"
                            >
                              <FiDownload size={14} />
                              {invoiceLoading === plan.id ? "Downloading..." : "Invoice"}
                            </button>
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
