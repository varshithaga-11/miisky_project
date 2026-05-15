import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { 
    getBillingOverview,
    PatientBilling,
    PlanBilling,
    DailySummary,
    ExtraCharge,
    getDailyMeals,
    MealDetail
} from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputField from "../../../components/form/input/InputField";
import { FiUser, FiPackage, FiDollarSign, FiSearch, FiChevronDown, FiChevronUp, FiCalendar, FiClock, FiActivity, FiTag, FiFileText } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const EachPlanFinalAmountOverview: React.FC = () => {
    const [data, setData] = useState<PatientBilling[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    // Expanded levels
    const [expandedPatients, setExpandedPatients] = useState<number[]>([]);
    const [expandedPlans, setExpandedPlans] = useState<number[]>([]);
    const [planTab, setPlanTab] = useState<Record<number, 'daily' | 'extra'>>({});
    
    // New: Summary expansion for meals
    const [expandedSummaries, setExpandedSummaries] = useState<number[]>([]);
    const [summaryMeals, setSummaryMeals] = useState<Record<number, MealDetail[]>>({});
    const [loadingMeals, setLoadingMeals] = useState<Record<number, boolean>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getBillingOverview({ page: currentPage, search: searchTerm });
            setData(res.results);
            setTotalCount(res.count);
        } catch (err) {
            toast.error("Failed to load billing data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm]);

    const togglePatient = (id: number) => {
        setExpandedPatients(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const togglePlan = (id: number) => {
        setExpandedPlans(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        if (!planTab[id]) setPlanTab(prev => ({ ...prev, [id]: 'daily' }));
    };

    const toggleSummary = async (summaryId: number, planId: number, date: string) => {
        const isExpanded = expandedSummaries.includes(summaryId);
        
        if (isExpanded) {
            setExpandedSummaries(prev => prev.filter(i => i !== summaryId));
        } else {
            setExpandedSummaries(prev => [...prev, summaryId]);
            
            // Only fetch if not already loaded
            if (!summaryMeals[summaryId]) {
                setLoadingMeals(prev => ({ ...prev, [summaryId]: true }));
                try {
                    const meals = await getDailyMeals(planId, date);
                    setSummaryMeals(prev => ({ ...prev, [summaryId]: meals }));
                } catch (err) {
                    toast.error("Failed to load meal details");
                } finally {
                    setLoadingMeals(prev => ({ ...prev, [summaryId]: false }));
                }
            }
        }
    };

    const calculatePlanTotal = (plan: PlanBilling) => {
        const food = (plan.daily_summaries || []).reduce((acc, curr) => acc + parseFloat(curr.total_meal_amount), 0);
        const extra = (plan.extra_charges || []).reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        return { food, extra, total: food + extra };
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-12">
            <PageMeta title="Admin: Plan Billing Overview" description="Detailed breakdown of patient meal costs and extra fees." />
            <PageBreadcrumb pageTitle="Final Amount Overview" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 max-w-7xl mx-auto space-y-6">
                {/* Search & Header */}
                <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
                    <div className="w-full md:w-96">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search patients by name or email..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Database Record</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{totalCount} Patients Loaded</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <FiActivity size={18} />
                        </div>
                    </div>
                </div>

                {/* Patient List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Aggregating Billing Data...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="py-32 text-center bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                            <p className="text-sm font-bold text-gray-500">No billing history found.</p>
                        </div>
                    ) : (
                        data.map(patient => (
                            <div key={patient.id} className="group overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-white/[0.05] dark:bg-white/[0.03]">
                                {/* Patient Header */}
                                <div 
                                    onClick={() => togglePatient(patient.id)}
                                    className="p-6 flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="size-14 rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                                            <FiUser size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                                {patient.first_name || patient.last_name ? `${patient.first_name || ""} ${patient.last_name || ""}` : patient.username}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-400">@{patient.username} • {patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex flex-col items-end">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">History</span>
                                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{patient.diet_plans.length} Diet Plans</span>
                                        </div>
                                        <div className={`size-10 rounded-2xl flex items-center justify-center transition-all ${expandedPatients.includes(patient.id) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
                                            {expandedPatients.includes(patient.id) ? <FiChevronUp /> : <FiChevronDown />}
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Content (Plans) */}
                                <AnimatePresence>
                                    {expandedPatients.includes(patient.id) && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-gray-50 dark:border-white/[0.05]"
                                        >
                                            <div className="p-6 bg-gray-50/50 dark:bg-black/10 space-y-4">
                                                {patient.diet_plans.length === 0 ? (
                                                    <p className="text-center py-8 text-xs font-bold text-gray-400 uppercase">No plans recorded for this patient.</p>
                                                ) : (
                                                    patient.diet_plans.map(plan => {
                                                        const totals = calculatePlanTotal(plan);
                                                        return (
                                                            <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                                                                {/* Plan Header */}
                                                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 flex items-center justify-center shadow-inner">
                                                                            <FiPackage size={20} />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{plan.diet_plan_title}</h4>
                                                                            <div className="flex items-center gap-3 mt-1">
                                                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${plan.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{plan.status}</span>
                                                                                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><FiCalendar size={12}/> {plan.start_date || 'N/A'} - {plan.end_date || 'N/A'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-8">
                                                                        <div className="text-right">
                                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                                                            <p className="text-lg font-black text-gray-900 dark:text-white">₹{totals.total.toFixed(2)}</p>
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => togglePlan(plan.id)}
                                                                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${expandedPlans.includes(plan.id) ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10'}`}
                                                                        >
                                                                            {expandedPlans.includes(plan.id) ? 'Hide Details' : 'View Billing Breakdown'}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Plan Details (Tabs) */}
                                                                <AnimatePresence>
                                                                    {expandedPlans.includes(plan.id) && (
                                                                        <motion.div 
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/40 p-6"
                                                                        >
                                                                            <div className="flex items-center gap-2 mb-6">
                                                                                <button 
                                                                                    onClick={() => setPlanTab(prev => ({ ...prev, [plan.id]: 'daily' }))}
                                                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${planTab[plan.id] === 'daily' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                                                >
                                                                                    <FiClock /> Daily Meal Costs ({(plan.daily_summaries || []).length})
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => setPlanTab(prev => ({ ...prev, [plan.id]: 'extra' }))}
                                                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${planTab[plan.id] === 'extra' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                                                >
                                                                                    <FiTag /> Extra Charges ({(plan.extra_charges || []).length})
                                                                                </button>
                                                                            </div>

                                                                            {planTab[plan.id] === 'daily' ? (
                                                                                <div className="space-y-3">
                                                                                    {(!plan.daily_summaries || plan.daily_summaries.length === 0) ? (
                                                                                        <p className="text-center py-12 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-dashed rounded-3xl">No daily summaries generated yet.</p>
                                                                                    ) : (
                                                                                        (plan.daily_summaries || []).map(s => (
                                                                                            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                                                                                                <div 
                                                                                                    onClick={() => toggleSummary(s.id, plan.id, s.summary_date)}
                                                                                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                                                                                                >
                                                                                                    <div className="flex items-center gap-4">
                                                                                                        <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${expandedSummaries.includes(s.id) ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-400'}`}>
                                                                                                            <FiCalendar />
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <p className="text-xs font-black text-gray-900 dark:text-white">{new Date(s.summary_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                                                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{s.total_meals_count} Meals Recorded</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-6">
                                                                                                        <div className="text-right">
                                                                                                            <p className="text-sm font-black text-gray-900 dark:text-white">₹{parseFloat(s.total_meal_amount).toFixed(2)}</p>
                                                                                                        </div>
                                                                                                        <div className="text-gray-400">
                                                                                                            {expandedSummaries.includes(s.id) ? <FiChevronUp /> : <FiChevronDown />}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* Meals List */}
                                                                                                <AnimatePresence>
                                                                                                    {expandedSummaries.includes(s.id) && (
                                                                                                        <motion.div
                                                                                                            initial={{ height: 0, opacity: 0 }}
                                                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                                                            exit={{ height: 0, opacity: 0 }}
                                                                                                            className="border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-black/5"
                                                                                                        >
                                                                                                            <div className="p-4 space-y-2">
                                                                                                                {loadingMeals[s.id] ? (
                                                                                                                    <div className="flex items-center justify-center py-6 gap-2">
                                                                                                                        <div className="size-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                                                                                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching meals...</span>
                                                                                                                    </div>
                                                                                                                ) : !summaryMeals[s.id] || summaryMeals[s.id].length === 0 ? (
                                                                                                                    <p className="text-center py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">No detailed meal data found.</p>
                                                                                                                ) : (
                                                                                                                    summaryMeals[s.id].map(m => (
                                                                                                                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-50 dark:border-white/5 shadow-sm">
                                                                                                                            <div className="flex items-center gap-3">
                                                                                                                                <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-[10px] font-black uppercase">
                                                                                                                                    {m.meal_type_name?.[0]}
                                                                                                                                </div>
                                                                                                                                <div>
                                                                                                                                    <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase leading-none">{m.food_name}</p>
                                                                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                                                                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">{m.meal_type_name}</span>
                                                                                                                                        <span className="size-1 rounded-full bg-gray-200" />
                                                                                                                                        <span className="text-[8px] font-bold text-gray-400">{m.serving_size_label || 'Standard'} • Qty: {m.quantity}</span>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            <div className="flex items-center gap-4">
                                                                                                                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${m.status === 'consumed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                                                                                    {m.status}
                                                                                                                                </span>
                                                                                                                                <p className="text-xs font-black text-gray-900 dark:text-white">₹{parseFloat(m.meal_price).toFixed(2)}</p>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    ))
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </motion.div>
                                                                                                    )}
                                                                                                </AnimatePresence>
                                                                                            </div>
                                                                                        ))
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="space-y-3">
                                                                                    {(!plan.extra_charges || plan.extra_charges.length === 0) ? (
                                                                                        <p className="text-center py-12 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-dashed rounded-3xl">No extra charges added.</p>
                                                                                    ) : (
                                                                                        (plan.extra_charges || []).map(c => (
                                                                                            <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-white/5">
                                                                                                <div className="flex items-center gap-4">
                                                                                                    <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                                                                        <FiDollarSign />
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <p className="text-xs font-black text-gray-900 dark:text-white">{c.label}</p>
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(c.created_at).toLocaleDateString()}</p>
                                                                                                            <div className="size-1 rounded-full bg-gray-200" />
                                                                                                            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">By: {c.created_by_details?.first_name} ({c.created_by_details?.role})</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="text-right">
                                                                                                    <p className="text-sm font-black text-red-600 dark:text-red-400">+ ₹{parseFloat(c.amount).toFixed(2)}</p>
                                                                                                    {c.reason && <p className="text-[9px] text-gray-400 font-medium max-w-[200px] truncate">{c.reason}</p>}
                                                                                                </div>
                                                                                            </div>
                                                                                        ))
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EachPlanFinalAmountOverview;
