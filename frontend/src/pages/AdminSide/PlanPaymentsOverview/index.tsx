import { Fragment, useEffect, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import {
  fetchPlanPaymentDetail,
  fetchPlanPaymentsOverview,
  PayoutTrackerLine,
  PlanPaymentOverviewRow,
} from "./api";
import {
  getKitchensDropdown,
  getPatientsDropdown,
  getNutritionistsDropdown,
  getPlansDropdown,
} from "../PatientPaymentVerification/api";
import Label from "../../../components/form/Label";
import SearchableSelect from "../../../components/form/SearchableSelect";
import Select from "../../../components/form/Select";
import DatePicker2 from "../../../components/form/date-picker2";
import Button from "../../../components/ui/button/Button";
import { toast } from "react-toastify";

const COL_SPAN = 8;

function fmtMoney(s: string) {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n.toFixed(2) : s;
}

function statusBadge(status: string) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors";
  if (status === "active" || status === "verified") 
    return `${base} bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30`;
  if (status === "completed") 
    return `${base} bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30`;
  if (status === "payment_pending" || status === "uploaded") 
    return `${base} bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30`;
  return `${base} bg-gray-50 text-gray-700 border border-gray-100 dark:bg-white/[0.05] dark:text-gray-400 dark:border-white/[0.1]`;
}

function payoutTypeLabel(t: string) {
  if (t === "platform") return "Platform";
  if (t === "nutritionist") return "Nutritionist";
  if (t === "kitchen") return "Kitchen";
  return t;
}

function DetailBlock({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-white/50 dark:bg-white/[0.02] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="text-gray-400">{icon}</div>}
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</h4>
      </div>
      <div className="text-sm space-y-2">{children}</div>
    </div>
  );
}

