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
import { FiClock, FiSearch, FiTruck, FiCheckCircle, FiUser, FiInfo, FiHash, FiFilter, FiCalendar, FiX, FiPackage, FiPlusCircle, FiStar, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { GiCookingPot, GiBowlOfRice, GiHamburger, GiBreadSlice } from "react-icons/gi";

// Custom Form Components
import { FilterBar } from "../../../components/common";
import Select from "../../../components/form/Select";
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
        fetchPatients();
        fetchAssignContext();
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
                                <Select
                                    value={selectedPatient}
                                    onChange={setSelectedPatient}
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
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                <select
                                    value={bulkPersonId}
                                    onChange={(e) => setBulkPersonId(e.target.value)}
                                    className="px-4 py-2 bg-transparent text-sm font-bold border-none focus:ring-0 min-w-[200px]"
                                >
                                    <option value="">Bulk Partner Assign</option>
                                    {supplyUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                                    ))}
                                </select>
                                <Button size="sm" onClick={handleBulkAssign} disabled={bulkSaving} className="!rounded-xl !py-2 !px-4 text-[9px] font-black uppercase italic">
                                    {bulkSaving ? 'Syncing...' : 'Bulk Execute'}
                                </Button>
                            </div>
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
                                    <select
                                        value={manualSupplyPersonId}
                                        onChange={(e) => setManualSupplyPersonId(e.target.value)}
                                        className="w-full rounded-2xl border-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold shadow-sm"
                                    >
                                        <option value="">Select Partner</option>
                                        {supplyUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                                        ))}
                                    </select>
                                    <Button onClick={() => handleAssignManualSupply(assignModalMeal)} disabled={assignSaving} className="w-full !rounded-2xl !py-4 shadow-xl shadow-indigo-600/20 text-[10px] font-black uppercase italic tracking-widest">
                                        {assignSaving ? 'Synchronizing...' : 'Authorize Manual Assignment'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MealsBasedOnDailyPage;
