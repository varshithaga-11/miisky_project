import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Wallet } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import DatePicker2 from "../../../components/form/date-picker2";
import {
  createMicroKitchenSupplyChainPayout,
  fetchMicroKitchenSupplyChainPayouts,
  updateMicroKitchenSupplyChainPayout,
  SupplyChainPayoutFilters,
  SupplyChainPayoutRow,
} from "./api";
import {
  fetchMicroKitchenDeliveryDashboardSummary,
  fetchMicroKitchenDeliveryTeam,
  DashboardAllottedPlanRow,
  MicroKitchenTeamMember,
} from "../DeliveryManagement/api";

const money = (value?: string | null) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "₹0.00";
  return `₹${parsed.toFixed(2)}`;
};

export default function MicroKitchenSupplyChainPayoutPage() {
  const [rows, setRows] = useState<SupplyChainPayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState<number | "">("");
  const [deliveryPersonFilter, setDeliveryPersonFilter] = useState<number | "">("");
  const [periodFilter, setPeriodFilter] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [sortField, setSortField] = useState<"amount" | "created_at" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [totalAmount, setTotalAmount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [pendingAmount, setPendingAmount] = useState("0");

  const [showCreate, setShowCreate] = useState(false);
  const [formResourcesLoading, setFormResourcesLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<MicroKitchenTeamMember[]>([]);
  const [allottedPlans, setAllottedPlans] = useState<DashboardAllottedPlanRow[]>([]);
  const [deliveryPersonId, setDeliveryPersonId] = useState("");
  const [userDietPlanId, setUserDietPlanId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [amount, setAmount] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<"pending" | "paid">("pending");
  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This week" },
    { value: "last_week", label: "Last week" },
    { value: "this_month", label: "This month" },
    { value: "last_month", label: "Last month" },
    { value: "this_year", label: "This year" },
    { value: "custom_range", label: "Custom range" },
  ];

  const patientLabel = (patient?: { first_name?: string; last_name?: string; id?: number }) => {
    if (!patient) return "Unknown patient";
    const full = `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
    return full || `Patient #${patient.id ?? ""}`;
  };

  const planLabel = (plan: DashboardAllottedPlanRow) => {
    const title = plan.diet_plan_name || `Plan #${plan.id}`;
    if (plan.start_date && plan.end_date) {
      return `${title} (${plan.start_date} to ${plan.end_date})`;
    }
    return title;
  };

  const uniquePatients = allottedPlans.reduce<Array<{ id: number; label: string }>>((acc, plan) => {
    const p = plan.patient_details;
    if (!p?.id) return acc;
    if (!acc.some((x) => x.id === p.id)) {
      acc.push({ id: p.id, label: patientLabel(p) });
    }
    return acc;
  }, []);

  const filteredPlans = allottedPlans.filter((plan) => {
    if (!patientId) return true;
    return String(plan.patient_details?.id || "") === patientId;
  });

  const loadRows = async () => {
    setLoading(true);
    try {
      const filters: SupplyChainPayoutFilters = {
        status: statusFilter || undefined,
        patient_id: patientFilter,
        delivery_person_id: deliveryPersonFilter,
        period: periodFilter,
        start_date: periodFilter === "custom_range" ? startDate || undefined : undefined,
        end_date: periodFilter === "custom_range" ? endDate || undefined : undefined,
      };
      const res = await fetchMicroKitchenSupplyChainPayouts(page, limit, search, filters);
      setRows(res.results || []);
      setTotalPages(res.total_pages || 1);
      setCount(res.count || 0);
      setTotalAmount(res.total_amount || "0");
      setPaidAmount(res.paid_amount || "0");
      setPendingAmount(res.pending_amount || "0");
    } catch {
      toast.error("Failed to load payout records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== searchInput.trim()) {
        setPage(1);
        setSearch(searchInput.trim());
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, statusFilter, patientFilter, deliveryPersonFilter, periodFilter, startDate, endDate]);

  useEffect(() => {
    if (!showCreate) return;
    let cancelled = false;
    (async () => {
      try {
        setFormResourcesLoading(true);
        const [team, dashboard] = await Promise.all([
          fetchMicroKitchenDeliveryTeam(),
          fetchMicroKitchenDeliveryDashboardSummary(),
        ]);
        if (cancelled) return;
        setTeamMembers(team.filter((m) => m.is_active));
        setAllottedPlans(dashboard.allotted_plans || []);
      } catch {
        if (!cancelled) toast.error("Could not load team members or patient plans");
      } finally {
        if (!cancelled) setFormResourcesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showCreate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [team, dashboard] = await Promise.all([
          fetchMicroKitchenDeliveryTeam(),
          fetchMicroKitchenDeliveryDashboardSummary(),
        ]);
        if (cancelled) return;
        setTeamMembers(team.filter((m) => m.is_active));
        setAllottedPlans(dashboard.allotted_plans || []);
      } catch {
        // keep page functional even if auxiliary filters fail
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setDeliveryPersonId("");
    setUserDietPlanId("");
    setPatientId("");
    setAmount("");
    setPeriodFrom("");
    setPeriodTo("");
    setNotes("");
    setNewStatus("pending");
  };

  const onPatientChange = (nextPatientId: string) => {
    setPatientId(nextPatientId);
    if (!nextPatientId) {
      setUserDietPlanId("");
      setPeriodFrom("");
      setPeriodTo("");
      return;
    }
    const plans = allottedPlans.filter((p) => String(p.patient_details?.id || "") === nextPatientId);
    if (plans.length === 0) {
      setUserDietPlanId("");
      setPeriodFrom("");
      setPeriodTo("");
      return;
    }
    if (!plans.some((p) => String(p.id) === userDietPlanId)) {
      const first = plans[0];
      setUserDietPlanId(String(first.id));
      setPeriodFrom(first.start_date || "");
      setPeriodTo(first.end_date || "");
    }
  };

  const onPlanChange = (nextPlanId: string) => {
    setUserDietPlanId(nextPlanId);
    if (!nextPlanId) return;
    const selected = allottedPlans.find((p) => String(p.id) === nextPlanId);
    if (!selected) return;
    if (selected.patient_details?.id) {
      setPatientId(String(selected.patient_details.id));
    }
    setPeriodFrom(selected.start_date || "");
    setPeriodTo(selected.end_date || "");
  };

  const submitNew = async () => {
    const deliveryId = Number(deliveryPersonId);
    if (!deliveryId) {
      toast.error("Delivery person id is required");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await createMicroKitchenSupplyChainPayout({
        delivery_person: deliveryId,
        user_diet_plan: userDietPlanId ? Number(userDietPlanId) : null,
        patient: patientId ? Number(patientId) : null,
        amount: amt.toFixed(2),
        status: newStatus,
        period_from: periodFrom || undefined,
        period_to: periodTo || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success("Payout saved");
      setShowCreate(false);
      resetForm();
      setPage(1);
      await loadRows();
    } catch {
      toast.error("Could not create payout");
    } finally {
      setSaving(false);
    }
  };

  const markAsPaid = async (row: SupplyChainPayoutRow) => {
    try {
      await updateMicroKitchenSupplyChainPayout(row.id, { status: "paid" });
      toast.success("Marked as paid");
      await loadRows();
    } catch {
      toast.error("Could not update payout");
    }
  };

  const handleSort = (field: "amount" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" ? "desc" : "asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    const sorted = [...rows].sort((a, b) => {
      if (sortField === "amount") {
        const av = Number(a.amount || 0);
        const bv = Number(b.amount || 0);
        return sortDirection === "asc" ? av - bv : bv - av;
      }
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? at - bt : bt - at;
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  return (
    <>
      <PageMeta title="Supply Chain Payouts | Micro kitchen" description="Payout records for delivery partners" />
      <PageBreadcrumb pageTitle="Supply chain payouts" />
      <ToastContainer position="bottom-right" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/microkitchen/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add payout
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-xs text-gray-500">Total amount</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{money(totalAmount)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-xs text-gray-500">Paid amount</p>
            <p className="text-2xl font-bold text-emerald-600">{money(paidAmount)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-xs text-gray-500">Pending amount</p>
            <p className="text-2xl font-bold text-amber-600">{money(pendingAmount)}</p>
          </div>
        </div>

        <div className="mb-2 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search delivery person, patient, or plan..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-900"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={patientFilter}
              onChange={(e) => {
                const v = e.target.value;
                setPatientFilter(v ? Number(v) : "");
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              <option value="">All patients</option>
              {uniquePatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={deliveryPersonFilter}
              onChange={(e) => {
                const v = e.target.value;
                setDeliveryPersonFilter(v ? Number(v) : "");
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              <option value="">All delivery persons</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.delivery_person}>
                  {`${m.delivery_person_details?.first_name || ""} ${
                    m.delivery_person_details?.last_name || ""
                  }`.trim() || `User #${m.delivery_person}`}
                </option>
              ))}
            </select>
            <select
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                if (e.target.value !== "custom_range") {
                  setStartDate("");
                  setEndDate("");
                }
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {periodFilter === "custom_range" ? (
              <div className="grid grid-cols-2 gap-2">
                <DatePicker2
                  id="mk-payout-filter-start-date"
                  value={startDate}
                  onChange={(d) => {
                    setStartDate(d);
                    setPage(1);
                  }}
                  maxDate={endDate || undefined}
                  placeholder="From date"
                />
                <DatePicker2
                  id="mk-payout-filter-end-date"
                  value={endDate}
                  onChange={(d) => {
                    setEndDate(d);
                    setPage(1);
                  }}
                  minDate={startDate || undefined}
                  placeholder="To date"
                />
              </div>
            ) : (
              <div />
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {count === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, count)} of {count} entries
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Delivery Person</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patient</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Plan</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Period</TableCell>
                  <TableCell
                    isHeader
                    onClick={() => handleSort("amount")}
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    Amount {sortField === "amount" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell
                    isHeader
                    onClick={() => handleSort("created_at")}
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    Created {sortField === "created_at" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      No payout records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRows.map((row, idx) => (
                    <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(page - 1) * limit + idx + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                        {row.delivery_person_name || row.delivery_person || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                        {row.patient_name || row.patient || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                        {row.plan_name || row.user_diet_plan || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                        {row.period_from || "—"} to {row.period_to || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                        {money(row.amount)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            row.status === "paid"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                          }`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        {row.status === "pending" ? (
                          <Button size="sm" variant="outline" onClick={() => void markAsPaid(row)}>
                            Mark paid
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            Done
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      page === pageNum
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</div>
          </div>
        )}
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full p-6 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create payout</h2>
            {formResourcesLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading team members and plans...</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={deliveryPersonId}
                  onChange={(e) => setDeliveryPersonId(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-950"
                >
                  <option value="">Select team member *</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.delivery_person}>
                      {`${m.delivery_person_details?.first_name || ""} ${m.delivery_person_details?.last_name || ""}`.trim() ||
                        `User #${m.delivery_person}`}
                    </option>
                  ))}
                </select>
                <select
                  value={patientId}
                  onChange={(e) => onPatientChange(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-950"
                >
                  <option value="">Select patient (optional)</option>
                  {uniquePatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <select
                  value={userDietPlanId}
                  onChange={(e) => onPlanChange(e.target.value)}
                  className="sm:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-950"
                >
                  <option value="">Select patient plan (optional)</option>
                  {filteredPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {`${patientLabel(plan.patient_details)} - ${planLabel(plan)}`}
                    </option>
                  ))}
                </select>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount *"
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-950"
                />
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as "pending" | "paid")}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-950"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <DatePicker2
                  id="mk-supply-payout-period-from"
                  label="Period from"
                  value={periodFrom}
                  onChange={(date) => setPeriodFrom(date)}
                  maxDate={periodTo || undefined}
                  placeholder="Select from date"
                />
                <DatePicker2
                  id="mk-supply-payout-period-to"
                  label="Period to"
                  value={periodTo}
                  onChange={(date) => setPeriodTo(date)}
                  minDate={periodFrom || undefined}
                  placeholder="Select to date"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes"
                  rows={3}
                  className="sm:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-950"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setShowCreate(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={() => void submitNew()} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
