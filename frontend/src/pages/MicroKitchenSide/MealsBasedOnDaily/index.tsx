import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiClock, FiSearch, FiTruck, FiCheckCircle, FiUser, FiInfo, FiHash } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { GiCookingPot, GiBowlOfRice, GiHamburger, GiBreadSlice } from "react-icons/gi";

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

const MealsBasedOnDailyPage: React.FC = () => {
    const [meals, setMeals] = useState<DailyMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchDailyMeals = async (date: string) => {
        setLoading(true);
        try {
            const url = createApiUrl(`api/usermeal/?meal_date=${date}`);
            const response = await axios.get(url, { headers: await getAuthHeaders() });
            setMeals(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load today's prep schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyMeals(selectedDate);
    }, [selectedDate]);

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

    // Group meals by type for prep overview
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
                {/* Header Control Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5 mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                                <FiTruck size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Dispatch Hub</h1>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                    <FiClock className="animate-pulse" /> Operational Day: {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="relative flex-1 lg:min-w-[300px]">
                                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search by patient, meal, or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-none text-sm font-black focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <input 
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-none text-sm font-black focus:ring-2 focus:ring-indigo-500 transition-all uppercase tracking-widest text-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    
                    {/* Left: Summary Stats & Global Actions */}
                    <div className="xl:col-span-3 space-y-6">
                        <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-6">Dispatch Volume</h3>
                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-6xl font-black tracking-tighter leading-none">{filteredMeals.length}</span>
                                <span className="text-xs font-bold uppercase mb-2">Total Units</span>
                            </div>
                            <button className="w-full py-4 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:scale-105 transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
                                Print Bulk Labels
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Preparation Phases</h3>
                            {Object.entries(groupedByType).map(([type, items]) => (
                                <div key={type} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-all group-hover:bg-indigo-500 group-hover:text-white">
                                            {getMealIcon(type)}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">{type}</span>
                                    </div>
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-[10px] font-black text-gray-400">{items.length}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Detailed Prep List */}
                    <div className="xl:col-span-9">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1,2,4,4].map(i => <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-[40px] animate-pulse" />)}
                            </div>
                        ) : filteredMeals.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                                <div className="w-32 h-32 rounded-[50px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-200 dark:text-gray-700 mx-auto mb-8">
                                    <FiCheckCircle size={56} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Day Operations Cleared</h2>
                                <p className="text-gray-400 mt-2 font-medium">No meals found for the selected filter and date.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {Object.entries(groupedByType).map(([type, items]) => (
                                    <div key={type} className="space-y-6">
                                        <div className="flex items-center gap-4 px-2">
                                            <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                                            <h2 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-3">
                                                {type} <span className="text-[10px] text-gray-400 font-bold tracking-widest px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg">{items.length} Units</span>
                                            </h2>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                            <AnimatePresence>
                                                {items.map(m => (
                                                    <motion.div 
                                                        key={m.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-white dark:bg-gray-800 rounded-[40px] p-6 shadow-sm border border-gray-100 dark:border-white/5 group hover:border-indigo-500/50 hover:shadow-xl hover:shadow-gray-200/40 dark:hover:shadow-none transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className="flex gap-4">
                                                                <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-950 overflow-hidden ring-4 ring-gray-50 dark:ring-white/5">
                                                                    {m.food_details.image ? (
                                                                        <img src={m.food_details.image} alt={m.food_details.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10">
                                                                             {getMealIcon(type)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase truncate max-w-[150px] leading-tight mb-1">{m.food_details.name}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <FiHash className="text-indigo-400" size={12} />
                                                                        <span className="text-xs font-black text-indigo-600 uppercase">{m.quantity} Qty</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${m.is_consumed ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-amber-50 border-amber-100 text-amber-500'}`}>
                                                                {m.is_consumed ? <FiCheckCircle size={18} /> : <FiClock size={18} />}
                                                            </div>
                                                        </div>

                                                        <div className="pt-6 border-t border-gray-50 dark:border-white/5 space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                                                    <FiUser size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-none">{m.user_details.first_name} {m.user_details.last_name}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Patient ID #{m.user_details.id}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dispatch Destination</p>
                                                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase leading-snug truncate">
                                                                    {m.user_details.address || "Contact for pickup"}
                                                                </p>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button className="flex-1 py-3 bg-gray-900 dark:bg-white/10 rounded-2xl text-[9px] font-black uppercase text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-gray-900/20 active:scale-95">
                                                                    Mark Dispatch
                                                                </button>
                                                                <button className="w-12 h-12 flex items-center justify-center border border-gray-100 dark:border-white/5 rounded-2xl text-gray-400 hover:text-indigo-500 transition-colors">
                                                                    <FiInfo size={16} />
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
