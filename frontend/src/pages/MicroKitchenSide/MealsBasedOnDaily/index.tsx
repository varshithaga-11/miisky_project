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
    getKitchenMealsCalendar,
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
import { FiClock, FiSearch, FiTruck, FiCheckCircle, FiUser, FiInfo, FiHash, FiFilter, FiCalendar, FiX, FiPackage, FiPlusCircle, FiStar, FiLoader, FiMapPin } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { GiCookingPot, GiBowlOfRice, GiHamburger, GiBreadSlice } from "react-icons/gi";

// Custom Form Components
import { FilterBar } from "../../../components/common";
import SearchableSelect from "../../../components/form/SearchableSelect";
import Button from "../../../components/ui/button/Button";

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
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filters
    const [selectedPatient, setSelectedPatient] = useState<string>("all");
    const [period, setPeriod] = useState<string>("today");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Calendar
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMeals, setCalendarMeals] = useState<DailyMeal[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const lastFetchedMonthRef = useRef<string | null>(null);

    const [planAssignments, setPlanAssignments] = useState<PlanDeliveryAssignment[]>([]);
    const [hoveredEvent, setHoveredEvent] = useState<DailyMeal | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
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

    const fetchCalendarMeals = async (m: number, y: number) => {
        setCalendarLoading(true);
        try {
            const data = await getKitchenMealsCalendar(y, m, selectedPatient);
            setCalendarMeals(data);
        } catch (error) {
            console.error("Calendar fetch failed:", error);
            toast.error("Failed to load production calendar");
        } finally {
            setCalendarLoading(false);
        }
    };

    const fetchDailyPrep = useCallback(async (p = 1, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            let params: any = {
                page: p,
                limit: 20,
                period: period,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            };
            if (selectedPatient !== "all") params.user = selectedPatient;

            const res = await getKitchenMeals(params);
            if (isLoadMore) {
                setMeals(prev => [...prev, ...(res.results || [])]);
            } else {
                setMeals(res.results || []);
            }
            setCurrentPage(res.current_page || p);
            setHasMore(res.current_page < res.total_pages);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load prep schedule");
            if (!isLoadMore) setMeals([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [period, startDate, endDate, selectedPatient]);

    useEffect(() => {
        fetchDailyPrep(1, false);
    }, [fetchDailyPrep]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                fetchDailyPrep(currentPage + 1, true);
            }
        }, { threshold: 0.1 });
        const el = document.getElementById("prep-sentinel");
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, currentPage, fetchDailyPrep]);

    useEffect(() => {
        // Dropdown data (patients, supply users) now fetched on-demand via onFocus
    }, []);

    const handleAssignFromGlobal = async (meal: DailyMeal, personId: number, slotId: number | null) => {
        setAssignSaving(true);
        try {
            const payload: any = { delivery_person_id: personId, reason: "Global plan pick" };
            if (slotId != null) payload.delivery_slot_id = slotId;
            const updated = await assignMealDelivery(meal.id, payload);
            setMeals(prev => prev.map(x => x.id === updated.id ? updated : x));
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
        if (!Number.isFinite(id)) return toast.error("Select partner");
        setAssignSaving(true);
        try {
            const updated = await assignMealDelivery(meal.id, { delivery_person_id: id, reason: "Manual assign" });
            setMeals(prev => prev.map(x => x.id === updated.id ? updated : x));
            setAssignModalMeal(null);
            toast.success("Delivery assigned manually");
        } catch (e) {
            console.error(e);
            toast.error("Assignment failed");
        } finally {
            setAssignSaving(false);
        }
    };

    const handleBulkAssign = async () => {
        const personId = parseInt(bulkPersonId, 10);
        if (!personId) return toast.error("Select partner for bulk assignment");
        setBulkSaving(true);
        try {
            const res = await bulkAssignDelivery({
                start_date: startDate || new Date().toISOString().split('T')[0],
                end_date: endDate || new Date().toISOString().split('T')[0],
                delivery_person_id: personId,
                user: selectedPatient !== "all" ? selectedPatient : undefined,
                only_unassigned: bulkOnlyUnassigned,
            });
            toast.success(`Bulk assignment complete: ${res.updated} meals updated`);
            fetchDailyPrep(1, false);
        } catch (e) {
            console.error(e);
            toast.error("Bulk assignment failed");
        } finally {
            setBulkSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
            <PageMeta title="Daily Prep Schedule | Miisky" description="Manage meal preparation and logistics" />
            <PageBreadcrumb pageTitle="Daily Preparation" />
            <ToastContainer position="top-right" />

            <div className="px-4 md:px-8 pb-20 max-w-7xl mx-auto">
                <div className="flex flex-col gap-8 mt-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                Preparation Hub
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium italic">
                                Orchestrating meal production and fulfillment logistics.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowCalendar(true)} className="!rounded-2xl !py-3 !px-6 text-[10px] font-black uppercase tracking-widest italic">
                                <FiCalendar size={16} className="mr-2" /> Calendar View
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[300px]">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Search Patient</label>
                                <SearchableSelect
                                    value={selectedPatient}
                                    onChange={setSelectedPatient}
                                    onFocus={fetchPatients}
                                    options={[
                                        { value: "all", label: "Consolidated Patients" },
                                        ...patients.map(p => ({
                                            value: String(p.patient_details.id),
                                            label: `${p.patient_details.first_name} ${p.patient_details.last_name}`
                                        }))
                                    ]}
                                    className="!rounded-2xl italic font-bold"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <SearchableSelect
                                    value={bulkPersonId}
                                    onChange={setBulkPersonId}
                                    onFocus={fetchAssignContext}
                                    placeholder="Bulk Partner Assign"
                                    options={supplyUsers.map(u => ({
                                        value: String(u.id),
                                        label: `${u.first_name} ${u.last_name}`
                                    }))}
                                    className="!rounded-2xl italic font-bold"
                                />
                            </div>
                            <Button size="sm" onClick={handleBulkAssign} disabled={bulkSaving} className="!rounded-xl !py-2 !px-4 text-[9px] font-black uppercase italic">
                                {bulkSaving ? 'Syncing...' : 'Bulk Execute'}
                            </Button>
                        </div>

                        <FilterBar 
                            startDate={startDate}
                            endDate={endDate}
                            activePeriod={period}
                            onPeriodChange={setPeriod}
                            onFilterChange={(s: string, e: string, p: string) => {
                                setStartDate(s);
                                setEndDate(e);
                                setPeriod(p);
                            }}
                        />
                    </div>

                    <div className="space-y-6">
                        {loading && currentPage === 1 ? (
                            <div className="py-32 flex flex-col items-center gap-4 bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-50 dark:border-white/5">
                                <FiLoader className="size-10 text-indigo-500 animate-spin" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Synchronizing prep schedule...</p>
                            </div>
                        ) : meals.length === 0 ? (
                            <div className="py-32 bg-white dark:bg-gray-900 rounded-[40px] text-center border border-gray-50 dark:border-white/5 shadow-sm">
                                <GiCookingPot className="size-16 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Kitchen is Idle</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">No meals scheduled for this production window.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {meals.map((meal) => (
                                    <motion.div
                                        key={meal.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none p-6 group"
                                    >
                                        <div className="flex gap-5 mb-6">
                                            <div className="size-16 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-white/5 flex-shrink-0">
                                                {meal.food_details.image ? (
                                                    <img src={getMediaUrl(meal.food_details.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                ) : <GiBowlOfRice size={24} className="m-5 text-gray-200" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic truncate">{meal.food_details.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg">
                                                        {meal.meal_type_details.name}
                                                    </span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                        {meal.quantity} UNIT{meal.quantity !== 1 ? 'S' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-start gap-3">
                                                <div className="size-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                    <FiUser size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Consumer</p>
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 italic truncate">
                                                        {meal.user_details.first_name} {meal.user_details.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="size-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                    <FiClock size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Production Date</p>
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 italic">
                                                        {new Date(meal.meal_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-50 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className={`size-2 rounded-full ${meal.delivery_person_details ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                                <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                                    {meal.delivery_person_details ? formatDeliveryPersonName(meal) : 'Partner Required'}
                                                </p>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => setAssignModalMeal(meal)} className="!rounded-xl !py-2 !px-4 text-[9px] font-black uppercase italic">
                                                {meal.delivery_person_details ? 'Re-Route' : 'Assign'}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {hasMore && (
                            <div id="prep-sentinel" className="py-12 flex items-center justify-center">
                                <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            <AnimatePresence>
                {assignModalMeal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setAssignModalMeal(null)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-gray-900 rounded-[40px] max-w-lg w-full p-10 border border-gray-100 dark:border-white/5 shadow-2xl">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-8 flex items-center gap-3">
                                <FiTruck className="text-indigo-600" /> Logistics Assignment
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-transparent italic">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Automated Optimization</p>
                                    <div className="space-y-2">
                                        {globalDeliveryOptions(planAssignments.find(pa => pa.user_diet_plan === assignModalMeal.user_diet_plan)).map(opt => (
                                            <button
                                                key={opt.key}
                                                onClick={() => handleAssignFromGlobal(assignModalMeal, opt.personId, opt.slotId)}
                                                className="w-full text-left p-3 rounded-xl bg-white dark:bg-gray-950 text-indigo-600 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-between group"
                                            >
                                                <span>{opt.label}</span>
                                                <FiCheckCircle className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                        {globalDeliveryOptions(planAssignments.find(pa => pa.user_diet_plan === assignModalMeal.user_diet_plan)).length === 0 && (
                                            <p className="text-[10px] text-gray-400 font-medium">No pre-mapped logistics found for this plan segment.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Manual Override</p>
                                    <SearchableSelect
                                        value={manualSupplyPersonId}
                                        onChange={setManualSupplyPersonId}
                                        onFocus={fetchAssignContext}
                                        placeholder="Select Partner"
                                        options={supplyUsers.map(u => ({
                                            value: String(u.id),
                                            label: `${u.first_name} ${u.last_name}`
                                        }))}
                                    />
                                    <Button onClick={() => handleAssignManualSupply(assignModalMeal)} disabled={assignSaving} className="w-full !rounded-2xl !py-4 shadow-xl shadow-indigo-600/20 text-[10px] font-black uppercase italic tracking-widest">
                                        {assignSaving ? 'Synchronizing...' : 'Authorize Manual Assignment'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Calendar View Modal */}
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
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                                        <FiCalendar size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Production Calendar</h2>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Monthly Schedule View</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCalendar(false)}
                                    className="px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-rose-500 hover:text-white transition-all border border-transparent hover:border-rose-500/20"
                                >
                                    Close View
                                </button>
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto no-scrollbar relative">
                                {calendarLoading && (
                                    <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] animate-pulse">Syncing Production Data...</p>
                                    </div>
                                )}
                                
                                <FullCalendar
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth'
                                    }}
                                    datesSet={(dateInfo) => {
                                        const centerDate = new Date(dateInfo.view.currentStart);
                                        centerDate.setDate(centerDate.getDate() + 15);
                                        const m = centerDate.getMonth() + 1;
                                        const y = centerDate.getFullYear();
                                        
                                        const key = `${y}-${m}`;
                                        if (key !== lastFetchedMonthRef.current) {
                                            lastFetchedMonthRef.current = key;
                                            fetchCalendarMeals(m, y);
                                        }
                                    }}
                                    events={calendarMeals.map(m => ({
                                        id: String(m.id),
                                        title: `${m.meal_type_details.name}: ${m.food_details.name}`,
                                        start: m.meal_date,
                                        backgroundColor: m.delivery_person_details ? '#4f46e5' : '#f43f5e',
                                        borderColor: 'transparent',
                                        extendedProps: { 
                                            meal: m,
                                            partner: formatDeliveryPersonName(m) || 'Unassigned',
                                            consumer: `${m.user_details.first_name} ${m.user_details.last_name}`
                                        }
                                    }))}
                                    eventContent={(eventInfo) => (
                                        <div className="p-1 px-2 flex flex-col gap-0.5 overflow-hidden transition-transform group-hover:scale-105">
                                            <div className="text-[9px] font-black uppercase leading-none truncate">{eventInfo.event.title}</div>
                                            <div className="text-[8px] font-medium opacity-80 truncate italic">👤 {eventInfo.event.extendedProps.consumer}</div>
                                            <div className="text-[8px] font-bold opacity-90 truncate">🚚 {eventInfo.event.extendedProps.partner}</div>
                                        </div>
                                    )}
                                    eventMouseEnter={(info) => {
                                        const rect = info.el.getBoundingClientRect();
                                        setHoverPosition({ x: rect.left + rect.width / 2, y: rect.top });
                                        setHoveredEvent(info.event.extendedProps.meal);
                                    }}
                                    eventMouseLeave={() => setHoveredEvent(null)}
                                />

                                <AnimatePresence>
                                    {hoveredEvent && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: -10, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            style={{
                                                position: 'fixed',
                                                left: hoverPosition.x,
                                                top: hoverPosition.y,
                                                transform: 'translateX(-50%) translateY(-100%)',
                                                zIndex: 1000,
                                                pointerEvents: 'none'
                                            }}
                                            className="w-64 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 p-5 overflow-hidden"
                                        >
                                            <div className="flex gap-4 mb-4">
                                                <div className="size-14 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                                                    {hoveredEvent.food_details.image ? (
                                                        <img src={getMediaUrl(hoveredEvent.food_details.image)} className="w-full h-full object-cover" alt="" />
                                                    ) : <GiBowlOfRice size={20} className="m-4 text-gray-200" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{hoveredEvent.meal_type_details.name}</p>
                                                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase truncate italic">{hoveredEvent.food_details.name}</h4>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{hoveredEvent.quantity} Unit(s)</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-3 border-t border-gray-50 dark:border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <FiUser size={12} className="text-gray-400" />
                                                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate">
                                                        {hoveredEvent.user_details.first_name} {hoveredEvent.user_details.last_name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiTruck size={12} className={hoveredEvent.delivery_person_details ? "text-emerald-500" : "text-rose-500"} />
                                                    <p className="text-[10px] font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">
                                                        {hoveredEvent.delivery_person_details ? formatDeliveryPersonName(hoveredEvent) : 'Unassigned'}
                                                    </p>
                                                </div>
                                                {hoveredEvent.user_details.address && (
                                                    <div className="flex items-start gap-2">
                                                        <FiMapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-[8px] font-medium text-gray-500 leading-tight">
                                                            {hoveredEvent.user_details.address}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute top-0 right-0 p-2">
                                                <div className={`size-1.5 rounded-full ${hoveredEvent.is_consumed ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <style>{`
                                    .fc-theme-standard .fc-scrollgrid { border: none !important; }
                                    .fc .fc-toolbar-title { font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; font-size: 1.5rem; color: #111827; }
                                    .fc .fc-button-primary { background: transparent !important; border: 1px solid #e5e7eb !important; color: #6b7280 !important; border-radius: 12px !important; text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 0.1em; padding: 10px 16px !important; }
                                    .fc .fc-button-primary:hover { background: #f3f4f6 !important; }
                                    .fc .fc-button-active { background: #4f46e5 !important; border-color: #4f46e5 !important; color: white !important; }
                                    .fc-daygrid-event { border-radius: 10px !important; margin: 1px 2px !important; padding: 2px !important; border: none !important; }
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

export default MealsBasedOnDailyPage;
