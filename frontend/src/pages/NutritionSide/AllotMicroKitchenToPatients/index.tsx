import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyAllotedPatients, AllotedPatient } from "../AllotedPatients/api";
import { getApprovedMicroKitchens, MicroKitchenProfile } from "../ListOfMicroKitchens/api";
import { getSuggestedPlansForPatient, UserDietPlan } from "../SuggestPlanToPatients/api";
import { suggestKitchen, getKitchenSuggestions, UserMicroKitchenMapping } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiUsers, FiHome, FiPlus, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const AllotMicroKitchenToPatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<AllotedPatient[]>([]);
    const [kitchens, setKitchens] = useState<MicroKitchenProfile[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<AllotedPatient | null>(null);
    const [currentPlan, setCurrentPlan] = useState<UserDietPlan | null>(null);
    const [suggestions, setSuggestions] = useState<UserMicroKitchenMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [pts, kts] = await Promise.all([
                    getMyAllotedPatients(),
                    getApprovedMicroKitchens()
                ]);
                setPatients(pts);
                setKitchens(kts.results);
            } catch (error) {
                console.error(error);
                toast.error("Failed to initialize allotment data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            const fetchPatientData = async () => {
                try {
                    const [plans, suggs] = await Promise.all([
                        getSuggestedPlansForPatient(selectedPatient.user.id),
                        getKitchenSuggestions({ patient: selectedPatient.user.id })
                    ]);
                    
                    // Find active or latest approved plan
                    const active = plans.find(p => p.status === 'approved' || p.status === 'active') || plans[0];
                    setCurrentPlan(active || null);
                    setSuggestions(suggs);
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to load patient's plan details");
                }
            };
            fetchPatientData();
        }
    }, [selectedPatient]);

    const handleSuggestKitchen = async (kitchenId: number) => {
        if (!selectedPatient || !currentPlan) {
            toast.warning("Please select a patient with an active diet plan first");
            return;
        }

        const alreadySuggested = suggestions.some(s => s.micro_kitchen === kitchenId && s.diet_plan === currentPlan.id);
        if (alreadySuggested) {
            toast.info("This kitchen is already suggested for this plan");
            return;
        }

        setActionLoading(true);
        try {
            await suggestKitchen({
                patient: selectedPatient.user.id,
                micro_kitchen: kitchenId,
                diet_plan: currentPlan.id,
                status: 'suggested'
            });
            toast.success("Kitchen suggested successfully!");
            // Refresh suggestions
            const suggs = await getKitchenSuggestions({ patient: selectedPatient.user.id });
            setSuggestions(suggs);
        } catch (error) {
            console.error(error);
            toast.error("Failed to suggest kitchen");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Allot Micro Kitchens" description="Suggest certified kitchens to your patients" />
            <PageBreadcrumb pageTitle="Kitchen Allotment" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left: Patient List */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <FiUsers size={20} />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Active Patients</h2>
                            </div>

                            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 no-scrollbar">
                                {loading && patients.length === 0 ? (
                                    [1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl animate-pulse" />)
                                ) : patients.map(p => (
                                    <button
                                        key={p.user.id}
                                        onClick={() => setSelectedPatient(p)}
                                        className={`w-full p-5 rounded-[28px] text-left transition-all group border ${
                                            selectedPatient?.user.id === p.user.id 
                                            ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20 translate-x-2" 
                                            : "bg-gray-50/50 dark:bg-white/[0.02] border-transparent hover:border-indigo-500/30 hover:bg-white dark:hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${
                                                selectedPatient?.user.id === p.user.id ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                                            }`}>
                                                {p.user.first_name?.[0] || p.user.username[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-black text-sm truncate uppercase tracking-tight ${selectedPatient?.user.id === p.user.id ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                                    {p.user.first_name} {p.user.last_name}
                                                </p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPatient?.user.id === p.user.id ? "text-indigo-100" : "text-gray-400"}`}>
                                                    ID: {p.user.id} • {p.user.city || 'Remote'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Allocation Console */}
                    <div className="lg:col-span-8 space-y-8">
                        {!selectedPatient ? (
                            <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                                <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-8">
                                    <FiUsers size={40} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Console Locked</h3>
                                <p className="text-gray-400 mt-2 font-medium">Select an active patient to begin the kitchen allotment process.</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Header: Patient & Plan Context */}
                                <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 shadow-inner">
                                            <FiTrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                                {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                                            </h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                                Active Plan: <span className="text-emerald-500">{currentPlan?.diet_plan_details?.title || "Evaluating..."}</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {currentPlan && (
                                        <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan Period</p>
                                            <p className="text-xs font-black text-gray-900 dark:text-white">
                                                {currentPlan.start_date ? new Date(currentPlan.start_date).toLocaleDateString() : '??'} → {currentPlan.end_date ? new Date(currentPlan.end_date).toLocaleDateString() : '??'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Current Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 space-y-6 shadow-sm">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-white/5 pb-4">
                                            Kitchen Suggestions History
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {suggestions.map(s => (
                                                <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`p-2 rounded-xl text-white ${
                                                            s.status === 'accepted' ? 'bg-emerald-500' : s.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-400'
                                                        }`}>
                                                            {s.status === 'accepted' ? <FiCheckCircle size={14} /> : s.status === 'rejected' ? <FiXCircle size={14} /> : <FiClock size={14} />}
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-xs font-black text-gray-900 dark:text-white truncate uppercase">{s.kitchen_details?.brand_name}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{s.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Available Kitchens to Allot */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Suggest New Kitchen</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{kitchens.length} Verified Providers</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {kitchens.map(kitchen => {
                                            const isSuggested = suggestions.some(s => s.micro_kitchen === kitchen.id && s.diet_plan === currentPlan?.id);
                                            return (
                                                <div key={kitchen.id} className="group relative bg-white dark:bg-gray-800 rounded-[35px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none hover:shadow-indigo-500/10 hover:border-indigo-500 transition-all duration-300">
                                                    <div className="p-6">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{kitchen.cuisine_type}</p>
                                                                <h4 className="text-lg font-black text-gray-900 dark:text-white truncate uppercase tracking-tighter">{kitchen.brand_name}</h4>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{kitchen.user_details?.city}, {kitchen.user_details?.state}</p>
                                                            </div>
                                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                                                                <FiHome size={20} />
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 pt-5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <FiClock className="size-3 text-gray-400" />
                                                                <span className="text-[10px] font-black text-gray-400 uppercase">{kitchen.time_available || '9-9'}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleSuggestKitchen(kitchen.id)}
                                                                disabled={isSuggested || !currentPlan || actionLoading}
                                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                    isSuggested 
                                                                    ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 border border-emerald-100/50" 
                                                                    : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 active:scale-95 shadow-lg"
                                                                }`}
                                                            >
                                                                {isSuggested ? (
                                                                    <><FiCheckCircle /> Suggested</>
                                                                ) : (
                                                                    <><FiPlus /> Suggest</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllotMicroKitchenToPatientsPage;
