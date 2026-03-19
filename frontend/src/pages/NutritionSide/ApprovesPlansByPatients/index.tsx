import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getApprovedPlansForNutritionist } from "./api";
import type { UserDietPlan } from "../SuggestPlanToPatients/api";
import { toast, ToastContainer } from "react-toastify";
import { FiCheckCircle, FiClock, FiCalendar, FiUser, FiPackage, FiActivity, FiCreditCard } from "react-icons/fi";

const ApprovesPlansByPatientsPage: React.FC = () => {
    const [plans, setPlans] = useState<UserDietPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("approved"); // start with 'approved'

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true);
            try {
                // Fetching multiple related statuses often helps the nutritionist see the full funnel
                const data = await getApprovedPlansForNutritionist(filter);
                setPlans(data);
            } catch (error) {
                toast.error("Failed to load approved plans");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [filter]);

    const getStatusStyles = (status: string) => {
        const map: Record<string, string> = {
            approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/60",
            payment_pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/60",
            active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/60",
            completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-white/10",
        };
        return map[status] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const statusIcons: Record<string, React.ReactElement> = {
        approved: <FiCheckCircle />,
        payment_pending: <FiCreditCard />,
        active: <FiActivity />,
        completed: <FiCheckCircle />,
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-12">
            <PageMeta title="Patient Approvals" description="Monitor and track plans approved by your patients." />
            <PageBreadcrumb pageTitle="Clinical Plan Approvals" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 space-y-8">
                {/* Statistics / Funnel Summary */}
                <div className="flex flex-wrap gap-4 px-2">
                    {["approved", "payment_pending", "active", "completed"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(st)}
                            className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border flex items-center gap-2 ${filter === st ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'bg-white dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400 hover:border-indigo-500/30 shadow-sm'}`}
                        >
                            {statusIcons[st]} {st.replace("_", " ")}
                        </button>
                    ))}
                </div>

                {/* Plan List */}
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {loading ? (
                        [1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 h-64 rounded-[40px] animate-pulse"></div>
                        ))
                    ) : plans.length === 0 ? (
                        <div className="col-span-full h-[400px] bg-white dark:bg-gray-800 rounded-[40px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/10 shadow-sm">
                            <FiPackage size={48} className="text-gray-200 dark:text-gray-700 mb-6" />
                            <h3 className="text-2xl font-black text-gray-400 mb-2 uppercase tracking-tighter">No items found</h3>
                            <p className="text-gray-400 font-medium">There are currently no records for status "{filter.replace('_', ' ')}".</p>
                        </div>
                    ) : (
                        plans.map((udp) => (
                            <div key={udp.id} className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05] relative group overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-gray-200/60 dark:hover:shadow-none">
                                
                                {/* Status Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] ${getStatusStyles(udp.status)}`}>
                                        {statusIcons[udp.status] || <FiActivity />} {udp.status.replace("_", " ")}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Reference</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">#{udp.id.toString().padStart(5, '0')}</p>
                                    </div>
                                </div>

                                {/* Patient Information */}
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="size-16 rounded-[22px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-900/30">
                                        <FiUser size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white">{udp.user_details?.first_name} {udp.user_details?.last_name}</h4>
                                        <p className="text-xs font-bold text-gray-400 group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{udp.user_details?.email}</p>
                                    </div>
                                </div>

                                {/* Plan Details Grid */}
                                <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-[32px] border border-gray-100 dark:border-white/[0.03]">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FiPackage size={10} /> Plan Model</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{udp.diet_plan_details?.title}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FiClock size={10} /> Duration</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">{udp.diet_plan_details?.no_of_days} Days</p>
                                    </div>
                                    <div className="space-y-1 col-span-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FiCalendar size={10} /> Start Window</p>
                                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{udp.start_date ? new Date(udp.start_date).toLocaleDateString() : 'TBD'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FiCalendar size={10} /> End Date</p>
                                        <p className="text-sm font-black text-red-600 dark:text-red-400">{udp.end_date ? new Date(udp.end_date).toLocaleDateString() : 'TBD'}</p>
                                    </div>
                                </div>

                                {/* Note Preview */}
                                {udp.nutritionist_notes && (
                                    <div className="mt-6 flex gap-3 items-start px-2 opacity-50 transition-opacity hover:opacity-100 group-hover:opacity-100">
                                        <div className="mt-1 size-1.5 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse"></div>
                                        <p className="text-[11px] font-medium text-gray-500 italic leading-relaxed line-clamp-2">“{udp.nutritionist_notes}”</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovesPlansByPatientsPage;
