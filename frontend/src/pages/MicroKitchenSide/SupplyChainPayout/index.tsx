import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Wallet, Loader, Search, Calendar, User, MoreVertical, CheckCircle } from "lucide-react";
import { FiSearch, FiCalendar, FiUser, FiMoreVertical, FiCheckCircle, FiLoader } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import DatePicker2 from "../../../components/form/date-picker2";
import { FilterBar } from "../../../components/common";
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [patientFilter, setPatientFilter] = useState<number | "">("");
    const [deliveryPersonFilter, setDeliveryPersonFilter] = useState<number | "">("");
    const [period, setPeriod] = useState("this_month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [count, setCount] = useState(0);
    const [totalAmount, setTotalAmount] = useState("0");
    const [paidAmount, setPaidAmount] = useState("0");
    const [pendingAmount, setPendingAmount] = useState("0");

    const [showCreate, setShowCreate] = useState(false);
    const [formResourcesLoading, setFormResourcesLoading] = useState(false);
    const [teamMembers, setTeamMembers] = useState<MicroKitchenTeamMember[]>([]);
    const [allottedPlans, setAllottedPlans] = useState<DashboardAllottedPlanRow[]>([]);
    
    // Form fields
    const [deliveryPersonId, setDeliveryPersonId] = useState("");
    const [userDietPlanId, setUserDietPlanId] = useState("");
    const [patientId, setPatientId] = useState("");
    const [amount, setAmount] = useState("");
    const [periodFrom, setPeriodFrom] = useState("");
    const [periodTo, setPeriodTo] = useState("");
    const [notes, setNotes] = useState("");
    const [newStatus, setNewStatus] = useState<"pending" | "paid">("pending");

    const loadRows = useCallback(async (p = 1, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const filters: SupplyChainPayoutFilters = {
                status: statusFilter || undefined,
                patient_id: patientFilter,
                delivery_person_id: deliveryPersonFilter,
                period: period,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            };
            const res = await fetchMicroKitchenSupplyChainPayouts(p, 10, search, filters);
            if (isLoadMore) {
                setRows(prev => [...prev, ...(res.results || [])]);
            } else {
                setRows(res.results || []);
            }
            setCount(res.count || 0);
            setPage(res.current_page || p);
            setHasMore(res.current_page < res.total_pages);
            setTotalAmount(res.total_amount || "0");
            setPaidAmount(res.paid_amount || "0");
            setPendingAmount(res.pending_amount || "0");
        } catch {
            toast.error("Failed to load payout records");
            if (!isLoadMore) setRows([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [statusFilter, patientFilter, deliveryPersonFilter, period, startDate, endDate, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadRows(1, false);
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [loadRows]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                loadRows(page + 1, true);
            }
        }, { threshold: 0.1 });
        const el = document.getElementById("payout-sentinel");
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, page, loadRows]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [team, dashboard] = await Promise.all([
                    fetchMicroKitchenDeliveryTeam(),
                    fetchMicroKitchenDeliveryDashboardSummary(),
                ]);
                setTeamMembers(team.filter((m) => m.is_active));
                setAllottedPlans(dashboard.allotted_plans || []);
            } catch {
                console.error("Failed to load bootstrap mapping data");
            }
        };
        loadInitialData();
    }, []);

    const uniquePatients = useMemo(() => {
        const acc: Array<{ id: number; label: string }> = [];
        allottedPlans.forEach(plan => {
            const p = plan.patient_details;
            if (p?.id && !acc.some(x => x.id === p.id)) {
                const full = `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Patient #${p.id}`;
                acc.push({ id: p.id, label: full });
            }
        });
        return acc;
    }, [allottedPlans]);

    const filteredPlans = useMemo(() => {
        if (!patientId) return allottedPlans;
        return allottedPlans.filter(p => String(p.patient_details?.id) === patientId);
    }, [allottedPlans, patientId]);

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

    const onPatientChange = (nextId: string) => {
        setPatientId(nextId);
        if (!nextId) {
            setUserDietPlanId("");
            setPeriodFrom("");
            setPeriodTo("");
            return;
        }
        const plans = allottedPlans.filter(p => String(p.patient_details?.id) === nextId);
        if (plans.length > 0) {
            const first = plans[0];
            setUserDietPlanId(String(first.id));
            setPeriodFrom(first.start_date || "");
            setPeriodTo(first.end_date || "");
        }
    };

    const submitNew = async () => {
        if (!deliveryPersonId) return toast.error("Select delivery person");
        if (!amount || Number(amount) <= 0) return toast.error("Enter valid amount");
        
        setSaving(true);
        try {
            await createMicroKitchenSupplyChainPayout({
                delivery_person: Number(deliveryPersonId),
                user_diet_plan: userDietPlanId ? Number(userDietPlanId) : null,
                patient: patientId ? Number(patientId) : null,
                amount: Number(amount).toFixed(2),
                status: newStatus,
                period_from: periodFrom || undefined,
                period_to: periodTo || undefined,
                notes: notes.trim() || undefined,
            });
            toast.success("Payout record persisted");
            setShowCreate(false);
            resetForm();
            loadRows(1, false);
        } catch {
            toast.error("Critical error while saving payout");
        } finally {
            setSaving(false);
        }
    };

    const markAsPaid = async (row: SupplyChainPayoutRow) => {
        try {
            await updateMicroKitchenSupplyChainPayout(row.id, { status: "paid" });
            toast.success("Transaction updated to PAID");
            setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "paid" } : r));
        } catch {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
            <PageMeta title="Logistics Settlements | Miisky" description="Financial records for delivery partners" />
            <PageBreadcrumb pageTitle="Supply Chain Settlements" />
            <ToastContainer position="top-right" />

            <div className="px-4 md:px-8 pb-20 max-w-7xl mx-auto">
                <div className="flex flex-col gap-8">
                    {/* Header & Stats */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                Logistics Payouts
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium italic">
                                Financial reconciliation for supply chain distribution partners.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/microkitchen/dashboard" className="p-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-colors shadow-sm border border-gray-100 dark:border-white/5">
                                <ArrowLeft size={20} />
                            </Link>
                            <Button onClick={() => setShowCreate(true)} className="!rounded-2xl !py-3 !px-6 shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-[10px] font-black italic">
                                <Plus size={16} className="mr-2" /> Initialize Payout
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-[32px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                <Wallet size={80} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Gross Obligation</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white italic">{money(totalAmount)}</p>
                        </div>
                        <div className="p-8 rounded-[32px] bg-emerald-600 dark:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <FiCheckCircle size={80} />
                            </div>
                            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-4">Settled Funds</p>
                            <p className="text-4xl font-black italic">{money(paidAmount)}</p>
                        </div>
                        <div className="p-8 rounded-[32px] bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-500/10 shadow-xl shadow-gray-200/40 dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                <FiLoader size={80} className="text-amber-500" />
                            </div>
                            <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">Pending Disbursement</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white italic">{money(pendingAmount)}</p>
                        </div>
                    </div>

                    {/* Operational Controls */}
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[300px]">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Search Database</label>
                                <div className="relative group/search">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Identifier, Partner, or Consumer..."
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all italic"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-56">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Financial State</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm font-bold text-sm"
                                >
                                    <option value="">All Transactions</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                            <div className="w-full md:w-64">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Logistics Partner</label>
                                <select
                                    value={deliveryPersonFilter}
                                    onChange={(e) => setDeliveryPersonFilter(e.target.value ? Number(e.target.value) : "")}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm font-bold text-sm"
                                >
                                    <option value="">All Partners</option>
                                    {teamMembers.map(m => (
                                        <option key={m.id} value={m.delivery_person}>
                                            {m.delivery_person_details?.first_name} {m.delivery_person_details?.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <FilterBar 
                            startDate={startDate}
                            endDate={endDate}
                            activePeriod={period}
                            onPeriodChange={setPeriod}
                            onFilterChange={(s: string, e: string, p: string) => {
                                setStartDate(s);
                                setEndDate(e);
                                setPeriod(p);
                            }}
                        />
                    </div>

                    {/* Data Presentation */}
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none">
                        <div className="overflow-x-auto">
                            <Table className="min-w-[1000px]">
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/40">
                                        <TableCell isHeader className="px-6 py-4">Fulfillment Details</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Settlement Window</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Amount</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Verification</TableCell>
                                        <TableCell isHeader className="px-6 py-4 text-right">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && page === 1 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <FiLoader className="size-8 text-indigo-500 animate-spin" />
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Synchronizing ledger...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-32 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                                No settlement records match your parameters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((row) => (
                                            <TableRow key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-gray-50 dark:border-white/5 last:border-0 group">
                                                <TableCell className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                            <FiUser size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                                                {row.delivery_person_name || "Unidentified Partner"}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                                {row.patient_name ? `For: ${row.patient_name}` : 'General Settlement'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-gray-500 italic">
                                                        <FiCalendar size={14} className="text-indigo-400" />
                                                        <span className="text-xs font-bold tracking-tighter">
                                                            {row.period_from ? new Date(row.period_from).toLocaleDateString() : 'START'} — {row.period_to ? new Date(row.period_to).toLocaleDateString() : 'END'}
                                                        </span>
                                                    </div>
                                                    {row.plan_name && <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">{row.plan_name}</p>}
                                                </TableCell>
                                                <TableCell className="px-6 py-5">
                                                    <p className="text-lg font-black text-gray-900 dark:text-white italic tracking-tighter">{money(row.amount)}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Reference ID: #{row.id}</p>
                                                </TableCell>
                                                <TableCell className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic border shadow-sm ${
                                                        row.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {row.status === 'paid' ? <FiCheckCircle size={10} /> : <FiLoader size={10} className="animate-spin" />}
                                                        {row.status}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-5 text-right">
                                                    {row.status === 'pending' ? (
                                                        <Button size="sm" variant="outline" onClick={() => markAsPaid(row)} className="!rounded-xl text-[9px] font-black uppercase tracking-widest italic">
                                                            Authorize Settlement
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 italic">
                                                            Ledger Entry Locked
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {hasMore && (
                            <div id="payout-sentinel" className="py-12 flex items-center justify-center">
                                <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - Modern Overlay */}
            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-[40px] max-w-2xl w-full p-10 shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowCreate(false)} className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                                <ArrowLeft size={20} className="rotate-90" />
                            </button>
                        </div>
                        
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-2">New Transaction</h2>
                        <p className="text-gray-400 font-medium italic mb-8 uppercase tracking-widest text-[10px]">Synchronizing new settlement record to blockchain ledger.</p>

                        {formResourcesLoading ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <FiLoader className="size-8 text-indigo-500 animate-spin" />
                                <span className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest animate-pulse">Fetching resources...</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Distribution Partner *</label>
                                        <select
                                            value={deliveryPersonId}
                                            onChange={(e) => setDeliveryPersonId(e.target.value)}
                                            className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold shadow-sm"
                                        >
                                            <option value="">Select Partner</option>
                                            {teamMembers.map(m => (
                                                <option key={m.id} value={m.delivery_person}>
                                                    {m.delivery_person_details?.first_name} {m.delivery_person_details?.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Consumer Consumer</label>
                                        <select
                                            value={patientId}
                                            onChange={(e) => onPatientChange(e.target.value)}
                                            className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold shadow-sm italic text-indigo-600"
                                        >
                                            <option value="">Segment Consumer (Optional)</option>
                                            {uniquePatients.map(p => (
                                                <option key={p.id} value={p.id}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Consumer Utilization Plan</label>
                                    <select
                                        value={userDietPlanId}
                                        onChange={(e) => setUserDietPlanId(e.target.value)}
                                        className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold shadow-sm"
                                    >
                                        <option value="">Operational Context Plan (Optional)</option>
                                        {filteredPlans.map(p => (
                                            <option key={p.id} value={p.id}>{p.diet_plan_name} — {p.start_date} to {p.end_date}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Settlement Amount *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-200">₹</span>
                                            <input
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-3 text-lg font-black shadow-sm placeholder:text-gray-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Status</label>
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value as "pending" | "paid")}
                                            className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold shadow-sm uppercase tracking-widest italic"
                                        >
                                            <option value="pending">Authorize Later</option>
                                            <option value="paid">Finalize Immediately</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DatePicker2 id="modal-payout-from" label="Verification Window From" value={periodFrom} onChange={setPeriodFrom} className="!p-0" />
                                    <DatePicker2 id="modal-payout-to" label="Verification Window To" value={periodTo} onChange={setPeriodTo} className="!p-0" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction Annotations</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Internal reconciliation notes..."
                                        rows={2}
                                        className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium shadow-sm italic"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setShowCreate(false)} className="!rounded-2xl !py-3 !px-8 text-[10px] font-black uppercase tracking-widest italic">Abort</Button>
                                    <Button onClick={submitNew} disabled={saving} className="!rounded-2xl !py-4 !px-12 text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-indigo-600/20">
                                        {saving ? 'Synchronizing...' : 'Finalize Settlement'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
