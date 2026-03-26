import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyPatients, getActivePlansForPatient, getUserDailyMeals, getUserMealsList, saveBulkMeals, getMealTypeList, getCuisineTypeList, getFoodList, getPackagingMaterialList } from "./api";
import type { MappedPatientResponse, UserDietPlan, UserMeal, MealType, Food, CuisineType } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUsers, FiSave, FiCalendar, FiActivity, FiTrash2, FiInfo, FiCheckCircle, FiMenu, FiSearch, FiPackage } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const DRAG_TYPE = "food-item";

const SetDailyMealsPage: React.FC = () => {
    const [patients, setPatients] = useState<MappedPatientResponse[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<MappedPatientResponse | null>(null);
    const [activePlan, setActivePlan] = useState<UserDietPlan | null>(null);
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);
    const [cuisines, setCuisines] = useState<CuisineType[]>([]);
    const [foods, setFoods] = useState<Food[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

    const [isRangeMode, setIsRangeMode] = useState(false);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");

    const [dailyEntries, setDailyEntries] = useState<Partial<UserMeal>[]>([]);
    const [allMeals, setAllMeals] = useState<UserMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<UserMeal | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [foodSearch, setFoodSearch] = useState("");
    const [selectedMealTypeId, setSelectedMealTypeId] = useState<number | "">("");
    const [selectedCuisineId, setSelectedCuisineId] = useState<number | "">("");
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [packagingMaterials, setPackagingMaterials] = useState<{ id: number; name: string }[]>([]);
    const [selectedPackagingMaterialId, setSelectedPackagingMaterialId] = useState<number | "">("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setCurrentUserId(decoded.user_id || decoded.sub || null);
            } catch (err) {}
        }
    }, []);

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            try {
                const [pts, mts, cuis, pkgRes] = await Promise.all([
                    getMyPatients(),
                    getMealTypeList(1, "all").then((r: any) => r.results),
                    getCuisineTypeList(1, "all").then((r: any) => r.results),
                    getPackagingMaterialList(1, "all").then((r: any) => r.results ?? [])
                ]);
                const patientList = Array.isArray(pts) ? pts : (pts as any)?.results ?? [];
                setPatients(patientList);
                setMealTypes(mts);
                setCuisines(cuis);
                setPackagingMaterials(Array.isArray(pkgRes) ? pkgRes : []);
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
                        const planStart = currentPlan.start_date || new Date().toISOString().split("T")[0];
                        const planEnd = currentPlan.end_date || planStart;
                        setStartDate(planStart);
                        setEndDate(planEnd);
                        const today = new Date().toISOString().split("T")[0];
                        const inRange = today >= planStart && today <= planEnd;
                        setSelectedDate(inRange ? today : planStart);
                    } else {
                        setStartDate("");
                        setEndDate("");
                        setSelectedDate("");
                        setDailyEntries([]);
                        setAllMeals([]);
                    }
                } catch (err) {
                    toast.error("Failed to load patient plans");
                }
            };
            loadPatientData();
        }
    }, [selectedPatient]);

    useEffect(() => {
        if (selectedPatient && activePlan) {
            const planStart = activePlan.start_date || "";
            const planEnd = activePlan.end_date || "";
            loadAllScheduledMeals(selectedPatient.user.id, planStart, planEnd);
            if (isRangeMode) {
                fetchAllMeals(selectedPatient.user.id, planStart, planEnd);
            } else if (selectedDate) {
                fetchDailyMeals(selectedPatient.user.id, selectedDate);
            }
        }
    }, [selectedPatient, activePlan, selectedDate, isRangeMode]);

    const loadAllScheduledMeals = async (pid: number, planStart?: string, planEnd?: string) => {
        try {
            const meals = await getUserMealsList(pid, planStart, planEnd);
            setAllMeals(meals);
        } catch (err) {}
    };

    const fetchDailyMeals = async (pid: number, date: string) => {
        try {
            const meals = await getUserDailyMeals(pid, date);
            setDailyEntries(meals);
        } catch (err) {
            toast.error("Failed to load daily schedule");
        }
    };

    const fetchAllMeals = async (pid: number, planStart?: string, planEnd?: string) => {
        try {
            const meals = await getUserMealsList(pid, planStart, planEnd);
            setDailyEntries(meals);
        } catch (err) {
            toast.error("Failed to load historical schedule");
        }
    };

    useEffect(() => {
        const fetchFilteredFoods = async () => {
            try {
                const res = await getFoodList(1, 200, foodSearch, selectedMealTypeId || "", selectedCuisineId || "");
                setFoods(res.results);
            } catch (err) {}
        };
        fetchFilteredFoods();
    }, [foodSearch, selectedMealTypeId, selectedCuisineId]);

    const getDatesInRange = (start: string, end: string) => {
        const dates: string[] = [];
        let curr = new Date(start);
        let last = new Date(end);
        while (curr <= last) {
            dates.push(curr.toISOString().split("T")[0]);
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

    const planMinDate = activePlan?.start_date || "";
    const planMaxDate = activePlan?.end_date || "";

    const effectiveStart = planMinDate && startDate && startDate < planMinDate ? planMinDate : startDate;
    const effectiveEnd = planMaxDate && endDate && endDate > planMaxDate ? planMaxDate : endDate;

    const datesToShow: string[] = !activePlan
        ? []
        : isRangeMode
          ? effectiveStart && effectiveEnd
              ? getDatesInRange(effectiveStart, effectiveEnd)
              : []
          : selectedDate
            ? [selectedDate]
            : [];

    const filteredFoods = foods.filter(f =>
        !foodSearch.trim() || f.name?.toLowerCase().includes(foodSearch.toLowerCase())
    );

    const handleDragStart = (e: React.DragEvent, food: Food) => {
        e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ id: food.id, name: food.name }));
        e.dataTransfer.effectAllowed = "copy";
        (e.target as HTMLElement).style.opacity = "0.5";
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = "1";
    };

    const handleDropOnDay = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove("ring-2", "ring-indigo-500", "bg-indigo-50/50", "dark:bg-indigo-900/20");

        const raw = e.dataTransfer.getData(DRAG_TYPE);
        if (!raw || !selectedPatient || !activePlan) return;
        try {
            const { id } = JSON.parse(raw);
            if (!id) return;

            const newEntry: Partial<UserMeal> = {
                user: selectedPatient.user.id,
                user_diet_plan: activePlan.id,
                meal_date: dateStr,
                meal_type: selectedMealTypeId || mealTypes[0]?.id,
                food: id,
                quantity: 1,
                packaging_material: selectedPackagingMaterialId || null,
            };
            setDailyEntries(prev => [...prev, newEntry]);
            setShowSaveButton(true);
            toast.success(`Added to ${new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`);
        } catch (_) {}
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        (e.currentTarget as HTMLElement).classList.add("ring-2", "ring-indigo-500", "bg-indigo-50/50", "dark:bg-indigo-900/20");
    };

    const handleDragLeave = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove("ring-2", "ring-indigo-500", "bg-indigo-50/50", "dark:bg-indigo-900/20");
    };

    const handleRemoveSlot = (index: number) => {
        setDailyEntries(prev => prev.filter((_, i) => i !== index));
        setShowSaveButton(true);
    };

    const handleEntryUpdate = (index: number, field: keyof UserMeal, value: any) => {
        const updated = [...dailyEntries];
        updated[index] = { ...updated[index], [field]: value };
        setDailyEntries(updated);
        setShowSaveButton(true);
    };

    const handleSave = async (specificDate?: string) => {
        const entriesToSave = specificDate
            ? dailyEntries.filter(e => e.meal_date === specificDate)
            : dailyEntries;

        if (entriesToSave.length === 0) {
            toast.warning(`Add at least one meal ${specificDate ? `for ${specificDate}` : ''} before saving`);
            return;
        }

        const isValid = entriesToSave.every(e => e.meal_type && e.food && e.quantity);
        if (!isValid) {
            toast.error("Please fill all fields for each slot");
            return;
        }

        let mealsWithPackaging = entriesToSave.map((e) => ({
            ...e,
            packaging_material: selectedPackagingMaterialId || (e.packaging_material ?? null),
        })) as UserMeal[];

        // Reassignment Restriction Check: Filter out restricted meals from the save payload
        if (activePlan?.nutritionist_effective_from && currentUserId) {
            const effectiveDate = activePlan.nutritionist_effective_from;
            const isNewNutritionist = currentUserId === activePlan.nutritionist;
            const isOriginalNutritionist = currentUserId === activePlan.original_nutritionist;

            const authorizedMeals = mealsWithPackaging.filter(meal => {
                if (isNewNutritionist && meal.meal_date < effectiveDate) return false;
                if (isOriginalNutritionist && meal.meal_date >= effectiveDate) return false;
                return true;
            });

            // If the user SPECIFICALLY requested to save a date range where they have NO authority, notify them
            if (authorizedMeals.length === 0 && mealsWithPackaging.length > 0) {
                 toast.error(`You cannot edit meals for these dates based on the effective date (${effectiveDate})`);
                 return;
            }

            mealsWithPackaging = authorizedMeals;
        }

        if (mealsWithPackaging.length === 0) {
             toast.warning(`No meals found to save.`);
             return;
        }

        setSaving(true);
        try {
            await saveBulkMeals(mealsWithPackaging);
            toast.success(`Successfully saved ${specificDate ? `schedule for ${specificDate}` : isRangeMode ? "range" : "daily"} schedule`);
            setShowSaveButton(false);
            if (selectedPatient && activePlan) {
                const planStart = activePlan.start_date || "";
                const planEnd = activePlan.end_date || "";
                loadAllScheduledMeals(selectedPatient.user.id, planStart, planEnd);
                if (isRangeMode) {
                    fetchAllMeals(selectedPatient.user.id, planStart, planEnd);
                } else {
                    fetchDailyMeals(selectedPatient.user.id, specificDate || selectedDate);
                }
            }
        } catch (err) {
            toast.error("Failed to save schedule");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-24">
            <PageMeta title="Patient Meal Scheduler" description="Personalize daily nutrition plans for your patients." />
            <PageBreadcrumb pageTitle="Daily Meal Optimization" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 max-w-[1600px] mx-auto space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Patient selector - top bar */}
                    <div className="xl:col-span-12">
                        <div className="bg-white dark:bg-gray-800 rounded-[24px] p-4 shadow-sm border border-transparent dark:border-white/[0.05] flex flex-wrap items-center gap-4">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <FiUsers size={18} className="text-indigo-500" /> Patient
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {patients.map(p => (
                                    <button
                                        key={p.user.id}
                                        onClick={() => setSelectedPatient(p)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedPatient?.user.id === p.user.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}
                                    >
                                        {p.user.first_name} {p.user.last_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Food list - LEFT SIDEBAR */}
                    <div className="xl:col-span-4 lg:col-span-4">
                        <div className="bg-white dark:bg-gray-800 rounded-[28px] p-5 shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05] sticky top-4">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                                <FiMenu className="text-indigo-500" size={16} /> Food Library
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">Drag food onto a day to add</p>

                            <div className="mb-4 space-y-2">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search foods..."
                                        value={foodSearch}
                                        onChange={(e) => setFoodSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                                <select
                                    value={selectedMealTypeId}
                                    onChange={(e) => setSelectedMealTypeId(e.target.value ? Number(e.target.value) : "")}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-xl text-sm font-medium outline-none"
                                >
                                    <option value="">All meal types</option>
                                    {mealTypes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <select
                                    value={selectedCuisineId}
                                    onChange={(e) => setSelectedCuisineId(e.target.value ? Number(e.target.value) : "")}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-xl text-sm font-medium outline-none"
                                >
                                    <option value="">All cuisines</option>
                                    {cuisines.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                                {filteredFoods.length === 0 ? (
                                    <p className="text-gray-400 text-xs font-medium py-8 text-center">No foods found</p>
                                ) : (
                                    filteredFoods.map((food) => (
                                        <div
                                            key={food.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, food)}
                                            onDragEnd={handleDragEnd}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50 group"
                                        >
                                            <FiMenu className="text-gray-300 group-hover:text-indigo-400 flex-shrink-0" size={14} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{food.name}</p>
                                            </div>
                                            {food.nutrition?.calories ? (
                                                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg">{food.nutrition.calories} kcal</span>
                                            ) : null}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main content - Day drop zones */}
                    <div className="xl:col-span-8 lg:col-span-8 space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[32px]">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400 font-bold uppercase text-xs">Loading...</p>
                            </div>
                        ) : !selectedPatient ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[32px]">
                                <FiUsers size={48} className="text-gray-300 mb-4" />
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Patients Allotted</h2>
                                <p className="text-gray-400 text-sm text-center">You haven't been assigned any patients yet.</p>
                            </div>
                        ) : selectedPatient && (
                            <>
                                {/* Plan & controls */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-[28px] border border-transparent dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                            <FiActivity size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 dark:text-white">{selectedPatient.user.first_name}'s Schedule</h2>
                                            {activePlan ? (
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1 mt-0.5">
                                                    <FiCheckCircle size={10} /> {activePlan.diet_plan_details?.title}
                                                    {activePlan.start_date && activePlan.end_date && (
                                                        <span className="text-gray-400 normal-case font-medium">
                                                            ({activePlan.start_date} → {activePlan.end_date})
                                                        </span>
                                                    )}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 mt-0.5">
                                                    <FiInfo size={10} /> No active diet plan
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reassignment Info Banner */}
                                    {selectedPatient?.reassignment_details && (
                                        <div className="w-full mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
                                            <FiInfo className="text-amber-500 mt-1 flex-shrink-0" size={18} />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                                    Nutritionist Reassigned
                                                </p>
                                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                    Reason: <span className="font-bold">{selectedPatient.reassignment_details.reason}</span>
                                                    {selectedPatient.reassignment_details.notes && (
                                                        <> — <span className="italic">{selectedPatient.reassignment_details.notes}</span></>
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase mt-2">
                                                    Switch Date: {selectedPatient.reassignment_details.effective_from}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {currentUserId === activePlan?.nutritionist 
                                                        ? "You are the new nutritionist. You can edit meals from this date onwards."
                                                        : "You were the prior nutritionist. You can edit meals before this date."
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 mt-4 w-full">
                                        <div className="flex items-center gap-2">
                                            <FiPackage className="text-indigo-500" size={14} />
                                            <select
                                                value={selectedPackagingMaterialId}
                                                onChange={(e) => setSelectedPackagingMaterialId(e.target.value ? Number(e.target.value) : "")}
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-bold outline-none min-w-[140px]"
                                                title="Packaging material for all meals"
                                            >
                                                <option value="">Packaging (all meals)</option>
                                                {packagingMaterials.map((pm) => (
                                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex p-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <button
                                                onClick={() => setIsRangeMode(false)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!isRangeMode ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >Day</button>
                                            <button
                                                onClick={() => setIsRangeMode(true)}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isRangeMode ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >Range</button>
                                        </div>
                                        {isRangeMode ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    min={planMinDate}
                                                    max={planMaxDate}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setStartDate(v);
                                                        if (endDate && v > endDate) setEndDate(v);
                                                    }}
                                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-bold outline-none"
                                                />
                                                <span className="text-gray-400">→</span>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    min={planMinDate}
                                                    max={planMaxDate}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setEndDate(v);
                                                        if (startDate && v < startDate) setStartDate(v);
                                                    }}
                                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-bold outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                min={planMinDate}
                                                max={planMaxDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-xs font-bold outline-none"
                                            />
                                        )}
                                        <button
                                            onClick={() => setViewMode("calendar")}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ${viewMode === "calendar" ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-900/50 text-gray-600"}`}
                                        >
                                            <FiCalendar size={12} /> Overview
                                        </button>
                                    </div>
                                </div>

                                {/* Hover event tooltip */}
                                <AnimatePresence>
                                    {hoveredEvent && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{ position: "fixed", left: mousePos.x + 16, top: mousePos.y + 16, zIndex: 9999 }}
                                            className="bg-white dark:bg-gray-800 border dark:border-white/10 rounded-xl p-3 shadow-2xl w-56 pointer-events-none"
                                        >
                                            <p className="text-[10px] font-black text-indigo-500 uppercase">{hoveredEvent.meal_type_details?.name}</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{hoveredEvent.food_details?.name}</p>
                                            <p className="text-[10px] text-gray-400">Qty: {hoveredEvent.quantity}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Calendar view */}
                                {viewMode === "calendar" && (
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[28px] overflow-hidden">
                                        <FullCalendar
                                            plugins={[dayGridPlugin, interactionPlugin]}
                                            initialView="dayGridMonth"
                                            headerToolbar={{ left: "prev,next", center: "title", right: "" }}
                                            events={allMeals.map(m => ({
                                                id: m.id?.toString(),
                                                title: `${m.meal_type_details?.name || 'Meal'}: ${m.food_details?.name || 'Assigned'}`,
                                                start: m.meal_date,
                                                allDay: true,
                                                extendedProps: { meal: m }
                                            }))}
                                            eventMouseEnter={(info) => {
                                                setHoveredEvent(info.event.extendedProps.meal);
                                                setMousePos({ x: info.jsEvent.clientX, y: info.jsEvent.clientY });
                                            }}
                                            eventMouseLeave={() => setHoveredEvent(null)}
                                            dateClick={(info) => { setSelectedDate(info.dateStr); setViewMode("list"); toast.info(`Managing ${info.dateStr}`); }}
                                            eventClick={(info: any) => { setSelectedDate(info.event.startStr?.split('T')[0] || selectedDate); setViewMode("list"); toast.info(`Editing ${info.event.startStr?.split('T')[0]}`); }}
                                            eventContent={(e) => (
                                                <div className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-bold truncate">{e.event.title}</div>
                                            )}
                                        />
                                    </div>
                                )}

                                {/* List view - Day drop zones */}
                                {viewMode === "list" && activePlan && (
                                    <div className="space-y-8">
                                        {datesToShow.map((dateStr) => {
                                            const dayEntries = dailyEntries.filter(e => e.meal_date === dateStr);
                                            const dateObj = new Date(dateStr);
                                            const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

                                            const isReadOnly = (() => {
                                                if (!activePlan?.nutritionist_effective_from || !currentUserId) return false;
                                                const effectiveDate = activePlan.nutritionist_effective_from;
                                                if (currentUserId === activePlan.nutritionist) {
                                                    return dateStr < effectiveDate;
                                                }
                                                if (currentUserId === activePlan.original_nutritionist) {
                                                    return dateStr >= effectiveDate;
                                                }
                                                return false;
                                            })();

                                            return (
                                                <motion.div key={dateStr} layout className={`space-y-4 ${isReadOnly ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                                                    <div
                                                        onDrop={isReadOnly ? undefined : (e) => handleDropOnDay(e, dateStr)}
                                                        onDragOver={isReadOnly ? undefined : handleDragOver}
                                                        onDragLeave={isReadOnly ? undefined : handleDragLeave}
                                                        className={`min-h-[120px] rounded-[24px] border-2 border-dashed ${isReadOnly ? 'border-gray-200 dark:border-white/5 bg-gray-100/50 dark:bg-transparent' : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-900/30'} p-6 transition-all relative`}
                                                    >
                                                        {isReadOnly && (
                                                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 backdrop-blur-none rounded-[24px]">
                                                                <span className="bg-gray-900/80 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2">
                                                                    <FiInfo size={12} /> Restricted
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg">
                                                                    {dateObj.getDate()}
                                                                </div>
                                                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{formatted}</h3>
                                                                <span className="text-[10px] text-gray-400 font-bold">Drop food here</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {dayEntries.length === 0 ? (
                                                                <p className="text-gray-400 text-xs font-medium py-4 text-center">No meals yet — drag from the left</p>
                                                            ) : (
                                                                dayEntries.map((entry) => {
                                                                    const globalIdx = dailyEntries.indexOf(entry);
                                                                    return (
                                                                        <motion.div
                                                                            key={globalIdx}
                                                                            layout
                                                                            initial={{ opacity: 0, y: 8 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm"
                                                                        >
                                                                            <div className="flex flex-wrap gap-4 items-end">
                                                                                <div className="flex-1 min-w-[120px]">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Meal Type</label>
                                                                                    <select
                                                                                        value={entry.meal_type}
                                                                                        disabled={isReadOnly}
                                                                                        onChange={(e) => handleEntryUpdate(globalIdx, 'meal_type', Number(e.target.value))}
                                                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        {mealTypes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                                                    </select>
                                                                                </div>
                                                                                <div className="flex-1 min-w-[140px]">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Food</label>
                                                                                    <select
                                                                                        value={entry.food}
                                                                                        disabled={isReadOnly}
                                                                                        onChange={(e) => handleEntryUpdate(globalIdx, 'food', Number(e.target.value))}
                                                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        <option value="">Select</option>
                                                                                        {foods.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                                                    </select>
                                                                                </div>
                                                                                <div className="w-20">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Qty</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        step="0.1"
                                                                                        value={entry.quantity ?? ''}
                                                                                        disabled={isReadOnly}
                                                                                        onChange={(e) => handleEntryUpdate(globalIdx, 'quantity', Number(e.target.value))}
                                                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                    />
                                                                                </div>
                                                                                <div className="w-32">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Packaging</label>
                                                                                    <select
                                                                                        value={entry.packaging_material || ""}
                                                                                        disabled={isReadOnly}
                                                                                        onChange={(e) => handleEntryUpdate(globalIdx, 'packaging_material', e.target.value ? Number(e.target.value) : null)}
                                                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        <option value="">None</option>
                                                                                        {packagingMaterials.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                                                                                    </select>
                                                                                </div>
                                                                                <button 
                                                                                    onClick={() => handleRemoveSlot(globalIdx)} 
                                                                                    disabled={isReadOnly}
                                                                                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                                                >
                                                                                    <FiTrash2 size={18} />
                                                                                </button>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Notes (optional)"
                                                                                value={entry.notes || ''}
                                                                                disabled={isReadOnly}
                                                                                onChange={(e) => handleEntryUpdate(globalIdx, 'notes', e.target.value)}
                                                                                className="mt-3 w-full text-xs font-medium bg-transparent border-b border-gray-100 dark:border-white/5 px-2 py-1 outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            />
                                                                        </motion.div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Save Button - appears on hover / when there are unsaved changes */}
            <AnimatePresence>
                {(showSaveButton || dailyEntries.length > 0) && viewMode === "list" && activePlan && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                    >
                        <button
                            onClick={() => handleSave()}
                            disabled={saving || dailyEntries.length === 0}
                            className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/50 hover:scale-105 active:scale-100 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            <FiSave size={20} className="group-hover:rotate-12 transition-transform" />
                            {saving ? "Saving..." : "Save Schedule"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SetDailyMealsPage;
