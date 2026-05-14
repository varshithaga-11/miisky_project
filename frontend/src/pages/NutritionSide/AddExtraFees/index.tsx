import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { 
    getMyAllotedPatientsLite,
    getPatientPlans,
    getExtraCharges, 
    addExtraCharge, 
    deleteExtraCharge,
    ExtraCharge,
    AllotedPatient,
    PatientPlan
} from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputField from "../../../components/form/input/InputField";
import { FiPlus, FiTrash2, FiUser, FiPackage, FiDollarSign, FiInfo, FiSearch, FiChevronDown, FiChevronUp, FiAlertCircle, FiCalendar, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const AddExtraFeesPage: React.FC = () => {
    const [patients, setPatients] = useState<AllotedPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalPatients, setTotalPatients] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Expanded states
    const [expandedPatients, setExpandedPatients] = useState<number[]>([]); // User IDs
    const [expandedPlans, setExpandedPlans] = useState<number[]>([]); // Plan IDs
    
    // Data stores
    const [plansByUserId, setPlansByUserId] = useState<Record<number, PatientPlan[]>>({});
    const [extraChargesByPlanId, setExtraChargesByPlanId] = useState<Record<number, ExtraCharge[]>>({});
    const [plansLoading, setPlansLoading] = useState<Record<number, boolean>>({});

    // Form state for each plan
    const [formStates, setFormStates] = useState<Record<number, { label: string; amount: string; reason: string; submitting: boolean }>>({});

    const fetchPatients = async (page: number, search?: string) => {
        setLoading(true);
        try {
            const response = await getMyAllotedPatientsLite({ page, limit: 10, search });
            setPatients(response.results);
            setTotalPatients(response.count);
        } catch (err) {
            toast.error("Failed to fetch patients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const togglePatient = async (userId: number) => {
        const isExpanded = expandedPatients.includes(userId);
        if (isExpanded) {
            setExpandedPatients(expandedPatients.filter(id => id !== userId));
        } else {
            setExpandedPatients([...expandedPatients, userId]);
            if (!plansByUserId[userId]) {
                setPlansLoading(prev => ({ ...prev, [userId]: true }));
                try {
                    const plans = await getPatientPlans(userId);
                    setPlansByUserId(prev => ({ ...prev, [userId]: plans }));
                } catch (err) {
                    toast.error("Failed to load plans for this patient");
                } finally {
                    setPlansLoading(prev => ({ ...prev, [userId]: false }));
                }
            }
        }
    };

    const togglePlan = async (plan: PatientPlan) => {
        const planId = plan.id;
        const isExpanded = expandedPlans.includes(planId);
        if (isExpanded) {
            setExpandedPlans(expandedPlans.filter(id => id !== planId));
        } else {
            setExpandedPlans([...expandedPlans, planId]);
            if (!extraChargesByPlanId[planId]) {
                try {
                    const results = await getExtraCharges(planId);
                    setExtraChargesByPlanId(prev => ({ ...prev, [planId]: results }));
                } catch (err) {
                    toast.error("Failed to fetch charges");
                }
            }
            if (!formStates[planId]) {
                setFormStates(prev => ({ 
                    ...prev, 
                    [planId]: { label: "", amount: "", reason: "", submitting: false } 
                }));
            }
        }
    };

    const handleFormChange = (planId: number, field: string, value: string) => {
        setFormStates(prev => ({
            ...prev,
            [planId]: { ...prev[planId], [field]: value }
        }));
    };

    const handleAddCharge = async (plan: PatientPlan) => {
        const state = formStates[plan.id];
        if (!state.label || !state.amount) {
            toast.warn("Label and Amount are required");
            return;
        }

        setFormStates(prev => ({ ...prev, [plan.id]: { ...prev[plan.id], submitting: true } }));
        try {
            await addExtraCharge({
                user: plan.user_details?.id,
                user_diet_plan: plan.id,
                label: state.label,
                amount: state.amount,
                reason: state.reason
            });
            toast.success("Extra charge added");
            setFormStates(prev => ({ 
                ...prev, 
                [plan.id]: { label: "", amount: "", reason: "", submitting: false } 
            }));
            const results = await getExtraCharges(plan.id);
            setExtraChargesByPlanId(prev => ({ ...prev, [plan.id]: results }));
        } catch (err) {
            toast.error("Failed to add charge");
            setFormStates(prev => ({ ...prev, [plan.id]: { ...prev[plan.id], submitting: false } }));
        }
    };

    const handleDelete = async (planId: number, chargeId: number) => {
        if (!window.confirm("Delete this charge?")) return;
        try {
            await deleteExtraCharge(chargeId);
            toast.success("Charge removed");
            const results = await getExtraCharges(planId);
            setExtraChargesByPlanId(prev => ({ ...prev, [planId]: results }));
        } catch (err) {
            toast.error("Failed to delete charge");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-12">
            <PageMeta title="Add Extra Fees" description="Manage extra charges for patient diet plans." />
            <PageBreadcrumb pageTitle="Extra Fee Management" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 max-w-7xl mx-auto space-y-6">
                {/* Search Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
                    <div className="w-full md:w-80">
                        <InputField
                            placeholder="Search by name, email or username..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Total Allotted Patients: {totalPatients}
                    </div>
                </div>

                {/* Patient Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 dark:bg-white/[0.02]">
                                    <TableCell isHeader className="px-5 py-4 text-start font-bold">Patient</TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-start font-bold">Email</TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-start font-bold">Username</TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-end font-bold">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                                                <span className="text-xs font-bold text-gray-400 uppercase">Loading patients...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : patients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-20 text-center text-gray-500 italic">
                                            {searchTerm ? "No patients found matching your search." : "No patients have been allotted to you yet."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    patients.map((p) => (
                                        <React.Fragment key={p.user.id}>
                                            <TableRow className="border-t border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                                                            <FiUser size={18} />
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {p.user.first_name || p.user.last_name ? `${p.user.first_name || ""} ${p.user.last_name || ""}` : p.user.username}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{p.user.email}</span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">@{p.user.username}</span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-end">
                                                    <button 
                                                        onClick={() => togglePatient(p.user.id)}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${expandedPatients.includes(p.user.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                                    >
                                                        {expandedPatients.includes(p.user.id) ? <><FiChevronUp /> Hide Plans</> : <><FiChevronDown /> View Plans</>}
                                                    </button>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expandable Patient Row (Plans List) */}
                                            <AnimatePresence>
                                                {expandedPatients.includes(p.user.id) && (
                                                    <TableRow className="bg-gray-50/30 dark:bg-white/[0.01]">
                                                        <TableCell colSpan={4} className="p-0 border-t-0">
                                                            <motion.div 
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-6 pl-16 space-y-4 border-b border-gray-100 dark:border-white/[0.05]">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                                                            <FiPackage size={14} />
                                                                        </div>
                                                                        <h5 className="font-black uppercase tracking-widest text-[10px] text-gray-900 dark:text-white">Assigned Diet Plans</h5>
                                                                    </div>

                                                                    {plansLoading[p.user.id] ? (
                                                                        <div className="flex items-center gap-2 py-4">
                                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Fetching plans...</span>
                                                                        </div>
                                                                    ) : plansByUserId[p.user.id]?.length > 0 ? (
                                                                        <div className="grid grid-cols-1 gap-3">
                                                                            {plansByUserId[p.user.id].map((plan) => (
                                                                                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                                                                                    <div className="p-5 flex items-center justify-between">
                                                                                        <div className="flex items-center gap-6">
                                                                                            <div>
                                                                                                <p className="text-sm font-black text-gray-900 dark:text-white">{plan.diet_plan_details?.title}</p>
                                                                                                <div className="flex items-center gap-3 mt-1">
                                                                                                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${plan.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                                                        {plan.status}
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                                                                        <FiClock size={10} /> {plan.diet_plan_details?.no_of_days} Days
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="h-10 w-px bg-gray-100 dark:bg-white/5 hidden md:block" />

                                                                                            <div className="hidden md:flex flex-col gap-1">
                                                                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Schedule Period</span>
                                                                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-700 dark:text-gray-300">
                                                                                                    <FiCalendar size={12} className="text-indigo-500" />
                                                                                                    {plan.start_date ? new Date(plan.start_date).toLocaleDateString() : '??'} 
                                                                                                    <span className="text-gray-300">→</span> 
                                                                                                    {plan.end_date ? new Date(plan.end_date).toLocaleDateString() : '??'}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <button 
                                                                                            onClick={() => togglePlan(plan)}
                                                                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${expandedPlans.includes(plan.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white'}`}
                                                                                        >
                                                                                            {expandedPlans.includes(plan.id) ? "Close Fees" : "Manage Fees"}
                                                                                        </button>
                                                                                    </div>

                                                                                    {/* Expandable Plan Row (Fees Section) */}
                                                                                    <AnimatePresence>
                                                                                        {expandedPlans.includes(plan.id) && (
                                                                                            <motion.div 
                                                                                                initial={{ opacity: 0, height: 0 }}
                                                                                                animate={{ opacity: 1, height: "auto" }}
                                                                                                exit={{ opacity: 0, height: 0 }}
                                                                                                className="bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-white/5 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8"
                                                                                            >
                                                                                                {/* Fee History */}
                                                                                                <div className="space-y-4">
                                                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                                                                        <FiDollarSign className="text-indigo-500" /> Current Extra Charges
                                                                                                    </p>
                                                                                                    <div className="space-y-3">
                                                                                                        {extraChargesByPlanId[plan.id]?.length > 0 ? (
                                                                                                            extraChargesByPlanId[plan.id].map((c) => (
                                                                                                                <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between group shadow-sm">
                                                                                                                    <div className="flex items-center gap-4">
                                                                                                                        <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                                                                                            ₹{c.amount}
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                            <p className="text-xs font-black text-gray-900 dark:text-white">{c.label}</p>
                                                                                                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(c.created_at || '').toLocaleDateString()}</p>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <button 
                                                                                                                        onClick={() => c.id && handleDelete(plan.id, c.id)}
                                                                                                                        className="size-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                                                                                    >
                                                                                                                        <FiTrash2 size={14} />
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            ))
                                                                                                        ) : (
                                                                                                            <div className="py-8 text-center bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                                                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No fees recorded</p>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* Add Form */}
                                                                                                <div className="space-y-4">
                                                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                                                                        <FiPlus className="text-green-500" /> New Extra Fee
                                                                                                    </p>
                                                                                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4 shadow-sm">
                                                                                                        <div className="grid grid-cols-2 gap-4">
                                                                                                            <div className="space-y-2">
                                                                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Label</label>
                                                                                                                <input 
                                                                                                                    type="text"
                                                                                                                    placeholder="Delivery, Packaging..."
                                                                                                                    value={formStates[plan.id]?.label || ""}
                                                                                                                    onChange={(e) => handleFormChange(plan.id, "label", e.target.value)}
                                                                                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2.5 text-xs font-bold dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="space-y-2">
                                                                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                                                                                                                <input 
                                                                                                                    type="number"
                                                                                                                    placeholder="0.00"
                                                                                                                    value={formStates[plan.id]?.amount || ""}
                                                                                                                    onChange={(e) => handleFormChange(plan.id, "amount", e.target.value)}
                                                                                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2.5 text-xs font-bold dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason</label>
                                                                                                            <textarea 
                                                                                                                rows={1}
                                                                                                                placeholder="Optional details..."
                                                                                                                value={formStates[plan.id]?.reason || ""}
                                                                                                                onChange={(e) => handleFormChange(plan.id, "reason", e.target.value)}
                                                                                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2 text-xs font-bold dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <button 
                                                                                                            onClick={() => handleAddCharge(plan)}
                                                                                                            disabled={formStates[plan.id]?.submitting}
                                                                                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                                                                                        >
                                                                                                            {formStates[plan.id]?.submitting ? "Adding..." : "Confirm Extra Charge"}
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </motion.div>
                                                                                        )}
                                                                                    </AnimatePresence>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="py-12 text-center bg-white/30 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-[32px]">
                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active or approved diet plans for this patient</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddExtraFeesPage;
