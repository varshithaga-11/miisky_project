import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getApprovedPlansForNutritionist, PaginatedUserDietPlan, updatePlanDates } from "./api";
import type { ApprovedPlanLite } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { 
    FiCheckCircle, FiUser, FiPackage, FiActivity, 
    FiCreditCard, FiSearch, FiChevronLeft, FiChevronRight,
    FiEye, FiInfo, FiBox, FiMoreVertical, FiX, FiCalendar, FiThumbsUp
} from "react-icons/fi";
import DatePicker2 from "../../../components/form/date-picker2";

const ApprovesPlansByPatientsPage: React.FC = () => {
    const [plans, setPlans] = useState<ApprovedPlanLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all"); // Default to show all statuses
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [count, setCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [dateModalPlan, setDateModalPlan] = useState<ApprovedPlanLite | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [updating, setUpdating] = useState(false);

    const handleUpdateDates = async () => {
        if (!dateModalPlan || updating) return;
        setUpdating(true);
        try {
            await updatePlanDates(
                dateModalPlan.id, 
                startDate || null,
                endDate || null
            );
            toast.success("Plan dates updated successfully");
            setDateModalPlan(null);
            fetchPlans();
        } catch (err) {
            toast.error("Failed to update plan dates");
        } finally {
            setUpdating(false);
        }
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const statusParam = filter === "all" || filter === "patient_approved" ? "" : filter;
            const isPatientApproved = filter === "patient_approved" ? true : undefined;
            const data: PaginatedUserDietPlan = await getApprovedPlansForNutritionist(
                statusParam, 
                page, 
                limit, 
                debouncedSearch,
                isPatientApproved
            );
            setPlans(data.results);
            setCount(data.count);
            setTotalPages(data.total_pages);
            setExpandedRows([]);
        } catch (error) {
            toast.error("Failed to load approved plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchPlans();
    }, [filter, debouncedSearch, page, limit]);

    const getStatusStyles = (status: string) => {
        const map: Record<string, string> = {
            approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/60",
            payment_pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/60",
            active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-blue-900/60",
            completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-white/10",
        };
        return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const statusIcons: Record<string, React.ReactElement> = {
        all: <FiPackage />,
        patient_approved: <FiThumbsUp />,
        approved: <FiCheckCircle />,
        payment_pending: <FiCreditCard />,
        active: <FiActivity />,
        completed: <FiCheckCircle />,
    };

    const toggleRow = (id: number) => {
        setExpandedRows(prev => 
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-12">
            <PageMeta title="Patient Approvals" description="Monitor and track plans approved by your patients." />
            <PageBreadcrumb pageTitle="Clinical Plan Approvals" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 space-y-8">
                {/* Control Panel */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-transparent dark:border-white/[0.05] shadow-xl shadow-gray-200/50 dark:shadow-none space-y-6">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                        <div className="flex flex-wrap gap-2">
                            {["all", "patient_approved", "approved", "payment_pending", "active", "completed"].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => {
                                        setFilter(st);
                                        setPage(1);
                                    }}
                                    className={`px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border flex items-center gap-2 ${filter === st ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400 hover:border-indigo-500/30'}`}
                                >
                                    {statusIcons[st] || <FiActivity />} {st.replace("_", " ")}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full xl:max-w-md group">
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search patient, email, plan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold placeholder:text-gray-400 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Dataset Statistics: <span className="text-indigo-600 dark:text-indigo-400">{count}</span> Total Records
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display:</span>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="bg-gray-50 dark:bg-gray-900/50 border-none rounded-xl text-xs font-black p-2 outline-none dark:text-white"
                            >
                                {[5, 10, 15, 25].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white dark:bg-gray-800 rounded-[40px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Details</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Diet Plan & Duration</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kitchen Provider</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dates</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><div className="h-10 w-48 bg-gray-100 dark:bg-gray-700 rounded-2xl"></div></td>
                                            <td className="px-6 py-6"><div className="h-6 w-32 bg-gray-100 dark:bg-gray-700 rounded-xl"></div></td>
                                            <td className="px-6 py-6"><div className="h-6 w-32 bg-gray-100 dark:bg-gray-700 rounded-xl"></div></td>
                                            <td className="px-6 py-6"><div className="h-6 w-24 bg-gray-100 dark:bg-gray-700 rounded-xl"></div></td>
                                            <td className="px-6 py-6"><div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto"></div></td>
                                            <td className="px-8 py-6"><div className="h-6 w-12 bg-gray-100 dark:bg-gray-700 rounded-xl ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : plans.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-32 text-center">
                                            <FiPackage size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">No records found</h3>
                                        </td>
                                    </tr>
                                ) : (
                                    plans.map((udp) => (
                                        <React.Fragment key={udp.id}>
                                            <tr 
                                                className={`group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${expandedRows.includes(udp.id) ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                                                onClick={() => toggleRow(udp.id)}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-900/30">
                                                            <FiUser size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white">{udp.user_details?.first_name} {udp.user_details?.last_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{udp.user_details?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5 line-clamp-1">
                                                            <span className="text-indigo-500"><FiBox size={14} /></span> {udp.diet_plan_details?.title}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{udp.diet_plan_details?.no_of_days} Days</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{udp.micro_kitchen_details?.brand_name || 'TBD'}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter truncate w-32">{udp.micro_kitchen_details?.cuisine_type || 'General'}</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{udp.start_date ? new Date(udp.start_date).toLocaleDateString() : 'TBD'}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase">Effective Date</p>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${getStatusStyles(udp.status)}`}>
                                                        {statusIcons[udp.status] || <FiActivity />} {udp.status.replace("_", " ")}
                                                        {udp.is_plan_approved_by_patient && udp.status === 'suggested' && (
                                                            <span className="ml-1 text-[8px] opacity-70">(Patient Approved)</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            className={`size-10 rounded-xl transition-all flex items-center justify-center ${expandedRows.includes(udp.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-indigo-600'}`}
                                                            onClick={() => toggleRow(udp.id)}
                                                        >
                                                            <FiEye size={18} />
                                                        </button>
                                                        
                                                        {(udp.is_plan_approved_by_patient || udp.status === 'approved') && (
                                                            <div className="relative group/menu">
                                                                <button 
                                                                    className="size-10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-indigo-600 transition-all flex items-center justify-center"
                                                                >
                                                                    <FiMoreVertical size={18} />
                                                                </button>
                                                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 py-2 z-50 invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all">
                                                                    <button 
                                                                        onClick={() => {
                                                                            setDateModalPlan(udp);
                                                                            setStartDate(udp.start_date || "");
                                                                            setEndDate(udp.end_date || "");
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 flex items-center gap-2"
                                                                    >
                                                                        <FiCalendar size={14} /> Set Plan Dates
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expanded Row */}
                                            {expandedRows.includes(udp.id) && (
                                                <tr>
                                                    <td colSpan={6} className="bg-white/50 dark:bg-gray-900/30 px-24 py-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                                            <div className="space-y-4">
                                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <FiInfo className="text-indigo-500" /> Patient Summary
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Plan suggested on: {new Date(udp.created_on).toLocaleDateString()}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Assigned Kitchen: {udp.micro_kitchen_details?.brand_name || 'N/A'}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Payment: {udp.payment_status?.toUpperCase() || 'UNKNOWN'}</p>
                                                                    {udp.is_plan_approved_by_patient && (
                                                                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                                                            <FiThumbsUp size={12} /> Approved by Patient
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="md:col-span-2 space-y-4">
                                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <FiBox className="text-indigo-500" /> Nutritionist Clinical Notes
                                                                </h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed border-l-4 border-indigo-500 pl-6 py-2">
                                                                    {udp.nutritionist_notes || "No clinical notes provided for this plan suggestion."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(page - 1)}
                            className="size-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 flex items-center justify-center disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm"
                        >
                            <FiChevronLeft />
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`size-10 rounded-xl text-[10px] font-black transition-all ${page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-gray-800 text-gray-500 hover:border-indigo-500/30 border border-gray-100 dark:border-white/10'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(page + 1)}
                            className="size-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 flex items-center justify-center disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>

            {/* Date Selection Modal */}
            {dateModalPlan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-transparent dark:border-white/5 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Set Plan Dates</h3>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{dateModalPlan.user_details?.first_name}'s Plan</p>
                            </div>
                            <button 
                                onClick={() => setDateModalPlan(null)}
                                className="size-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center hover:text-red-500 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <DatePicker2
                                id="start-date"
                                label="Start Date"
                                value={startDate}
                                onChange={(date) => setStartDate(date)}
                                placeholder="Select start date"
                            />
                            <DatePicker2
                                id="end-date"
                                label="End Date"
                                value={endDate}
                                minDate={startDate}
                                onChange={(date) => setEndDate(date)}
                                placeholder="Select end date"
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                            <button 
                                onClick={() => setDateModalPlan(null)}
                                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                                Dismiss
                            </button>
                            <button 
                                onClick={handleUpdateDates}
                                disabled={updating}
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                                {updating ? "Processing..." : "Update Dates"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovesPlansByPatientsPage;
