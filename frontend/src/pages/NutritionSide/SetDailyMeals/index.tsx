import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyPatients, getActivePlansForPatient, getUserDailyMeals, getUserMealsList, saveBulkMeals, getMealTypeList, getCuisineTypeList, getFoodList } from "./api";
import type { MappedPatientResponse, UserDietPlan, UserMeal, MealType, Food, CuisineType } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUsers, FiPlus, FiSave, FiCalendar, FiActivity, FiTrash2, FiInfo, FiCheckCircle, FiCheck } from "react-icons/fi";

const SetDailyMealsPage: React.FC = () => {
    const [patients, setPatients] = useState<MappedPatientResponse[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<MappedPatientResponse | null>(null);
    const [activePlan, setActivePlan] = useState<UserDietPlan | null>(null);
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);
    const [cuisines, setCuisines] = useState<CuisineType[]>([]);
    const [foods, setFoods] = useState<Food[]>([]);
    
    // Selection Mode
    const [isRangeMode, setIsRangeMode] = useState(false);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    
    // Daily Meals Data (Local structure to manage entries for the selected day)
    const [dailyEntries, setDailyEntries] = useState<Partial<UserMeal>[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            try {
                const [pts, mts, cuis] = await Promise.all([
                    getMyPatients(),
                    getMealTypeList(1, "all").then((r: any) => r.results),
                    getCuisineTypeList(1, "all").then((r: any) => r.results)
                ]);
                const patientList = Array.isArray(pts) ? pts : (pts as any)?.results ?? [];
                setPatients(patientList);
                setMealTypes(mts);
                setCuisines(cuis);
                if (patientList.length > 0) setSelectedPatient(patientList[0]);
            } catch (err) {
                toast.error("Failed to load setup data");
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            const loadPatientData = async () => {
                try {
                    const plans = await getActivePlansForPatient(selectedPatient.user.id);
                    const currentPlan = plans[0] || null;
                    setActivePlan(currentPlan);
                    
                    if (currentPlan) {
                        // Default Range to Plan End Date if available
                        if (currentPlan.end_date) {
                            setEndDate(currentPlan.end_date);
                        }
                        
                        // Fetch based on mode
                        if (isRangeMode) {
                            fetchAllMeals(selectedPatient.user.id);
                        } else {
                            fetchDailyMeals(selectedPatient.user.id, selectedDate);
                        }
                    } else {
                        setDailyEntries([]);
                    }
                } catch (err) {
                    toast.error("Failed to load patient plans");
                }
            };
            loadPatientData();
        }
    }, [selectedPatient, selectedDate, isRangeMode]);

    const fetchDailyMeals = async (pid: number, date: string) => {
        try {
            const meals = await getUserDailyMeals(pid, date);
            setDailyEntries(meals);
        } catch (err) {
            toast.error("Failed to load daily schedule");
        }
    };

    const fetchAllMeals = async (pid: number) => {
        try {
            const meals = await getUserMealsList(pid);
            setDailyEntries(meals);
        } catch (err) {
            toast.error("Failed to load historical schedule");
        }
    };

    const handleAddSlot = (specificDate?: string) => {
        if (!selectedPatient || !activePlan) {
            toast.warning("Patient must have an active diet plan");
            return;
        }
        setDailyEntries([...dailyEntries, { 
            user: selectedPatient.user.id,
            user_diet_plan: activePlan.id,
            meal_date: specificDate || selectedDate,
            meal_type: mealTypes[0]?.id,
            cuisine_type: Number(selectedCuisineId) || undefined,
            quantity: 1
        }]);
    };

    const handleRemoveSlot = (index: number) => {
        setDailyEntries(prev => prev.filter((_, i) => i !== index));
    };

    const handleEntryUpdate = (index: number, field: keyof UserMeal, value: any) => {
        const updated = [...dailyEntries];
        updated[index] = { ...updated[index], [field]: value };
        setDailyEntries(updated);
    };

    const handleSave = async (specificDate?: string) => {
        const entriesToSave = specificDate 
            ? dailyEntries.filter(e => e.meal_date === specificDate)
            : dailyEntries;

        if (entriesToSave.length === 0) {
            toast.warning(`Add at least one meal ${specificDate ? `for ${specificDate}` : 'template'} before saving`);
            return;
        }
        
        // Basic validation
        const isValid = entriesToSave.every(e => e.meal_type && e.food && e.quantity);
        if (!isValid) {
            toast.error("Please fill all fields for each slot");
            return;
        }

        setSaving(true);
        try {
            await saveBulkMeals(entriesToSave as UserMeal[]);
            toast.success(`Successfully programmed ${specificDate ? `schedule for ${specificDate}` : isRangeMode ? 'range' : 'daily'} schedule`);
            
            // Refresh underlying data to show synced state
            if (isRangeMode) {
                fetchAllMeals(selectedPatient!.user.id);
            } else {
                fetchDailyMeals(selectedPatient!.user.id, specificDate || selectedDate);
            }
        } catch (err) {
            toast.error("Failed to sync schedule");
        } finally {
            setSaving(false);
        }
    };

    // Helper to get array of dates in range
    const getDatesInRange = (start: string, end: string) => {
        const dates = [];
        let curr = new Date(start);
        let last = new Date(end);
        while (curr <= last) {
            dates.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

    const datesToShow = isRangeMode ? getDatesInRange(startDate, endDate) : [selectedDate];

    // Food filtering logic can be handled in-line or via a helper
    const [foodSearch] = useState("");
    const [selectedCuisineId, setSelectedCuisineId] = useState<number | "">("");

    useEffect(() => {
        const fetchFilteredFoods = async () => {
            try {
                const res = await getFoodList(1, 100, foodSearch, "", selectedCuisineId);
                setFoods(res.results);
            } catch (err) {}
        };
        fetchFilteredFoods();
    }, [foodSearch, selectedCuisineId]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-12">
            <PageMeta title="Patient Meal Scheduler" description="Personalize daily nutrition plans for your patients." />
            <PageBreadcrumb pageTitle="Daily Meal Optimization" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Patient Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05]">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <FiUsers size={20} className="text-indigo-500" /> Patient List
                            </h3>
                            <div className="space-y-3">
                                {patients.map(p => (
                                    <button
                                        key={p.user.id}
                                        onClick={() => setSelectedPatient(p)}
                                        className={`w-full p-4 rounded-2xl text-left transition-all ${selectedPatient?.user.id === p.user.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-50 dark:bg-white/[0.02] text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}
                                    >
                                        <p className="font-black text-sm">{p.user.first_name} {p.user.last_name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scheduler Main */}
                    <div className="xl:col-span-3 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[40px] border border-transparent dark:border-white/[0.05]">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching Optimization Data...</p>
                            </div>
                        ) : !selectedPatient ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[40px] border border-transparent dark:border-white/[0.05] shadow-xl shadow-gray-200/20">
                                <div className="size-24 rounded-[32px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-8 border border-gray-100 dark:border-white/5">
                                    <FiUsers size={48} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">No Patients Allotted</h2>
                                <p className="text-gray-400 font-medium text-sm text-center max-w-xs leading-relaxed">You haven't been assigned any patients yet, or they don't have active mappings.</p>
                            </div>
                        ) : selectedPatient && (
                            <>
                                {/* Plan & Mode Picker */}
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-transparent dark:border-white/[0.05] shadow-sm flex flex-col xl:flex-row justify-between items-center gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-[22px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-900/30">
                                            <FiActivity size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                {selectedPatient.user.first_name}'s Schedule
                                            </h2>
                                            {activePlan ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FiCheckCircle className="text-emerald-500" size={12} />
                                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Plan: {activePlan.diet_plan_details?.title}</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FiInfo className="text-red-400" size={12} />
                                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest italic">No active diet plan</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-[32px] border border-gray-100 dark:border-white/10">
                                        {/* Mode Toggle */}
                                        <div className="flex p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-inner">
                                            <button 
                                                onClick={() => setIsRangeMode(false)}
                                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRangeMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Day
                                            </button>
                                            <button 
                                                onClick={() => setIsRangeMode(true)}
                                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRangeMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Range
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 px-4">
                                            {isRangeMode ? (
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="date" 
                                                        value={startDate} 
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="bg-transparent border-none outline-none font-black text-[11px] text-gray-700 dark:text-gray-300 uppercase tracking-widest"
                                                    />
                                                    <span className="text-gray-300 font-bold">→</span>
                                                    <input 
                                                        type="date" 
                                                        value={endDate} 
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="bg-transparent border-none outline-none font-black text-[11px] text-gray-700 dark:text-gray-300 uppercase tracking-widest"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <FiCalendar className="text-gray-400" />
                                                    <input 
                                                        type="date" 
                                                        value={selectedDate} 
                                                        onChange={(e) => setSelectedDate(e.target.value)}
                                                        className="bg-transparent border-none outline-none font-black text-[11px] text-gray-700 dark:text-gray-300 uppercase tracking-widest"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Meal Slot Builder (Timeline View) */}
                                {activePlan && (
                                    <div className="space-y-12">
                                        {datesToShow.map((dateStr) => {
                                            const dayEntries = dailyEntries.filter(e => e.meal_date === dateStr);
                                            const dateObj = new Date(dateStr);
                                            const formattedDay = dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

                                            return (
                                                <div key={dateStr} className="space-y-6">
                                                    <div className="flex justify-between items-center px-4">
                                                        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] text-white shadow-lg shadow-indigo-500/30">
                                                                {dateObj.getDate()}
                                                            </div>
                                                            {formattedDay}
                                                        </h3>
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={() => handleAddSlot(dateStr)}
                                                                className="px-6 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm flex items-center gap-2"
                                                            >
                                                                <FiPlus size={14} /> Add Meal
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSave(dateStr)}
                                                                disabled={saving}
                                                                className="px-6 py-2 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                <FiCheck size={14} /> Sync Day
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {dayEntries.length === 0 ? (
                                                            <div className="p-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px] flex flex-col items-center justify-center text-gray-300">
                                                                <p className="text-[10px] uppercase font-black tracking-widest">No meals scheduled</p>
                                                            </div>
                                                        ) : (
                                                            dayEntries.map((entry) => {
                                                                // Find global index for update/remove
                                                                const globalIdx = dailyEntries.indexOf(entry);
                                                                return (
                                                                    <div key={globalIdx} className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-transparent dark:border-white/[0.05] shadow-lg shadow-gray-200/20 dark:shadow-none transition-all hover:shadow-xl">
                                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                                                            <div className="md:col-span-2">
                                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Meal Type</label>
                                                                                <select 
                                                                                    value={entry.meal_type}
                                                                                    onChange={(e) => handleEntryUpdate(globalIdx, 'meal_type', Number(e.target.value))}
                                                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-bold text-sm text-gray-700 dark:text-gray-300"
                                                                                >
                                                                                    <option value="">Select Type</option>
                                                                                    {mealTypes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                                                </select>
                                                                            </div>

                                                                            <div className="md:col-span-3">
                                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Cuisine</label>
                                                                                <select 
                                                                                    value={entry.cuisine_type || ""}
                                                                                    onChange={(e) => {
                                                                                        const cid = e.target.value ? Number(e.target.value) : "";
                                                                                        handleEntryUpdate(globalIdx, 'cuisine_type', cid || null);
                                                                                        setSelectedCuisineId(cid);
                                                                                    }}
                                                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-bold text-sm text-gray-700 dark:text-gray-300"
                                                                                >
                                                                                    <option value="">All Cuisines</option>
                                                                                    {cuisines.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                                                </select>
                                                                            </div>

                                                                            <div className="md:col-span-4">
                                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Food Item</label>
                                                                                <select 
                                                                                    value={entry.food}
                                                                                    onChange={(e) => handleEntryUpdate(globalIdx, 'food', Number(e.target.value))}
                                                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-bold text-sm text-gray-700 dark:text-gray-300"
                                                                                >
                                                                                    <option value="">Search/Choose Food</option>
                                                                                    {foods.map(f => <option key={f.id} value={f.id}>{f.name} {f.nutrition?.calories ? `(${f.nutrition.calories} kcal)` : ''}</option>)}
                                                                                </select>
                                                                            </div>

                                                                            <div className="md:col-span-2">
                                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Quantity</label>
                                                                                <input 
                                                                                    type="number" 
                                                                                    step="0.1" 
                                                                                    value={entry.quantity || ''}
                                                                                    onChange={(e) => handleEntryUpdate(globalIdx, 'quantity', Number(e.target.value))}
                                                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-bold text-sm text-gray-700 dark:text-gray-300"
                                                                                    placeholder="100.0"
                                                                                />
                                                                            </div>

                                                                            <div className="md:col-span-1 flex justify-center pb-2">
                                                                                <button 
                                                                                    onClick={() => handleRemoveSlot(globalIdx)}
                                                                                    className="p-3 text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl transition-all"
                                                                                >
                                                                                    <FiTrash2 size={20} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="mt-6">
                                                                            <input 
                                                                                type="text" 
                                                                                placeholder="Personalized notes for this specific meal..."
                                                                                value={entry.notes || ''}
                                                                                onChange={(e) => handleEntryUpdate(globalIdx, 'notes', e.target.value)}
                                                                                className="w-full bg-transparent border-b border-gray-100 dark:border-white/10 px-2 py-2 text-xs font-medium focus:border-indigo-500 outline-none transition-all dark:text-gray-400"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="pt-12 flex justify-end">
                                            <button 
                                                onClick={() => handleSave()}
                                                disabled={saving || dailyEntries.length === 0}
                                                className="px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-gray-400 dark:shadow-none hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-50"
                                            >
                                                {saving ? 'Syncing...' : `Save ${isRangeMode ? 'Range Plan' : 'Today\'s Schedule'}`} <FiSave size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetDailyMealsPage;
