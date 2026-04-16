import React, { useEffect, useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import {
    getKitchenPatients,
    getKitchenMeals,
    getKitchenMealsMonthly,
    assignMealDelivery,
    bulkAssignDelivery,
} from "./api";
import type { DailyMeal, KitchenPatient } from "./api";
import type { DeliveryFeedback } from "../../NonPatient/orderapi";
import { getMicroKitchenUserMealDeliveryFeedback } from "../../NonPatient/orderapi";
import { fetchPlanDeliveryAssignments, fetchSupplyChainUsers } from "../DeliveryManagement/api";
import type { PlanDeliveryAssignment, SupplyChainUser } from "../DeliveryManagement/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiClock, FiSearch, FiTruck, FiCheckCircle, FiUser, FiInfo, FiHash, FiFilter, FiCalendar, FiX, FiPackage, FiPlusCircle, FiStar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { GiCookingPot, GiBowlOfRice, GiHamburger, GiBreadSlice } from "react-icons/gi";

// Custom Form Components
import DatePicker2 from "../../../components/form/date-picker2";
import Select from "../../../components/form/Select";

const getMediaUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

const formatDeliveryPersonName = (m: DailyMeal): string | null => {
    const d = m.delivery_person_details;
    if (!d) return null;
    const name = `${d.first_name || ""} ${d.last_name || ""}`.trim();
    return name || null;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Build assignable rows from global plan (per-slot persons + legacy single person). */
function globalDeliveryOptions(plan: PlanDeliveryAssignment | undefined): Array<{
    key: string;
    label: string;
    personId: number;
    slotId: number | null;
}> {
    if (!plan) return [];
    const out: Array<{ key: string; label: string; personId: number; slotId: number | null }> = [];
    const rows = plan.slot_delivery_assignments;
    if (rows?.length) {
        for (const r of rows) {
            if (r.delivery_person_id == null) continue;
            const pn = r.delivery_person_details
                ? `${r.delivery_person_details.first_name || ""} ${r.delivery_person_details.last_name || ""}`.trim()
                : `Person #${r.delivery_person_id}`;
            const sn = r.delivery_slot_details?.name ?? `Slot ${r.delivery_slot_id}`;
            out.push({
                key: `slot-${r.delivery_slot_id}-${r.delivery_person_id}`,
                label: `${pn} — ${sn}`,
                personId: r.delivery_person_id,
                slotId: r.delivery_slot_id,
            });
        }
    }
    if (out.length === 0 && plan.delivery_person != null) {
        const pn = plan.delivery_person_details
            ? `${plan.delivery_person_details.first_name || ""} ${plan.delivery_person_details.last_name || ""}`.trim()
            : `Person #${plan.delivery_person}`;
        const sn = plan.default_slot_details?.name ?? (plan.default_slot != null ? `Slot ${plan.default_slot}` : "Default slot");
        out.push({
            key: `legacy-${plan.delivery_person}`,
            label: `${pn} — ${sn}`,
            personId: plan.delivery_person,
            slotId: plan.default_slot ?? null,
        });
    }
    return out;
}

const MealsBasedOnDailyPage: React.FC = () => {
    const [meals, setMeals] = useState<DailyMeal[]>([]);
    const [deliveryFeedbackByMealId, setDeliveryFeedbackByMealId] = useState<Record<number, DeliveryFeedback[]>>({});
    const [feedbackLoadingMealId, setFeedbackLoadingMealId] = useState<number | null>(null);
    const [patients, setPatients] = useState<KitchenPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filters
    const [selectedPatient, setSelectedPatient] = useState<string>("all");
    const [rangeType, setRangeType] = useState<string>("today");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    // Calendar modal - monthly view of all meals
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMeals, setCalendarMeals] = useState<DailyMeal[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const lastFetchedMonthRef = useRef<string | null>(null);

    const [planAssignments, setPlanAssignments] = useState<PlanDeliveryAssignment[]>([]);
    const [supplyUsers, setSupplyUsers] = useState<SupplyChainUser[]>([]);
    const [assignContextLoading, setAssignContextLoading] = useState(false);

    const [assignModalMeal, setAssignModalMeal] = useState<DailyMeal | null>(null);
    const [assignSaving, setAssignSaving] = useState(false);
    const [manualSupplyPersonId, setManualSupplyPersonId] = useState<string>("");

    const [bulkPersonId, setBulkPersonId] = useState<string>("");
    const [bulkOnlyUnassigned, setBulkOnlyUnassigned] = useState(true);
    const [bulkSaving, setBulkSaving] = useState(false);

    const loadMealFeedback = async (mealId: number) => {
        if (deliveryFeedbackByMealId[mealId]) return;
        setFeedbackLoadingMealId(mealId);
        try {
            const feedbacks = await getMicroKitchenUserMealDeliveryFeedback(mealId);
            setDeliveryFeedbackByMealId((prev) => ({ ...prev, [mealId]: feedbacks }));
        } catch {
            setDeliveryFeedbackByMealId((prev) => ({ ...prev, [mealId]: [] }));
        } finally {
            setFeedbackLoadingMealId(null);
        }
    };

    const fetchPatients = async () => {
        try {
            const data = await getKitchenPatients();
            setPatients(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load patients");
        }
    };

    const getDateRange = () => {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
        const d = new Date();
        const day = d.getDay();
        const startThisWeek = new Date(d);
        startThisWeek.setDate(d.getDate() - day);
        const endThisWeek = new Date(startThisWeek);
        endThisWeek.setDate(startThisWeek.getDate() + 6);
        const startNextWeek = new Date(startThisWeek);
        startNextWeek.setDate(startThisWeek.getDate() + 7);
        const endNextWeek = new Date(startNextWeek);
        endNextWeek.setDate(startNextWeek.getDate() + 6);
        const y = d.getFullYear();
        const m = d.getMonth();
        const lastDay = new Date(y, m + 1, 0).getDate();
        const thisMonthStart = `${y}-${pad2(m + 1)}-01`;
        const thisMonthEnd = `${y}-${pad2(m + 1)}-${pad2(lastDay)}`;
        return {
            today,
            tomorrow,
            thisWeekStart: startThisWeek.toISOString().split("T")[0],
            thisWeekEnd: endThisWeek.toISOString().split("T")[0],
            nextWeekStart: startNextWeek.toISOString().split("T")[0],
            nextWeekEnd: endNextWeek.toISOString().split("T")[0],
            thisMonthStart,
            thisMonthEnd,
        };
    };

    /** Same date window as the meal list (for bulk assign). */
    const getBulkWindowDates = (): { start_date: string; end_date: string } | null => {
        const range = getDateRange();
        if (rangeType === "today") return { start_date: range.today, end_date: range.today };
        if (rangeType === "tomorrow") return { start_date: range.tomorrow, end_date: range.tomorrow };
        if (rangeType === "this_week") return { start_date: range.thisWeekStart, end_date: range.thisWeekEnd };
        if (rangeType === "next_week") return { start_date: range.nextWeekStart, end_date: range.nextWeekEnd };
        if (rangeType === "this_month") return { start_date: range.thisMonthStart, end_date: range.thisMonthEnd };
        if (rangeType === "custom" && customStart && customEnd) return { start_date: customStart, end_date: customEnd };
        return null;
    };

    const fetchAssignContext = async () => {
        setAssignContextLoading(true);
        try {
            const [plans, users] = await Promise.all([fetchPlanDeliveryAssignments(), fetchSupplyChainUsers()]);
            setPlanAssignments(plans);
            setSupplyUsers(users);
        } catch (e) {
            console.error(e);
            toast.error("Could not load delivery assignment options");
        } finally {
            setAssignContextLoading(false);
        }
    };

    const fetchDailyMeals = async () => {
        setLoading(true);
        try {
            const range = getDateRange();
            let params: { user?: string; meal_date?: string; start_date?: string; end_date?: string } = {};
            if (selectedPatient !== "all") params.user = selectedPatient;

            if (rangeType === "today") {
                params.meal_date = range.today;
            } else if (rangeType === "tomorrow") {
                params.meal_date = range.tomorrow;
            } else if (rangeType === "this_week") {
                params.start_date = range.thisWeekStart;
                params.end_date = range.thisWeekEnd;
            } else if (rangeType === "next_week") {
                params.start_date = range.nextWeekStart;
                params.end_date = range.nextWeekEnd;
            } else if (rangeType === "this_month") {
                params.start_date = range.thisMonthStart;
                params.end_date = range.thisMonthEnd;
            } else if (rangeType === "custom" && customStart && customEnd) {
                params.start_date = customStart;
                params.end_date = customEnd;
            }

            const data = await getKitchenMeals(params);
            setMeals(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load prep schedule");
        } finally {
            setLoading(false);
        }
    };

    const fetchCalendarMeals = useCallback(async (year: number, month: number, skipIfSame = false) => {
        const key = `${year}-${month}`;
        if (skipIfSame && lastFetchedMonthRef.current === key) return;

        lastFetchedMonthRef.current = key;
        setCalendarLoading(true);
        try {
            const data = await getKitchenMealsMonthly(year, month, selectedPatient !== "all" ? selectedPatient : undefined);
            setCalendarMeals(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load calendar meals");
        } finally {
            setCalendarLoading(false);
        }
    }, [selectedPatient]);

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        fetchAssignContext();
    }, []);

    useEffect(() => {
        fetchDailyMeals();
    }, [rangeType, selectedPatient, customStart, customEnd]);

    useEffect(() => {
        if (assignModalMeal) setManualSupplyPersonId("");
    }, [assignModalMeal]);

    const handleAssignFromGlobal = async (
        meal: DailyMeal,
        personId: number,
        slotId: number | null
    ) => {
        setAssignSaving(true);
        try {
            const payload: { delivery_person_id: number; delivery_slot_id?: number | null; reason?: string } = {
                delivery_person_id: personId,
                reason: "Global plan pick",
            };
            if (slotId != null) payload.delivery_slot_id = slotId;
            const updated = await assignMealDelivery(meal.id, payload);
            setMeals((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setAssignModalMeal(null);
            toast.success("Delivery assigned");
        } catch (e) {
            console.error(e);
            toast.error("Could not assign delivery");
        } finally {
            setAssignSaving(false);
        }
    };

    const handleAssignManualSupply = async (meal: DailyMeal) => {
        const id = parseInt(manualSupplyPersonId, 10);
        if (!Number.isFinite(id)) {
            toast.error("Select a supply chain person");
            return;
        }
        setAssignSaving(true);
        try {
            const updated = await assignMealDelivery(meal.id, {
                delivery_person_id: id,
                reason: "Kitchen manual assign",
            });
            setMeals((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setAssignModalMeal(null);
            toast.success("Delivery assigned");
        } catch (e) {
            console.error(e);
            toast.error("Could not assign delivery");
        } finally {
            setAssignSaving(false);
        }
    };

    const handleBulkAssign = async () => {
        const win = getBulkWindowDates();
        const pid = parseInt(bulkPersonId, 10);
        if (!win) {
            toast.error("Choose a valid date window (complete custom range if needed)");
            return;
        }
        if (!Number.isFinite(pid)) {
            toast.error("Select a supply chain person");
            return;
        }
        setBulkSaving(true);
        try {
            const res = await bulkAssignDelivery({
                start_date: win.start_date,
                end_date: win.end_date,
                delivery_person_id: pid,
                ...(selectedPatient !== "all" ? { user: selectedPatient } : {}),
                only_unassigned: bulkOnlyUnassigned,
            });
            toast.success(`Updated ${res.updated} meal delivery row(s)`);
            await fetchDailyMeals();
        } catch (e) {
            console.error(e);
            toast.error("Bulk assign failed");
        } finally {
            setBulkSaving(false);
        }
    };

    const filteredMeals = meals.filter(m => {
        const q = searchTerm.toLowerCase();
        const deliveryName = formatDeliveryPersonName(m)?.toLowerCase() ?? "";
        return (
            `${m.user_details.first_name} ${m.user_details.last_name}`.toLowerCase().includes(q) ||
            m.food_details.name.toLowerCase().includes(q) ||
            m.meal_type_details.name.toLowerCase().includes(q) ||
            (deliveryName && deliveryName.includes(q))
        );
    });

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
                                <button
                                    onClick={() => {
                                        setShowCalendar(true);
                                        const now = new Date();
                                        fetchCalendarMeals(now.getFullYear(), now.getMonth() + 1);
                                    }}
                                    className="ml-2 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    title="Monthly calendar view"
                                >
                                    <FiCalendar size={22} />
                                </button>
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
                                        { value: "this_month", label: "This Month" },
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
                                        ...patients.map((p) => ({
                                            value: String(p.patient_details.id),
                                            label: `${p.patient_details.first_name} ${p.patient_details.last_name}`,
                                        })),
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
                                        minDate={new Date().toISOString().split("T")[0]}
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
                                        minDate={customStart || new Date().toISOString().split("T")[0]}
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Bulk assign — same date window as above; one supply-chain person for all meals / slots */}
                        <div className="flex flex-col xl:flex-row flex-wrap gap-4 pt-6 border-t border-gray-50 dark:border-white/5 items-end">
                            <div className="space-y-2 flex-1 min-w-[220px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                    Bulk assign (current window)
                                </label>
                                <Select
                                    options={[
                                        { value: "", label: assignContextLoading ? "Loading…" : "Supply chain person…" },
                                        ...supplyUsers.map((u) => ({
                                            value: String(u.id),
                                            label: `${u.first_name} ${u.last_name}`.trim() || `User ${u.id}`,
                                        })),
                                    ]}
                                    value={bulkPersonId}
                                    onChange={(v) => setBulkPersonId(v)}
                                    className="dark:bg-gray-900"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tight cursor-pointer pb-3 xl:pb-0">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={bulkOnlyUnassigned}
                                    onChange={(e) => setBulkOnlyUnassigned(e.target.checked)}
                                />
                                Only unassigned
                            </label>
                            <button
                                type="button"
                                disabled={bulkSaving || !bulkPersonId || !getBulkWindowDates()}
                                onClick={() => void handleBulkAssign()}
                                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                            >
                                {bulkSaving ? "Applying…" : "Apply to all meals in window"}
                            </button>
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
                                                                        <img src={getMediaUrl(m.food_details.image)} alt={m.food_details.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10">
                                                                             {getMealIcon(type)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="pt-2">
                                                                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{m.food_details.name}</h4>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center gap-2">
                                                                            <FiHash className="text-indigo-500" size={12} />
                                                                            <span className="text-[10px] font-black text-indigo-600 uppercase">Quantity {m.quantity}</span>
                                                                        </div>
                                                                        {m.packaging_material_details?.name && (
                                                                            <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center gap-2">
                                                                                <FiPackage className="text-gray-500" size={12} />
                                                                                <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">{m.packaging_material_details.name}</span>
                                                                            </div>
                                                                        )}
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
                                                                {m.micro_kitchen_details?.brand_name && (
                                                                    <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                                        <p className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">
                                                                            Kitchen: {m.micro_kitchen_details.brand_name}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors">
                                                                    <FiInfo size={18} />
                                                                </button>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-4 p-4 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                                    <FiTruck size={18} />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Daily delivery</p>
                                                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                                                        {formatDeliveryPersonName(m) ?? "Unassigned"}
                                                                    </p>
                                                                </div>
                                                                {!formatDeliveryPersonName(m) && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setAssignModalMeal(m)}
                                                                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors"
                                                                    >
                                                                        <FiPlusCircle size={14} />
                                                                        Assign
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {m.status === "delivered" && (
                                                                <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-3">
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                            Delivery feedback
                                                                        </p>
                                                                        {!deliveryFeedbackByMealId[m.id] && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => void loadMealFeedback(m.id)}
                                                                                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest disabled:opacity-60"
                                                                                disabled={feedbackLoadingMealId === m.id}
                                                                            >
                                                                                {feedbackLoadingMealId === m.id ? "Loading…" : "Load"}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {(() => {
                                                                        const feedbacks = deliveryFeedbackByMealId[m.id];
                                                                        if (!feedbacks) return null;
                                                                        const deliveryRating = feedbacks.find((f) => f.feedback_type === "rating");
                                                                        const deliveryIssue = feedbacks.find((f) => f.feedback_type === "issue");
                                                                        if (!deliveryRating && !deliveryIssue) {
                                                                            return (
                                                                                <p className="text-xs font-bold text-gray-500">
                                                                                    No delivery feedback submitted yet.
                                                                                </p>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div className="space-y-3">
                                                                                {deliveryRating && (
                                                                                    <div className="p-3 rounded-2xl bg-indigo-50/40 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10">
                                                                                        <div className="flex items-center gap-1 mb-2">
                                                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                                                <FiStar
                                                                                                    key={s}
                                                                                                    size={12}
                                                                                                    className={s <= (deliveryRating.rating || 0) ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                                                                                                />
                                                                                            ))}
                                                                                            <span className="ml-2 text-[10px] font-black text-gray-700 dark:text-gray-300">
                                                                                                {deliveryRating.rating}/5
                                                                                            </span>
                                                                                        </div>
                                                                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic">
                                                                                            "{deliveryRating.review || "No written delivery review"}"
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                                {deliveryIssue && (
                                                                                    <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/10">
                                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">
                                                                                            Reported issue
                                                                                        </p>
                                                                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase">
                                                                                            {(deliveryIssue.issue_type || "issue").replace(/_/g, " ")}
                                                                                        </p>
                                                                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic mt-1">
                                                                                            "{deliveryIssue.description || "No extra issue details"}"
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}

                                                            <div className="p-5 bg-gray-50/50 dark:bg-white/[0.03] rounded-3xl border border-transparent group-hover:border-indigo-100/30 transition-all">
                                                                <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase leading-relaxed line-clamp-2 italic">
                                                                    "{m.user_details.address || "No delivery address registered"}"
                                                                </p>
                                                            </div>

                                                            {m.notes && (
                                                                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <FiInfo className="text-amber-500" size={14} />
                                                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Nutritionist Instructions</span>
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 italic">
                                                                        {m.notes}
                                                                    </p>
                                                                </div>
                                                            )}

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

            {/* Assign delivery — global plan rows or supply chain list */}
            <AnimatePresence>
                {assignModalMeal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => !assignSaving && setAssignModalMeal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-white/5"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                    Assign delivery
                                </h2>
                                <button
                                    type="button"
                                    disabled={assignSaving}
                                    onClick={() => setAssignModalMeal(null)}
                                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="p-5 space-y-6">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {assignModalMeal.food_details.name} · {assignModalMeal.meal_type_details.name} ·{" "}
                                    {assignModalMeal.meal_date}
                                </p>

                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                        Option 1 — Global plan (per slot)
                                    </h3>
                                    {(() => {
                                        const plan = planAssignments.find(
                                            (p) => p.user_diet_plan === assignModalMeal.user_diet_plan
                                        );
                                        const opts = globalDeliveryOptions(plan);
                                        if (!opts.length) {
                                            return (
                                                <p className="text-xs text-gray-500 italic">
                                                    No global assignment for this diet plan. Use option 2 or set global
                                                    assignments in Delivery management.
                                                </p>
                                            );
                                        }
                                        return (
                                            <div className="flex flex-col gap-2">
                                                {opts.map((o) => (
                                                    <button
                                                        key={o.key}
                                                        type="button"
                                                        disabled={assignSaving}
                                                        onClick={() =>
                                                            void handleAssignFromGlobal(
                                                                assignModalMeal,
                                                                o.personId,
                                                                o.slotId
                                                            )
                                                        }
                                                        className="text-left px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
                                                    >
                                                        {o.label}
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="border-t border-gray-100 dark:border-white/5 pt-5">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                        Option 2 — Supply chain (any person)
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <Select
                                                options={[
                                                    { value: "", label: "Choose person…" },
                                                    ...supplyUsers.map((u) => ({
                                                        value: String(u.id),
                                                        label: `${u.first_name} ${u.last_name}`.trim() || `User ${u.id}`,
                                                    })),
                                                ]}
                                                value={manualSupplyPersonId}
                                                onChange={(v) => setManualSupplyPersonId(v)}
                                                className="dark:bg-gray-900"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            disabled={assignSaving || !manualSupplyPersonId}
                                            onClick={() => void handleAssignManualSupply(assignModalMeal)}
                                            className="px-5 py-3 rounded-2xl bg-gray-900 dark:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-40"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Calendar Modal - Monthly view of all meals */}
            <AnimatePresence>
                {showCalendar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowCalendar(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                    <FiCalendar className="text-indigo-500" size={24} /> Monthly Meals
                                </h2>
                                <button
                                    onClick={() => setShowCalendar(false)}
                                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <FiX size={22} />
                                </button>
                            </div>
                            <div className="p-6 overflow-auto flex-1 relative">
                                {calendarLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10 rounded-b-[32px]">
                                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                                        <p className="text-gray-400 font-bold text-sm">Loading meals...</p>
                                    </div>
                                )}
                                <FullCalendar
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                                    events={calendarMeals.map((m) => {
                                        const dp = formatDeliveryPersonName(m);
                                        const base = `${m.meal_type_details?.name || "Meal"}: ${m.food_details?.name || "—"} (${m.user_details?.first_name || ""})`;
                                        return {
                                            id: String(m.id),
                                            title: dp ? `${base} · ${dp}` : base,
                                            start: m.meal_date,
                                            allDay: true,
                                        };
                                    })}
                                    datesSet={(info) => {
                                        const start = info.startStr?.split("T")[0];
                                        if (start) {
                                            const d = new Date(start);
                                            fetchCalendarMeals(d.getFullYear(), d.getMonth() + 1, true);
                                        }
                                    }}
                                    eventContent={(arg) => (
                                        <div className="px-2 py-0.5 rounded-lg text-[10px] font-bold truncate bg-indigo-600 text-white">
                                            {arg.event.title}
                                        </div>
                                    )}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MealsBasedOnDailyPage;
