import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiClock, FiSearch, FiTruck, FiCheckCircle, FiUser, FiInfo, FiHash, FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { GiCookingPot, GiBowlOfRice, GiHamburger, GiBreadSlice } from "react-icons/gi";

// Custom Form Components
import DatePicker2 from "../../../components/form/date-picker2";
import Select from "../../../components/form/Select";

interface DailyMeal {
    id: number;
    user_details: {
        id: number;
        first_name: string;
        last_name: string;
        mobile?: string;
        address?: string;
    };
    meal_type_details: {
        id: number;
        name: string;
    };
    food_details: {
        id: number;
        name: string;
        image?: string;
    };
    quantity: number;
    meal_date: string;
    is_consumed: boolean;
    notes?: string;
}

interface PatientMapping {
    id: number;
    patient_details: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

const MealsBasedOnDailyPage: React.FC = () => {
    const [meals, setMeals] = useState<DailyMeal[]>([]);
    const [patients, setPatients] = useState<PatientMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filters
    const [selectedPatient, setSelectedPatient] = useState<string>("all");
    const [rangeType, setRangeType] = useState<string>("today");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    const fetchPatients = async () => {
        try {
            const url = createApiUrl("api/usermicrokitchenmapping/?status=accepted");
            const response = await axios.get(url, { headers: await getAuthHeaders() });
            setPatients(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDailyMeals = async () => {
        setLoading(true);
        try {
            let params = new URLSearchParams();
            
            if (selectedPatient !== "all") {
                params.append("user", selectedPatient);
            }

            const today = new Date().toISOString().split('T')[0];
            const tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const tomorrow = tomorrowDate.toISOString().split('T')[0];

            if (rangeType === "today") {
                params.append("meal_date", today);
            } else if (rangeType === "tomorrow") {
                params.append("meal_date", tomorrow);
            } else if (rangeType === "this_week") {
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                params.append("start_date", startOfWeek.toISOString().split('T')[0]);
                params.append("end_date", endOfWeek.toISOString().split('T')[0]);
            } else if (rangeType === "next_week") {
                const now = new Date();
                const startOfNextWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));
                const endOfNextWeek = new Date(now.setDate(now.getDate() - now.getDay() + 13));
                params.append("start_date", startOfNextWeek.toISOString().split('T')[0]);
                params.append("end_date", endOfNextWeek.toISOString().split('T')[0]);
            } else if (rangeType === "custom" && customStart && customEnd) {
                params.append("start_date", customStart);
                params.append("end_date", customEnd);
            }

            const url = createApiUrl(`api/usermeal/?${params.toString()}`);
            const response = await axios.get(url, { headers: await getAuthHeaders() });
            setMeals(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load prep schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        fetchDailyMeals();
    }, [rangeType, selectedPatient, customStart, customEnd]);

    const filteredMeals = meals.filter(m => 
        `${m.user_details.first_name} ${m.user_details.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.food_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.meal_type_details.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMealIcon = (name: string = "") => {
        const n = name.toLowerCase();
        if (n.includes("breakfast")) return <GiBreadSlice size={20} className="text-amber-500" />;
        if (n.includes("lunch")) return <GiBowlOfRice size={20} className="text-emerald-500" />;
        if (n.includes("dinner")) return <GiCookingPot size={20} className="text-indigo-500" />;
        return <GiHamburger size={20} className="text-orange-500" />;
    };

    const groupedByType: Record<string, DailyMeal[]> = filteredMeals.reduce((acc, meal) => {
        const type = meal.meal_type_details.name;
        if (!acc[type]) acc[type] = [];
        acc[type].push(meal);
        return acc;
    }, {} as Record<string, DailyMeal[]>);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Daily Dispatch Schedule" description="Manage today's meal preparation and dispatch" />
            <PageBreadcrumb pageTitle="Today's Meal Logistics" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-20">
                {/* Advanced Control Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5 mb-10">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                                    <FiTruck size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Logistics Hub</h1>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                        <FiClock className="animate-pulse" /> Dispatch Window: {rangeType.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 max-w-xl w-full">
                                <div className="relative">
                                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="text"
                                        placeholder="Fast search patients or meals..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-16 pr-8 py-5 bg-gray-50 dark:bg-gray-900/50 rounded-[30px] border-none text-sm font-black focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400 uppercase tracking-tight"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filters Row with Custom Components */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-50 dark:border-white/5 items-end">
                            {/* Date Presets Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Time Window</label>
                                <Select 
                                    options={[
                                        { value: "today", label: "Dispatch Today" },
                                        { value: "tomorrow", label: "Tomorrow's Prep" },
                                        { value: "this_week", label: "This Week" },
                                        { value: "next_week", label: "Next Week" },
                                        { value: "custom", label: "Custom Window" },
                                    ]}
                                    value={rangeType}
                                    onChange={(val) => setRangeType(val)}
                                    className="dark:bg-gray-900"
                                />
                            </div>

                            {/* Patient Select Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Medical Consumer</label>
                                <Select 
                                    options={[
                                        { value: "all", label: "All Patients" },
                                        ...patients.map(p => ({
                                            value: String(p.patient_details.id),
                                            label: `${p.patient_details.first_name} ${p.patient_details.last_name}`
                                        }))
                                    ]}
                                    value={selectedPatient}
                                    onChange={(val) => setSelectedPatient(val)}
                                    className="dark:bg-gray-900"
                                />
                            </div>

                            {/* Custom Range Range Picker (Start) */}
                            {rangeType === "custom" && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-2"
                                >
                                    <DatePicker2 
                                        id="start-date"
                                        label="Start Reference"
                                        value={customStart}
                                        onChange={(date) => setCustomStart(date)}
                                        placeholder="Start Date"
                                    />
                                </motion.div>
                            )}

                            {/* Custom Range Range Picker (End) */}
                            {rangeType === "custom" && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-2"
                                >
                                    <DatePicker2 
                                        id="end-date"
                                        label="End Reference"
                                        value={customEnd}
                                        onChange={(date) => setCustomEnd(date)}
                                        placeholder="End Date"
                                    />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-3 space-y-6">
                        <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-8">Workload Capacity</h3>
                            <div className="flex items-baseline gap-4 mb-10">
                                <span className="text-7xl font-black tracking-tighter leading-none">{filteredMeals.length}</span>
                                <div className="space-y-1">
                                    <span className="block text-xs font-black uppercase tracking-widest text-indigo-100">Active</span>
                                    <span className="block text-xs font-black uppercase tracking-widest text-indigo-100 italic">Units</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full py-5 bg-white/20 backdrop-blur-md rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white hover:bg-white hover:text-indigo-600 transition-all shadow-lg active:scale-95">
                                    Export Prep Sheet
                                </button>
                                <button className="w-full py-5 bg-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:scale-105 transition-all shadow-xl active:scale-95">
                                    Label Print Mode
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-2">
                                <FiFilter className="text-indigo-500" /> Phase Inventory
                            </h3>
                            <div className="space-y-6">
                                {Object.entries(groupedByType).map(([type, items]) => (
                                    <div key={type} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[20px] bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 group-hover:scale-110">
                                                {getMealIcon(type)}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-tighter text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">{type}</span>
                                        </div>
                                        <div className="px-4 py-1.5 bg-gray-100 dark:bg-white/5 rounded-xl text-[10px] font-black text-gray-600 dark:text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            {items.length}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-9">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-[45px] animate-pulse" />
                                ))}
                            </div>
                        ) : filteredMeals.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-gray-800 rounded-[60px] p-32 text-center border-2 border-dashed border-gray-100 dark:border-white/10 shadow-inner"
                            >
                                <div className="w-40 h-40 rounded-[60px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-100 dark:text-gray-800 mx-auto mb-10">
                                    <FiCheckCircle size={80} />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Operational Clearance</h2>
                                <p className="text-gray-400 mt-4 font-bold uppercase tracking-widest text-xs">The preparation schedule is empty for this criteria.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-16">
                                {Object.entries(groupedByType).map(([type, items]) => (
                                    <div key={type} className="space-y-8">
                                        <div className="flex items-center gap-6 px-4">
                                            <div className="w-2.5 h-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/20" />
                                            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white flex items-center gap-4">
                                                {type} 
                                                <span className="text-xs font-black text-gray-400 tracking-widest bg-white dark:bg-gray-800 px-4 py-1.5 rounded-2xl shadow-sm border border-gray-50 dark:border-white/5">
                                                    {items.length} ACTIVE BATCHES
                                                </span>
                                            </h2>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <AnimatePresence>
                                                {items.map(m => (
                                                    <motion.div 
                                                        key={m.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="bg-white dark:bg-gray-800 rounded-[45px] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5 group hover:border-indigo-600 hover:-translate-y-2 transition-all duration-300"
                                                    >
                                                        <div className="flex items-start justify-between mb-8">
                                                            <div className="flex gap-6">
                                                                <div className="w-20 h-20 rounded-[30px] bg-gray-100 dark:bg-gray-950 overflow-hidden ring-8 ring-gray-50 dark:ring-white/5 relative">
                                                                    {m.food_details.image ? (
                                                                        <img src={m.food_details.image} alt={m.food_details.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10">
                                                                             {getMealIcon(type)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="pt-2">
                                                                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{m.food_details.name}</h4>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center gap-2">
                                                                            <FiHash className="text-indigo-500" size={12} />
                                                                            <span className="text-[10px] font-black text-indigo-600 uppercase">Quantity {m.quantity}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${m.is_consumed ? 'bg-emerald-50 border-emerald-100 text-emerald-500 scale-110' : 'bg-gray-50 border-gray-100 dark:bg-white/5 dark:border-white/5 text-gray-400'}`}>
                                                                {m.is_consumed ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 pt-8 border-t border-gray-50 dark:border-white/5 space-y-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                        <FiUser size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase leading-none">{m.user_details.first_name} {m.user_details.last_name}</p>
                                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Residential Allotment</p>
                                                                    </div>
                                                                </div>
                                                                <button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors">
                                                                    <FiInfo size={18} />
                                                                </button>
                                                            </div>
                                                            
                                                            <div className="p-5 bg-gray-50/50 dark:bg-white/[0.03] rounded-3xl border border-transparent group-hover:border-indigo-100/30 transition-all">
                                                                <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase leading-relaxed line-clamp-2 italic">
                                                                    "{m.user_details.address || "No delivery address registered"}"
                                                                </p>
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <button className="flex-[2] py-4 bg-gray-900 dark:bg-white/10 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95">
                                                                    Confirm Dispatch
                                                                </button>
                                                                <button className="flex-1 py-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all active:scale-95">
                                                                    Prepared
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealsBasedOnDailyPage;