function RowDetail({ r }: { r: PlanPaymentOverviewRow }) {
  const trackers = r.payout_trackers || [];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 text-gray-800 dark:text-gray-200">
      <DetailBlock title="Financial Snapshot">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Gross Total</span>
          <span className="text-lg font-black text-gray-900 dark:text-white">₹{fmtMoney(r.total_amount)}</span>
        </div>
        <div className="space-y-1.5 pt-2 border-t border-gray-50 dark:border-white/[0.05]">
          <div className="flex justify-between text-[11px]">
            <span className="text-gray-500">Nutrition Share ({r.nutrition_percent}%)</span>
            <span className="font-bold">₹{fmtMoney(r.nutrition_amount)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-gray-500">Kitchen Share ({r.kitchen_percent}%)</span>
            <span className="font-bold">₹{fmtMoney(r.kitchen_amount)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-gray-500">Platform Retention ({r.platform_percent}%)</span>
            <span className="font-bold">₹{fmtMoney(r.platform_amount)}</span>
          </div>
        </div>
      </DetailBlock>

      <DetailBlock title="Enrollment & Plan">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-900 dark:text-white">UDP #{r.user_diet_plan}</span>
          <span className={statusBadge(r.user_diet_plan_status)}>{r.user_diet_plan_status}</span>
        </div>
        <div className="text-xs space-y-1.5">
          <p className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{r.plan_start_date || "—"} → {r.plan_end_date || "—"}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">Nutritionist</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate ml-4">{r.nutritionist?.name || "—"}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">Kitchen</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate ml-4">{r.micro_kitchen?.brand_name || "—"}</span>
          </p>
        </div>
      </DetailBlock>

      <DetailBlock title="Payment Details">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-black uppercase tracking-tight text-gray-400">Verified</span>
          <span className={`w-2 h-2 rounded-full ${r.is_payment_verified ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`}></span>
        </div>
        <div className="text-xs space-y-1.5">
          <p className="flex justify-between">
            <span className="text-gray-500">Reported Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{r.payment_status || "—"}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-500">Amount Reported</span>
            <span className="font-bold font-mono">{r.amount_paid_reported != null ? `₹${fmtMoney(r.amount_paid_reported)}` : "—"}</span>
          </p>
          <div className="pt-1.5 mt-1.5 border-t border-gray-50 dark:border-white/[0.05]">
            <p className="text-[10px] text-gray-400 uppercase font-black mb-0.5">Reference ID</p>
            <p className="font-mono text-[10px] text-gray-600 dark:text-gray-400 break-all leading-relaxed bg-gray-50 dark:bg-white/[0.02] p-1.5 rounded-lg border border-gray-100 dark:border-white/[0.05]">
              {r.transaction_id || "No Transaction ID"}
            </p>
          </div>
        </div>
      </DetailBlock>

      <DetailBlock title="Registry Events">
        <div className="text-xs space-y-2">
          {r.verified_on ? (
            <div className="flex items-start gap-3">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-500"></div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tight mb-0.5">Verified At</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{new Date(r.verified_on).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <p className="text-[10px] text-gray-400 mt-1">By {r.verified_by_name || "System"}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">No verification timestamp recorded.</p>
          )}
        </div>
      </DetailBlock>

      <DetailBlock title="Tracking Summary">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Disbursed</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{fmtMoney(r.total_disbursed)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Outstanding</p>
            <p className="text-base font-black text-rose-600 dark:text-rose-400">₹{fmtMoney(r.total_outstanding)}</p>
          </div>
        </div>
      </DetailBlock>

      <div className="sm:col-span-2 lg:col-span-3">
        <DetailBlock title="Payout Tracker Records">
          {trackers.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">No payout trackers linked to this snapshot yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.01]">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] min-w-[700px] border-collapse">
                  <thead>
                    <tr className="bg-white/60 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
                      <th className="py-2.5 px-3 text-left font-black uppercase text-gray-400 tracking-tight">Type</th>
                      <th className="py-2.5 px-3 text-left font-black uppercase text-gray-400 tracking-tight">Recipient</th>
                      <th className="py-2.5 px-3 text-left font-black uppercase text-gray-400 tracking-tight">Period</th>
                      <th className="py-2.5 px-3 text-right font-black uppercase text-gray-400 tracking-tight">Total</th>
                      <th className="py-2.5 px-3 text-right font-black uppercase text-gray-400 tracking-tight">Paid</th>
                      <th className="py-2.5 px-3 text-right font-black uppercase text-gray-400 tracking-tight">Remains</th>
                      <th className="py-2.5 px-3 text-center font-black uppercase text-gray-400 tracking-tight">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackers.filter(t => t.payout_type !== 'platform').map((tValue: PayoutTrackerLine) => (
                      <tr key={tValue.id} className="border-b last:border-0 border-gray-100 dark:border-white/[0.05] hover:bg-white/80 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            tValue.payout_type === 'nutritionist' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'
                          }`}>
                            {payoutTypeLabel(tValue.payout_type)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white max-w-[150px] truncate">{tValue.recipient_label}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-gray-500 font-medium italic">
                          {tValue.period_from || "—"} — {tValue.period_to || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black">₹{fmtMoney(tValue.total_amount)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">₹{fmtMoney(tValue.paid_amount)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-rose-600 dark:text-rose-400">₹{fmtMoney(tValue.remaining_amount)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                            tValue.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {tValue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {trackers.some(t => t.payout_type === 'platform') && (
                <div className="bg-gray-100/50 dark:bg-white/[0.05] px-4 py-2 flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                    <span className="font-bold uppercase tracking-widest text-gray-500">Internal Platform Share</span>
                  </div>
                  <span className="font-black text-gray-900 dark:text-white">
                    ₹{fmtMoney(trackers.find(t => t.payout_type === 'platform')?.total_amount || "0.00")}
                  </span>
                </div>
              )}
            </div>
          )}
        </DetailBlock>
      </div>
    </div>
  );
}

export default function PlanPaymentsOverviewPage() {
  const [rows, setRows] = useState<PlanPaymentOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [loadingDetailById, setLoadingDetailById] = useState<Record<number, boolean>>({});

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [selectedNutritionist, setSelectedNutritionist] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("this_month");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [kitchens, setKitchens] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [nutritionists, setNutritionists] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);

  const toggleExpand = async (id: number) => {
    const isExpanding = !expanded.has(id);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (isExpanding) {
      const row = rows.find(r => r.id === id);
      if (row && (!row.payout_trackers || row.payout_trackers.length === 0)) {
        setLoadingDetailById(prev => ({ ...prev, [id]: true }));
        try {
          const detail = await fetchPlanPaymentDetail(id);
          setRows(prevRows => prevRows.map(r => r.id === id ? detail : r));
        } catch (err) {
          console.error("Failed to load details for " + id, err);
        } finally {
          setLoadingDetailById(prev => ({ ...prev, [id]: false }));
        }
      }
    }
  };

  const load = async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await fetchPlanPaymentsOverview(p, 12, q, {
        lite: true,
        patient: selectedPatient || undefined,
        micro_kitchen: selectedKitchen || undefined,
        nutritionist: selectedNutritionist || undefined,
        diet_plan: selectedPlan || undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        period: selectedPeriod,
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
      });
      setRows(res.results || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.count || 0);
    } catch {
      toast.error("Failed to load plan payments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, search);
  }, [page, search, selectedPatient, selectedKitchen, selectedNutritionist, selectedPlan, selectedStatus, selectedPeriod, startDateFilter, endDateFilter]);

  const loadKitchens = async () => {
    if (kitchens.length > 0) return;
    try {
      const res = await getKitchensDropdown();
      setKitchens(res || []);
    } catch (err) {
      console.error("Failed to load kitchens", err);
    }
  };

  const loadPatientsList = async () => {
    if (patientsList.length > 0) return;
    try {
      const res = await getPatientsDropdown();
      setPatientsList(res || []);
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

  return (
    <>
      <PageMeta
        title="Plan payments overview"
        description="All verified diet plan payments with split amounts and patient context"
      />
      <PageBreadcrumb pageTitle="Plan payments overview" />

      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Patient</Label>
                <SearchableSelect
                  value={selectedPatient}
                  onChange={(val) => {
                    setSelectedPatient(val as string);
                    setPage(1);
                  }}
                  onFocus={loadPatientsList}
                  options={[
                    { value: "", label: "All Patients" },
                    ...patientsList.map((p) => ({ value: String(p.id), label: `${p.first_name} ${p.last_name}` })),
                  ]}
                  placeholder="Search Patient..."
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Micro Kitchen</Label>
                <SearchableSelect
                  value={selectedKitchen}
                  onChange={(val) => {
                    setSelectedKitchen(val as string);
                    setPage(1);
                  }}
                  onFocus={loadKitchens}
                  options={[
                    { value: "", label: "All Kitchens" },
                    ...kitchens.map((k) => ({ value: String(k.id), label: k.brand_name })),
                  ]}
                  placeholder="Search Kitchen..."
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Nutritionist</Label>
                <SearchableSelect
                  value={selectedNutritionist}
                  onChange={(val) => {
                    setSelectedNutritionist(val as string);
                    setPage(1);
                  }}
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
                  onChange={(val) => {
                    setSelectedPlan(val as string);
                    setPage(1);
                  }}
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
                  onChange={(val) => {
                    setSelectedPeriod(val);
                    setPage(1);
                  }}
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
                  onChange={(val) => {
                    setSelectedStatus(val);
                    setPage(1);
                  }}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "suggested", label: "Suggested" },
                    { value: "payment_pending", label: "Payment Pending" },
                    { value: "uploaded", label: "Uploaded" },
                    { value: "verified", label: "Verified" },
                    { value: "active", label: "Active" },
                    { value: "completed", label: "Completed" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />
              </div>
              <div className="lg:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Search Bar</Label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSearch(searchInput);
                    setPage(1);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search transaction, code..."
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <button type="submit" className="absolute right-3 top-3 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </button>
                </form>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-lg text-xs font-bold uppercase tracking-wider"
                  onClick={() => {
                    setSelectedPatient("");
                    setSelectedKitchen("");
                    setSelectedNutritionist("");
                    setSelectedPlan("");
                    setSelectedStatus("all");
                    setSelectedPeriod("this_month");
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {selectedPeriod === "custom_range" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <DatePicker2
                  id="start-date"
                  label="Start Date"
                  value={startDateFilter}
                  onChange={(d) => setStartDateFilter(d)}
                />
                <DatePicker2
                  id="end-date"
                  label="End Date"
                  value={endDateFilter}
                  onChange={(d) => setEndDateFilter(d)}
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compiling Records...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/[0.05]">
                <FiSearch className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">No verified plan payments found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
                      <TableCell isHeader className="w-12 px-4 py-4"> </TableCell>
                      <TableCell isHeader className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Reference
                      </TableCell>
                      <TableCell isHeader className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Patient Profile</TableCell>
                      <TableCell isHeader className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Plan Selection</TableCell>
                      <TableCell isHeader className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</TableCell>
                      <TableCell isHeader className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Gross Total</TableCell>
                      <TableCell isHeader className="px-4 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Disbursed / Rem</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const isOpen = expanded.has(r.id);
                      return (
                        <Fragment key={r.id}>
                          <TableRow className={`group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${isOpen ? 'bg-gray-50/50 dark:bg-white/[0.02]' : ''}`}>
                            <TableCell className="px-4 py-4">
                              <button
                                onClick={() => toggleExpand(r.id)}
                                disabled={loadingDetailById[r.id]}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-brand-600 transition-all ${
                                  isOpen ? "rotate-180 border-brand-200 text-brand-600 shadow-sm" : ""
                                }`}
                              >
                                {loadingDetailById[r.id] ? (
                                  <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="text-[11px] font-black text-gray-900 dark:text-white tracking-widest">#{r.id}</div>
                              <div className="text-[9px] font-bold text-gray-400 tracking-tighter uppercase mt-0.5">UDP {r.user_diet_plan}</div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">{r.patient?.name || "Anonymous Patient"}</div>
                              <div className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{r.patient?.email || "No email provided"}</div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="font-bold text-gray-700 dark:text-gray-300 text-xs">{r.diet_plan?.title || "Plan Not Named"}</div>
                              <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">{r.diet_plan?.code || "NO_CODE"}</div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <span className={statusBadge(r.user_diet_plan_status)}>{r.user_diet_plan_status}</span>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right font-black text-gray-900 dark:text-white">
                              ₹{fmtMoney(r.total_amount)}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right">
                              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">₹{fmtMoney(r.total_disbursed)}</div>
                              <div className={`text-[10px] font-black uppercase tracking-tighter mt-0.5 ${parseFloat(r.total_outstanding) > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                                ₹{fmtMoney(r.total_outstanding)} rem
                              </div>
                            </TableCell>
                          </TableRow>
                          {isOpen && (
                            <TableRow className="bg-gray-50/30 dark:bg-white/[0.01]">
                              <TableCell colSpan={COL_SPAN} className="px-6 py-6 border-t border-gray-100 dark:border-white/[0.05] shadow-inner">
                                <RowDetail r={r} />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-white/[0.05] bg-gray-50/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Page <span className="text-gray-900 dark:text-white">{page}</span> of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.1] text-[10px] uppercase font-black tracking-widest text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/[0.05] disabled:opacity-30 transition-all"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.1] text-[10px] uppercase font-black tracking-widest text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/[0.05] disabled:opacity-30 transition-all"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
