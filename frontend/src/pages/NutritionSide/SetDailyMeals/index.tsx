import React, { useCallback, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
    getSetDailyMealsPatients,
    getActivePlansForPatient,
    getUserDailyMeals,
    saveBulkMeals,
    getSetDailyMealsFilterOptions,
    getSetDailyMealsFoods,
    getSetDailyMealsPatientDetail,
    getSetDailyMealsPlanMeals,
    getSetDailyMealsCalendarMonth,
    getPackagingMaterialList,
    getFoodByIdNutrition,
} from "./api";
import type {
    MappedPatientResponse,
    UserDietPlan,
    UserMeal,
    MealType,
    Food,
    CuisineType,
    FoodNutritionById,
} from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUsers, FiSave, FiCalendar, FiActivity, FiTrash2, FiInfo, FiCheckCircle, FiMenu, FiSearch, FiPackage, FiMapPin, FiEye, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const DRAG_TYPE = "food-item";

const SetDailyMealsPage: React.FC = () => {
    const todayStr = new Date().toISOString().split("T")[0];
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

    const [patientSearchInput, setPatientSearchInput] = useState("");
    const [debouncedPatientSearch, setDebouncedPatientSearch] = useState("");
    const [patientPage, setPatientPage] = useState(1);
    const [patientTotalPages, setPatientTotalPages] = useState(1);
    const [patientCount, setPatientCount] = useState(0);
    const [patientListLoading, setPatientListLoading] = useState(true);
    const [detailOpen, setDetailOpen] = useState(false);
    const [patientDetail, setPatientDetail] = useState<Awaited<ReturnType<typeof getSetDailyMealsPatientDetail>> | null>(null);
    const [patientDetailLoading, setPatientDetailLoading] = useState(false);

    const [mtPage, setMtPage] = useState(1);
    const [cuPage, setCuPage] = useState(1);
    const [mtHasMore, setMtHasMore] = useState(true);
    const [cuHasMore, setCuHasMore] = useState(true);

    const [foodsPage, setFoodsPage] = useState(1);
    const [foodsHasMore, setFoodsHasMore] = useState(true);
    const [foodsLoading, setFoodsLoading] = useState(false);

    const [rangeMealsAccum, setRangeMealsAccum] = useState<UserMeal[]>([]);
    const [rangeDayCount, setRangeDayCount] = useState(10);
    const [rangeHasMore, setRangeHasMore] = useState(false);
    const [rangeMealsLoading, setRangeMealsLoading] = useState(false);

    const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1);
    const [calYear, setCalYear] = useState(() => new Date().getFullYear());
    const [calendarMonthMeals, setCalendarMonthMeals] = useState<UserMeal[]>([]);
    const [foodNutritionOpen, setFoodNutritionOpen] = useState(false);
    const [foodNutritionLoading, setFoodNutritionLoading] = useState(false);
    const [foodNutrition, setFoodNutrition] = useState<FoodNutritionById | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            try {
                const decoded = jwtDecode<{ user_id?: number; sub?: number }>(token);
                setCurrentUserId(decoded.user_id ?? decoded.sub ?? null);
            } catch {
                /* invalid token */
            }
        }
    }, []);

    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedPatientSearch(patientSearchInput.trim()), 300);
        return () => window.clearTimeout(t);
    }, [patientSearchInput]);

    useEffect(() => {
        setPatientPage(1);
    }, [debouncedPatientSearch]);

    const loadPatients = useCallback(async () => {
        setPatientListLoading(true);
        try {
            const res = await getSetDailyMealsPatients({
                page: patientPage,
                page_size: 5,
                search: debouncedPatientSearch || undefined,
            });
            setPatients(res.results);
            setPatientCount(res.count);
            setPatientTotalPages(res.total_pages);
            setSelectedPatient((prev) => {
                if (prev && res.results.some((r) => r.user.id === prev.user.id)) return prev;
                return null;
            });
        } catch {
            toast.error("Failed to load patients");
        } finally {
            setPatientListLoading(false);
        }
    }, [patientPage, debouncedPatientSearch]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    useEffect(() => {
        const loadPkg = async () => {
            try {
                const raw = await getPackagingMaterialList(1, "all");
                const pkgRes = Array.isArray(raw)
                    ? raw
                    : (raw as { results?: { id: number; name: string }[] })?.results ?? [];
                setPackagingMaterials(Array.isArray(pkgRes) ? pkgRes : []);
            } catch {
                /* ignore */
            }
        };
        loadPkg();
    }, []);

    useEffect(() => {
        setMtPage(1);
        setCuPage(1);
    }, [selectedMealTypeId, selectedCuisineId]);

    useEffect(() => {
        const loadMt = async () => {
            try {
                const fo = await getSetDailyMealsFilterOptions({
                    limit: 5,
                    meal_types_page: mtPage,
                    cuisines_page: 1,
                    meal_type_id: selectedMealTypeId || "",
                    cuisine_id: selectedCuisineId || "",
                });
                setMealTypes((prev) =>
                    mtPage === 1 ? (fo.meal_types.results as MealType[]) : [...prev, ...(fo.meal_types.results as MealType[])]
                );
                setMtHasMore(!!fo.meal_types.next);
            } catch {
                /* ignore */
            }
        };
        loadMt();
    }, [mtPage, selectedMealTypeId, selectedCuisineId]);

    useEffect(() => {
        const loadCu = async () => {
            try {
                const fo = await getSetDailyMealsFilterOptions({
                    limit: 5,
                    meal_types_page: 1,
                    cuisines_page: cuPage,
                    meal_type_id: selectedMealTypeId || "",
                    cuisine_id: selectedCuisineId || "",
                });
                setCuisines((prev) =>
                    cuPage === 1 ? (fo.cuisine_types.results as CuisineType[]) : [...prev, ...(fo.cuisine_types.results as CuisineType[])]
                );
                setCuHasMore(!!fo.cuisine_types.next);
            } catch {
                /* ignore */
            }
        };
        loadCu();
    }, [cuPage, selectedMealTypeId, selectedCuisineId]);

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
                        // Default to today if it's within the plan range, or if the plan started in the past
                        // If plan starts in future, use planStart. If plan ended in past, use planEnd.
                        if (inRange) {
                            setSelectedDate(today);
                        } else if (planStart > today) {
                            setSelectedDate(planStart);
                        } else {
                            setSelectedDate(planEnd);
                        }
                    } else {
                        setStartDate("");
                        setEndDate("");
                        setSelectedDate("");
                        setDailyEntries([]);
                    }
                } catch {
                    toast.error("Failed to load patient plans");
                }
            };
            loadPatientData();
        } else {
            setActivePlan(null);
            setStartDate("");
            setEndDate("");
            setSelectedDate("");
            setDailyEntries([]);
            setRangeMealsAccum([]);
            setRangeDayCount(10);
            setRangeHasMore(false);
        }
    }, [selectedPatient]);

    useEffect(() => {
        if (selectedPatient && activePlan) {
            if (isRangeMode) {
                setRangeDayCount(10);
                setRangeMealsLoading(true);
                (async () => {
                    try {
                        const res = await getSetDailyMealsPlanMeals({
                            user_id: selectedPatient.user.id,
                            plan_id: activePlan.id,
                            offset_days: 0,
                            days: 10,
                        });
                        setRangeMealsAccum(res.meals);
                        setRangeHasMore(res.has_more);
                    } catch {
                        toast.error("Failed to load range meals");
                    } finally {
                        setRangeMealsLoading(false);
                    }
                })();
            } else if (selectedDate) {
                fetchDailyMeals(selectedPatient.user.id, selectedDate);
            }
        }
    }, [selectedPatient, activePlan, selectedDate, isRangeMode, startDate, endDate]);

    const fetchDailyMeals = async (pid: number, date: string) => {
        try {
            const meals = await getUserDailyMeals(pid, date);
            setDailyEntries(meals);
        } catch {
            toast.error("Failed to load daily schedule");
        }
    };

    const loadMoreRangeMeals = async () => {
        if (!selectedPatient || !activePlan || !rangeHasMore || rangeMealsLoading) return;
        setRangeMealsLoading(true);
        try {
            const res = await getSetDailyMealsPlanMeals({
                user_id: selectedPatient.user.id,
                plan_id: activePlan.id,
                offset_days: rangeDayCount,
                days: 10,
            });
            setRangeMealsAccum((prev) => [...prev, ...res.meals]);
            setRangeHasMore(res.has_more);
            setRangeDayCount((c) => c + 10);
        } catch {
            toast.error("Failed to load more days");
        } finally {
            setRangeMealsLoading(false);
        }
    };

    useEffect(() => {
        setFoodsPage(1);
    }, [foodSearch, selectedMealTypeId, selectedCuisineId]);

    useEffect(() => {
        const runFoods = async () => {
            setFoodsLoading(true);
            try {
                const res = await getSetDailyMealsFoods({
                    page: foodsPage,
                    limit: 20,
                    search: foodSearch,
                    meal_type: selectedMealTypeId || "",
                    cuisine_type: selectedCuisineId || "",
                });
                setFoods((prev) => (foodsPage === 1 ? res.results : [...prev, ...res.results]));
                setFoodsHasMore(!!res.next);
            } catch {
                /* ignore */
            } finally {
                setFoodsLoading(false);
            }
        };
        runFoods();
    }, [foodsPage, foodSearch, selectedMealTypeId, selectedCuisineId]);

    useEffect(() => {
        if (viewMode !== "calendar" || !selectedPatient || !activePlan) return;
        (async () => {
            try {
                const res = await getSetDailyMealsCalendarMonth({
                    user_id: selectedPatient.user.id,
                    plan_id: activePlan.id,
                    month: calMonth,
                    year: calYear,
                });
                setCalendarMonthMeals(res.meals);
            } catch {
                setCalendarMonthMeals([]);
            }
        })();
    }, [viewMode, selectedPatient, activePlan, calMonth, calYear]);

    useEffect(() => {
        if (isRangeMode) {
            setDailyEntries(rangeMealsAccum);
        }
    }, [isRangeMode, rangeMealsAccum]);

    const getDatesInRange = (start: string, end: string) => {
        const dates: string[] = [];
        const last = new Date(end);
        const d = new Date(start);
        while (d <= last) {
            dates.push(d.toISOString().split("T")[0]);
            d.setDate(d.getDate() + 1);
        }
        return dates;
    };

    const planMinDate = activePlan?.start_date || "";
    const planMaxDate = activePlan?.end_date || "";

    const effectiveStart = planMinDate && startDate && startDate < planMinDate ? planMinDate : startDate;
    const effectiveEnd = planMaxDate && endDate && endDate > planMaxDate ? planMaxDate : endDate;

    const fullRangeDates =
        effectiveStart && effectiveEnd ? getDatesInRange(effectiveStart, effectiveEnd) : [];

    const datesToShow: string[] = !activePlan
        ? []
        : isRangeMode
          ? fullRangeDates.slice(0, Math.min(rangeDayCount, fullRangeDates.length))
          : selectedDate
            ? [selectedDate]
            : [];

    const filteredFoods = foods;

    const openPatientDetail = async () => {
        if (!selectedPatient) return;
        setDetailOpen(true);
        setPatientDetailLoading(true);
        try {
            const d = await getSetDailyMealsPatientDetail(selectedPatient.user.id);
            setPatientDetail(d);
        } catch {
            toast.error("Failed to load patient details");
            setPatientDetail(null);
        } finally {
            setPatientDetailLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, food: Food) => {
        e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ id: food.id, name: food.name }));
        e.dataTransfer.effectAllowed = "copy";
        (e.target as HTMLElement).style.opacity = "0.5";
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = "1";
    };

    const openFoodNutrition = async (foodId: number) => {
        setFoodNutritionOpen(true);
        setFoodNutritionLoading(true);
        setFoodNutrition(null);
        try {
            const data = await getFoodByIdNutrition(foodId);
            setFoodNutrition(data);
        } catch {
            toast.error("Failed to load food nutrition");
        } finally {
            setFoodNutritionLoading(false);
        }
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
        } catch {
            /* ignore */
        }
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

    const handleEntryUpdate = (index: number, field: keyof UserMeal, value: unknown) => {
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

        // Reassignment & Date Restriction Check: Filter out restricted meals from the save payload
        if (currentUserId) {
            const effectiveDate = activePlan?.nutritionist_effective_from;
            const isNewNutritionist = activePlan && currentUserId === activePlan.nutritionist;
            const isOriginalNutritionist = activePlan && currentUserId === activePlan.original_nutritionist;

            const authorizedMeals = mealsWithPackaging.filter(meal => {
                // Past date restriction
                if (meal.meal_date && meal.meal_date < todayStr) return false;

                // Reassignment restriction
                if (effectiveDate) {
                    if (isNewNutritionist && meal.meal_date < effectiveDate) return false;
                    if (isOriginalNutritionist && meal.meal_date >= effectiveDate) return false;
                }
                return true;
            });

            // If the user SPECIFICALLY requested to save a date range where they have NO authority, notify them
            if (authorizedMeals.length === 0 && mealsWithPackaging.length > 0) {
                 toast.error(`You cannot edit meals for past dates or restricted dates.`);
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
                if (isRangeMode) {
                    setRangeDayCount(10);
                    try {
                        const res = await getSetDailyMealsPlanMeals({
                            user_id: selectedPatient.user.id,
                            plan_id: activePlan.id,
                            offset_days: 0,
                            days: 10,
                        });
                        setRangeMealsAccum(res.meals);
                        setRangeHasMore(res.has_more);
                    } catch {
                        /* ignore */
                    }
                } else {
                    fetchDailyMeals(selectedPatient.user.id, specificDate || selectedDate);
                }
            }
        } catch {
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
                        <div className="bg-white dark:bg-gray-800 rounded-[24px] p-4 shadow-sm border border-transparent dark:border-white/[0.05] flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-3 justify-between">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <FiUsers size={18} className="text-indigo-500" /> Patient
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="search"
                                            value={patientSearchInput}
                                            onChange={(e) => setPatientSearchInput(e.target.value)}
                                            placeholder="Search patients…"
                                            className="pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-xs font-medium outline-none w-48 md:w-64"
                                        />
                                    </div>
                                    {selectedPatient && (
                                        <button
                                            type="button"
                                            onClick={openPatientDetail}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                            title="Questionnaire & kitchen & today’s meals"
                                        >
                                            <FiEye size={16} /> Details
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                {patientListLoading ? (
                                    <span className="text-xs text-gray-400 font-bold">Loading patients…</span>
                                ) : (
                                    patients.map((p) => (
                                        <button
                                            key={p.user.id}
                                            type="button"
                                            onClick={() => setSelectedPatient(p)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                selectedPatient?.user.id === p.user.id
                                                    ? "bg-indigo-600 text-white shadow-lg"
                                                    : "bg-gray-50 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                            }`}
                                        >
                                            {p.user.first_name} {p.user.last_name}
                                            {p.active_kitchen?.current_kitchen && (
                                                <span
                                                    className={`ml-2 text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                                                        selectedPatient?.user.id === p.user.id
                                                            ? "bg-white/20 text-white"
                                                            : "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500"
                                                    }`}
                                                >
                                                    {p.active_kitchen.current_kitchen}
                                                </span>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                            {patientCount > 0 && (
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold text-gray-400">
                                        Page {patientPage} / {patientTotalPages} · {patientCount} patients
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={patientPage <= 1}
                                            onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
                                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
                                        >
                                            <FiChevronLeft size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={patientPage >= patientTotalPages}
                                            onClick={() => setPatientPage((p) => p + 1)}
                                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
                                        >
                                            <FiChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                <div className="flex gap-2 justify-between">
                                    <button
                                        type="button"
                                        className="text-[10px] font-black uppercase text-indigo-600"
                                        disabled={!mtHasMore}
                                        onClick={() => setMtPage((p) => p + 1)}
                                    >
                                        + Meal types
                                    </button>
                                    <button
                                        type="button"
                                        className="text-[10px] font-black uppercase text-indigo-600"
                                        disabled={!cuHasMore}
                                        onClick={() => setCuPage((p) => p + 1)}
                                    >
                                        + Cuisines
                                    </button>
                                </div>
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
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (typeof food.id !== "number") return;
                                                    openFoodNutrition(food.id);
                                                }}
                                                className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                                title="View nutrition"
                                            >
                                                <FiEye size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                                {foodsLoading && <p className="text-center text-[10px] text-gray-400 py-2">Loading foods…</p>}
                                {foodsHasMore && !foodsLoading && (
                                    <button
                                        type="button"
                                        onClick={() => setFoodsPage((p) => p + 1)}
                                        className="w-full py-2 text-[10px] font-black uppercase text-indigo-600"
                                    >
                                        Load more foods
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main content - Day drop zones */}
                    <div className="xl:col-span-8 lg:col-span-8 space-y-6">
                        {patientListLoading && patients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[32px]">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400 font-bold uppercase text-xs">Loading...</p>
                            </div>
                        ) : !patientListLoading && patients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[32px]">
                                <FiUsers size={48} className="text-gray-300 mb-4" />
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Patients Allotted</h2>
                                <p className="text-gray-400 text-sm text-center">You haven&apos;t been assigned any patients yet.</p>
                            </div>
                        ) : !selectedPatient ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
                                <FiUsers size={48} className="text-indigo-300 dark:text-indigo-800 mb-4" />
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Select a patient</h2>
                                <p className="text-gray-400 text-sm text-center max-w-md">
                                    Choose a patient above to load their diet plan and schedule meals. Nothing is loaded until you click a name.
                                </p>
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
                                                    {activePlan.micro_kitchen_details?.brand_name && (
                                                        <span className="text-indigo-500 ml-2 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                            <FiMapPin size={10} /> {activePlan.micro_kitchen_details.brand_name}
                                                        </span>
                                                    )}
                                                    {activePlan.start_date && activePlan.end_date && (
                                                        <span className="text-gray-400 normal-case font-medium ml-1">
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
                                                    min={planMinDate > todayStr ? planMinDate : todayStr}
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
                                                    min={planMinDate > todayStr ? planMinDate : todayStr}
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
                                                min={planMinDate > todayStr ? planMinDate : todayStr}
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
                                            datesSet={(arg) => {
                                                const d = new Date(arg.start);
                                                d.setDate(15);
                                                setCalMonth(d.getMonth() + 1);
                                                setCalYear(d.getFullYear());
                                            }}
                                            events={calendarMonthMeals.map((m) => ({
                                                id: m.id?.toString(),
                                                title: `${m.meal_type_details?.name || "Meal"}: ${m.food_details?.name || "Assigned"}`,
                                                start: m.meal_date as string,
                                                allDay: true,
                                                extendedProps: { meal: m },
                                            }))}
                                            eventMouseEnter={(info) => {
                                                setHoveredEvent(info.event.extendedProps.meal);
                                                setMousePos({ x: info.jsEvent.clientX, y: info.jsEvent.clientY });
                                            }}
                                            eventMouseLeave={() => setHoveredEvent(null)}
                                            dateClick={(info) => { setSelectedDate(info.dateStr); setViewMode("list"); toast.info(`Managing ${info.dateStr}`); }}
                                            eventClick={(info: EventClickArg) => {
                                                const ds = info.event.startStr?.split("T")[0] || selectedDate;
                                                setSelectedDate(ds);
                                                setViewMode("list");
                                                toast.info(`Editing ${ds}`);
                                            }}
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
                                                if (dateStr < todayStr) return true;
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
                                                                {activePlan && (
                                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full text-[8px] font-black uppercase tracking-tighter border border-indigo-100 dark:border-indigo-500/20">
                                                                        <FiMapPin size={10} /> 
                                                                        {(() => {
                                                                            const dayStr = dateStr;
                                                                            const switchDate = activePlan.micro_kitchen_effective_from;
                                                                            if (switchDate && dayStr < switchDate && activePlan.original_micro_kitchen_details) {
                                                                                return activePlan.original_micro_kitchen_details.brand_name;
                                                                            }
                                                                            return activePlan.micro_kitchen_details?.brand_name || 'No Kitchen';
                                                                        })()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {dayEntries.length === 0 ? (
                                                                <p className="text-gray-400 text-xs font-medium py-4 text-center">No meals yet — drag from the left</p>
                                                            ) : (
                                                                dayEntries.map((entry) => {
                                                                    const globalIdx = dailyEntries.indexOf(entry);
                                                                    const mealTypeName =
                                                                        entry.meal_type_details?.name ||
                                                                        mealTypes.find((m) => m.id === entry.meal_type)?.name ||
                                                                        "Meal";
                                                                    const foodName =
                                                                        entry.food_details?.name ||
                                                                        foods.find((f) => f.id === entry.food)?.name ||
                                                                        "Food";
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
                                                                                    <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm font-bold">
                                                                                        {mealTypeName}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-1 min-w-[140px]">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Food</label>
                                                                                    <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm font-bold">
                                                                                        {foodName}
                                                                                    </div>
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
                                        {isRangeMode && rangeHasMore && (
                                            <div className="flex justify-center pt-6">
                                                <button
                                                    type="button"
                                                    onClick={loadMoreRangeMeals}
                                                    disabled={rangeMealsLoading}
                                                    className="px-6 py-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase disabled:opacity-50"
                                                >
                                                    {rangeMealsLoading ? "Loading…" : "Load next 10 days"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {foodNutritionOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50"
                        onClick={() => setFoodNutritionOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="bg-white dark:bg-gray-900 rounded-[24px] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                    {foodNutrition?.food_name || "Food nutrition"}
                                </h3>
                                <button type="button" onClick={() => setFoodNutritionOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <FiX size={20} />
                                </button>
                            </div>
                            {foodNutritionLoading ? (
                                <p className="text-gray-500 text-sm">Loading...</p>
                            ) : foodNutrition ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Serving Size:</span> <span className="font-bold">{foodNutrition.serving_size || "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Calories:</span> <span className="font-bold">{foodNutrition.calories ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Protein:</span> <span className="font-bold">{foodNutrition.protein ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Carbs:</span> <span className="font-bold">{foodNutrition.carbs ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Fat:</span> <span className="font-bold">{foodNutrition.fat ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Fiber:</span> <span className="font-bold">{foodNutrition.fiber ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Sugar:</span> <span className="font-bold">{foodNutrition.sugar ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Saturated Fat:</span> <span className="font-bold">{foodNutrition.saturated_fat ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Trans Fat:</span> <span className="font-bold">{foodNutrition.trans_fat ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Sodium:</span> <span className="font-bold">{foodNutrition.sodium ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Potassium:</span> <span className="font-bold">{foodNutrition.potassium ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Calcium:</span> <span className="font-bold">{foodNutrition.calcium ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Iron:</span> <span className="font-bold">{foodNutrition.iron ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Vitamin A:</span> <span className="font-bold">{foodNutrition.vitamin_a ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Vitamin C:</span> <span className="font-bold">{foodNutrition.vitamin_c ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Vitamin D:</span> <span className="font-bold">{foodNutrition.vitamin_d ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Vitamin B12:</span> <span className="font-bold">{foodNutrition.vitamin_b12 ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Cholesterol:</span> <span className="font-bold">{foodNutrition.cholesterol ?? "-"}</span></div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3"><span className="text-gray-500">Glycemic Index:</span> <span className="font-bold">{foodNutrition.glycemic_index ?? "-"}</span></div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No nutrition data</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {detailOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
                        onClick={() => setDetailOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="bg-white dark:bg-gray-900 rounded-[28px] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">Patient details</h3>
                                <button type="button" onClick={() => setDetailOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <FiX size={20} />
                                </button>
                            </div>
                            {patientDetailLoading ? (
                                <p className="text-gray-500 text-sm">Loading…</p>
                            ) : patientDetail ? (
                                <div className="space-y-6 text-sm">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Kitchen</p>
                                        <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                                            {JSON.stringify(patientDetail.kitchen, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Questionnaire</p>
                                        <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                                            {JSON.stringify(patientDetail.questionnaire, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Today&apos;s meals</p>
                                        <p className="text-xs text-gray-500 mt-1">{patientDetail.today_food?.length ?? 0} meal(s)</p>
                                        <ul className="mt-2 space-y-2">
                                            {(patientDetail.today_food || []).map((m) => (
                                                <li key={m.id ?? `${m.meal_date}-${m.meal_type}`} className="text-xs border border-gray-100 dark:border-white/10 rounded-lg p-2">
                                                    {m.meal_type_details?.name} — {m.food_details?.name} ({m.meal_date})
                                                    {m.micro_kitchen_details?.brand_name && (
                                                        <span className="text-indigo-500 ml-2">· {m.micro_kitchen_details.brand_name}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No data</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
