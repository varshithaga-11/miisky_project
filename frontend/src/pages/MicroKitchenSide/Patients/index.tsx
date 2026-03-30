import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiUsers, FiUser, FiInfo, FiActivity, FiMapPin, FiCalendar, FiSearch, FiLayers } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Calendar Imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { GiBreadSlice, GiBowlOfRice, GiHamburger, GiCookingPot } from "react-icons/gi";

interface UserMeal {
    id: number;
    meal_date: string;
    meal_type_details: {
        name: string;
    };
    food_details: {
        name: string;
        image?: string;
    };
    is_consumed: boolean;
}

interface PatientAllotted {
    id: number;
    patient_details: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        mobile: string;
        address: string;
    };
    patient_questionnaire: any;
    nutritionist_details: {
        id: number;
        first_name: string;
        last_name: string;
    };
    original_nutritionist_details?: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
    nutritionist_effective_from?: string | null;
    original_micro_kitchen_details?: {
        id: number;
        brand_name: string;
    } | null;
    diet_plan_details: {
        id: number;
        plan_name: string;
        no_of_days?: number;
        start_date: string;
        end_date: string;
    };
    status: string;
    suggested_on: string;
    approved_on: string;
    micro_kitchen_effective_from?: string | null;
}

const MicroKitchenPatientsPage: React.FC = () => {
    const [allotments, setAllotments] = useState<PatientAllotted[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<PatientAllotted | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Calendar States
    const [showCalendar, setShowCalendar] = useState(false);
    const [patientMeals, setPatientMeals] = useState<UserMeal[]>([]);
    const [loadingMeals, setLoadingMeals] = useState(false);

    const fetchAllotments = async () => {
        setLoading(true);
        try {
            const url = createApiUrl("api/micro-kitchen-patients/");
            const response = await axios.get(url, { headers: await getAuthHeaders() });
            // API is paginated, so take results
            setAllotments(response.data.results || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load allotted patients");
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientMeals = async (patientId: number) => {
        setLoadingMeals(true);
        setShowCalendar(true);
        try {
            const url = createApiUrl(`api/usermeal/?user=${patientId}`);
            const response = await axios.get(url, { headers: await getAuthHeaders() });
            setPatientMeals(response.data);
        } catch (error) {
            toast.error("Failed to load meal calendar");
        } finally {
            setLoadingMeals(false);
        }
    };

    useEffect(() => {
        fetchAllotments();
    }, []);

    const filteredAllotments = allotments.filter(a =>
        `${a.patient_details.first_name} ${a.patient_details.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patient_details.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMealIcon = (name: string = "") => {
        const n = name.toLowerCase();
        if (n.includes("breakfast")) return <GiBreadSlice size={16} className="text-amber-500" />;
        if (n.includes("lunch")) return <GiBowlOfRice size={16} className="text-emerald-500" />;
        if (n.includes("dinner")) return <GiCookingPot size={16} className="text-indigo-500" />;
        return <GiHamburger size={16} className="text-orange-500" />;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Allotted Patients" description="View and manage patients allotted to your kitchen" />
            <PageBreadcrumb pageTitle="Kitchen Allotments" />
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
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Active Consumers</h2>
                            </div>

                            <div className="relative mb-6">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-none text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto pr-2 no-scrollbar">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl animate-pulse" />)
                                ) : filteredAllotments.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400 text-xs font-bold uppercase">No patients found</p>
                                    </div>
                                ) : filteredAllotments.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedPatient(a)}
                                        className={`w-full p-5 rounded-[28px] text-left transition-all group border ${selectedPatient?.id === a.id
                                            ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20 translate-x-2"
                                            : "bg-gray-50/50 dark:bg-white/[0.02] border-transparent hover:border-indigo-500/30 hover:bg-white dark:hover:bg-white/[0.05]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${selectedPatient?.id === a.id ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                                                }`}>
                                                {a.patient_details.first_name?.[0] || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-black text-sm truncate uppercase tracking-tight ${selectedPatient?.id === a.id ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                                    {a.patient_details.first_name} {a.patient_details.last_name}
                                                </p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPatient?.id === a.id ? "text-indigo-100" : "text-gray-400"}`}>
                                                    {a.diet_plan_details.plan_name}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Detail View */}
                    <div className="lg:col-span-8 space-y-8">
                        {!selectedPatient ? (
                            <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                                <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-8">
                                    <FiUser size={40} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Profile Access Point</h3>
                                <p className="text-gray-400 mt-2 font-medium">Select a patient from the list to view their dietary requirements and contact information.</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                {/* Core Info Header */}
                                <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[35px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 shadow-inner">
                                            <FiActivity size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                                {selectedPatient.patient_details.first_name} {selectedPatient.patient_details.last_name}
                                            </h2>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">Active Allotment</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Since {new Date(selectedPatient.suggested_on).toLocaleDateString()}</span>
                                                {selectedPatient.original_micro_kitchen_details && (
                                                    <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100/50">
                                                        Kitchen Switched from {selectedPatient.original_micro_kitchen_details.brand_name} on {selectedPatient.micro_kitchen_effective_from}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => fetchPatientMeals(selectedPatient.patient_details.id)}
                                            className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-indigo-600/20"
                                            title="View Meal Calendar"
                                        >
                                            <FiCalendar size={20} />
                                        </button>
                                        <a href={`tel:${selectedPatient.patient_details.mobile}`} className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all shadow-sm">
                                            <FiInfo size={20} />
                                        </a>
                                    </div>
                                </div>

                                {/* Patient Intelligence Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Medical/Nutritional Profile */}
                                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 space-y-6">
                                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Health Profile</h3>
                                            <FiLayers className="text-indigo-500" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-5 bg-gray-50 dark:bg-white/[0.02] rounded-3xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Diet Type</p>
                                                <p className="text-sm font-black text-indigo-500 uppercase">{selectedPatient.diet_plan_details.plan_name}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 dark:bg-white/[0.02] rounded-3xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Age / Weight</p>
                                                <p className="text-sm font-black text-indigo-500 uppercase">{selectedPatient.patient_questionnaire?.age ?? '--'}Y / {selectedPatient.patient_questionnaire?.weight_kg ?? '--'}kg</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Lifestyle Type</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedPatient.patient_questionnaire?.work_type || 'Moderate'}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Meals Per Day</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedPatient.patient_questionnaire?.meals_per_day || '3'} Sessions</span>
                                            </div>
                                            <div className="py-2 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Supervising Nutritionist</span>
                                                    <span className="text-xs font-black text-indigo-500 uppercase tracking-tighter">{selectedPatient.nutritionist_details.first_name}</span>
                                                </div>
                                                {selectedPatient.original_nutritionist_details && (
                                                    <div className="flex items-center justify-between opacity-60">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase italic">Previously Managed By</span>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase italic">{selectedPatient.original_nutritionist_details.first_name} (Until {selectedPatient.nutritionist_effective_from})</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logistics & Contact */}
                                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 space-y-6">
                                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Delivery Context</h3>
                                            <FiMapPin className="text-indigo-500" />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-500">
                                                    <FiMapPin size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Residential Address</p>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-relaxed uppercase">{selectedPatient.patient_details.address || "No address provided"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-500">
                                                    <FiCalendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Duration</p>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-relaxed uppercase">
                                                        {new Date(selectedPatient.diet_plan_details.start_date).toLocaleDateString()} &mdash; {new Date(selectedPatient.diet_plan_details.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-4 border-t border-gray-50 dark:border-white/5">
                                            <div className="flex gap-4">
                                                <button className="flex-1 py-4 bg-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                                                    Initiate Dispatch
                                                </button>
                                                <button className="px-6 border border-gray-100 dark:border-white/5 rounded-3xl text-gray-400 hover:text-rose-500 transition-colors">
                                                    <FiActivity size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Dietary Intelligence */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Dietary Constraints & Safety */}
                                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                            Safety & Constraints
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="p-5 bg-rose-50/30 dark:bg-rose-900/10 rounded-3xl border border-rose-100/50">
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Critical Allergies</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-relaxed">
                                                    {selectedPatient.patient_questionnaire?.food_allergy ? (
                                                        <span className="text-rose-600 flex items-center gap-2">
                                                            <FiInfo size={14} /> {selectedPatient.patient_questionnaire.food_allergy_details || "Allergy Present"}
                                                        </span>
                                                    ) : "No Known Allergies"}
                                                </p>
                                            </div>

                                            <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100/50">
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Avoidance Preferences</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {selectedPatient.patient_questionnaire?.food_preferences?.length > 0 ? (
                                                        selectedPatient.patient_questionnaire.food_preferences.map((p: string) => (
                                                            <span key={p} className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase text-indigo-500 border border-indigo-200/50 shadow-sm">{p}</span>
                                                        ))
                                                    ) : <span className="text-xs font-medium text-gray-400">Standard preference list</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preference & Lifestyle */}
                                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            Culinary Blueprint
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Diet Pattern</p>
                                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate">{selectedPatient.patient_questionnaire?.diet_pattern?.replace(/_/g, ' ') || "Mixed"}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Consumes Egg</p>
                                                <p className="text-xs font-black text-emerald-500 uppercase">{selectedPatient.patient_questionnaire?.consumes_egg ? "Allowed" : "Restricted"}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Diary Usage</p>
                                                <p className="text-xs font-black text-emerald-500 uppercase">{selectedPatient.patient_questionnaire?.consumes_dairy ? "Included" : "Excluded"}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Food Source</p>
                                                <p className="text-xs font-black text-indigo-500 uppercase">{selectedPatient.patient_questionnaire?.food_source || "Kitchen"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Health & Condition Awareness Mapping */}
                                <div className="bg-white dark:bg-gray-800 rounded-[40px] p-10 border border-gray-100 dark:border-white/5 shadow-inner">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50 dark:border-white/5">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Medical Context Mapping</h3>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Information for Preparation Guidance Only</span>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Diabetes Status</p>
                                            <p className={`text-xs font-black uppercase tracking-tighter ${selectedPatient.patient_questionnaire?.has_diabetes ? "text-rose-500" : "text-emerald-500"}`}>
                                                {selectedPatient.patient_questionnaire?.has_diabetes ? "Confirmed Type Presence" : "Not Reported"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">BP Levels</p>
                                            <p className={`text-xs font-black uppercase tracking-tighter ${selectedPatient.patient_questionnaire?.has_bp === 'high' ? "text-rose-500" : "text-emerald-500"}`}>
                                                {selectedPatient.patient_questionnaire?.has_bp || "Normal Range"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cardiac Awareness</p>
                                            <p className={`text-xs font-black uppercase tracking-tighter ${selectedPatient.patient_questionnaire?.has_cardiac_issues ? "text-rose-500" : "text-emerald-500"}`}>
                                                {selectedPatient.patient_questionnaire?.has_cardiac_issues ? "Special Care Req." : "Low Risk"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Condition List</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedPatient.patient_questionnaire?.health_conditions?.map((c: string) => (
                                                    <span key={c} className="text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md uppercase">{c}</span>
                                                )) || "None"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Calendar Modal */}
            <AnimatePresence>
                {showCalendar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-white dark:bg-gray-900 w-full h-full rounded-[50px] overflow-hidden flex flex-col shadow-2xl border border-white/10"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                                        <FiCalendar size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Meal Calendar</h2>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                            {selectedPatient?.patient_details.first_name} {selectedPatient?.patient_details.last_name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCalendar(false)}
                                    className="px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-rose-500 hover:text-white transition-all border border-transparent hover:border-rose-500/20"
                                >
                                    Close Dashboard
                                </button>
                            </div>

                            {/* Calendar Content */}
                            <div className="flex-1 p-8 overflow-y-auto no-scrollbar custom-calendar-lite">
                                {loadingMeals ? (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] animate-pulse">Syncing Meal Schedule...</p>
                                    </div>
                                ) : (
                                    <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        initialView="dayGridMonth"
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek'
                                        }}
                                        height="100%"
                                        events={patientMeals.map(m => ({
                                            id: String(m.id),
                                            title: m.meal_type_details.name,
                                            start: m.meal_date,
                                            backgroundColor: m.is_consumed ? '#10b981' : '#4f46e5',
                                            borderColor: 'transparent',
                                            extendedProps: { food: m.food_details.name }
                                        }))}
                                        eventContent={(eventInfo) => (
                                            <div className="p-1 px-2 flex items-center gap-1.5 overflow-hidden">
                                                {getMealIcon(eventInfo.event.title)}
                                                <div className="truncate">
                                                    <div className="text-[10px] font-black uppercase leading-none">{eventInfo.event.title}</div>
                                                    <div className="text-[8px] font-medium opacity-80 truncate">{eventInfo.event.extendedProps.food}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                )}
                                { /* CSS Injections for Calendar */}
                                <style>{`
                                    .fc-theme-standard .fc-scrollgrid { border: none !important; }
                                    .fc .fc-toolbar-title { font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; font-size: 1.5rem; color: #111827; }
                                    .fc .fc-button-primary { background: transparent !important; border: 1px solid #e5e7eb !important; color: #6b7280 !important; border-radius: 12px !important; text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 0.1em; padding: 10px 16px !important; }
                                    .fc .fc-button-primary:hover { background: #f3f4f6 !important; }
                                    .fc .fc-button-active { background: #4f46e5 !important; border-color: #4f46e5 !important; color: white !important; }
                                    .fc-daygrid-event { border-radius: 12px !important; margin: 2px 4px !important; padding: 4px !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; border: none !important; }
                                    .fc-col-header-cell-cushion { font-weight: 900 !important; text-transform: uppercase !important; font-size: 10px !important; letter-spacing: 0.1em !important; color: #9ca3af !important; padding: 15px !important; }
                                    .dark .fc .fc-button-primary { border-color: rgba(255,255,255,0.05) !important; color: #9ca3af !important; }
                                    .dark .fc .fc-toolbar-title { color: white; }
                                    .dark .fc-daygrid-day { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); }
                                    .fc-day-today { background: #f5f3ff !important; }
                                    .dark .fc-day-today { background: rgba(79, 70, 229, 0.05) !important; }
                                `}</style>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MicroKitchenPatientsPage;
