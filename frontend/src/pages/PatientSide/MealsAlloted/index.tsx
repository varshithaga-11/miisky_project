import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { markAsConsumed, updateMealNote, getTimelineMeals, getMonthlyMeals, getFoodByIdNutrition, getFoodRecipeById } from "./api";
import type { UserMeal, FoodNutritionById, FoodRecipe } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiClock, FiCheckCircle, FiActivity, FiCalendar, FiList, FiPackage, FiEdit2, FiX, FiCheck, FiEye } from "react-icons/fi";
import { GiBreadSlice, GiBowlOfRice, GiHamburger, GiCookingPot } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const MealsAllotedPage: React.FC = () => {
    const [allMeals, setAllMeals] = useState<UserMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "calendar" | "weekly">("list");
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    
    const [weeklyStartDate, setWeeklyStartDate] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        return start.toISOString().split('T')[0];
    });
    
    // Hover State for Calendar
    const [hoveredEvent, setHoveredEvent] = useState<UserMeal | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    // Note Editing State
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [tempNote, setTempNote] = useState("");
    const [updatingNote, setUpdatingNote] = useState(false);
    const [foodNutritionOpen, setFoodNutritionOpen] = useState(false);
    const [foodNutritionLoading, setFoodNutritionLoading] = useState(false);
    const [foodNutrition, setFoodNutrition] = useState<FoodNutritionById | null>(null);
    const [foodRecipeOpen, setFoodRecipeOpen] = useState(false);
    const [foodRecipeLoading, setFoodRecipeLoading] = useState(false);
    const [foodRecipe, setFoodRecipe] = useState<FoodRecipe | null>(null);

    useEffect(() => {
        fetchMeals();
    }, [viewMode, calendarMonth, calendarYear, weeklyStartDate]);

    const fetchMeals = async () => {
        setLoading(true);
        try {
            let meals: UserMeal[] = [];
            if (viewMode === "list") {
                meals = await getTimelineMeals();
            } else if (viewMode === "calendar") {
                meals = await getMonthlyMeals(calendarMonth, calendarYear);
            } else {
                // Weekly view
                const end = new Date(weeklyStartDate);
                end.setDate(end.getDate() + 6);
                const endDateStr = end.toISOString().split('T')[0];
                meals = await getTimelineMeals(weeklyStartDate, endDateStr);
            }
            
            const sorted = [...meals].sort((a, b) => {
                const dateCompare = b.meal_date.localeCompare(a.meal_date);
                if (dateCompare !== 0) return dateCompare;
                return (a.meal_type || 0) - (b.meal_type || 0);
            });
            setAllMeals(sorted);
        } catch (err) {
            toast.error("Failed to sync your nutrition plan");
        } finally {
            setLoading(false);
        }
    };

    const handleCalendarChange = (info: any) => {
        const date = info.view.currentStart;
        const newMonth = date.getMonth() + 1;
        const newYear = date.getFullYear();
        if (newMonth !== calendarMonth || newYear !== calendarYear) {
            setCalendarMonth(newMonth);
            setCalendarYear(newYear);
        }
    };

    const handleMarkConsumed = async (id: number) => {
        try {
            await markAsConsumed(id);
            setAllMeals(prev => prev.map(m => m.id === id ? { ...m, is_consumed: true, consumed_at: new Date().toISOString() } : m));
            toast.success("Great job! Meal logged. 🍱");
        } catch (err) {
            toast.error("Failed to log consumption");
        }
    };

    const handleSaveNote = async () => {
        if (editingNoteId === null) return;
        setUpdatingNote(true);
        try {
            await updateMealNote(editingNoteId, tempNote);
            setAllMeals(prev => prev.map(m => m.id === editingNoteId ? { ...m, notes: tempNote } : m));
            setEditingNoteId(null);
            toast.success("Note saved successfully");
        } catch (err) {
            toast.error("Failed to save note");
        } finally {
            setUpdatingNote(false);
        }
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

    const openFoodRecipe = async (foodId: number) => {
        setFoodRecipeOpen(true);
        setFoodRecipeLoading(true);
        setFoodRecipe(null);
        try {
            const data = await getFoodRecipeById(foodId);
            setFoodRecipe(data);
        } catch {
            toast.error("Failed to load food recipe");
        } finally {
            setFoodRecipeLoading(false);
        }
    };

    const groupedByDate: Record<string, UserMeal[]> = allMeals.reduce((acc, meal) => {
        const date = meal.meal_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(meal);
        return acc;
    }, {} as Record<string, UserMeal[]>);

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
    
    const getMealIcon = (name: string = "") => {
        const n = name.toLowerCase();
        if (n.includes("breakfast")) return <GiBreadSlice size={20} className="text-amber-500" />;
        if (n.includes("lunch")) return <GiBowlOfRice size={20} className="text-emerald-500" />;
        if (n.includes("dinner")) return <GiCookingPot size={20} className="text-indigo-500" />;
        return <GiHamburger size={20} className="text-orange-500" />;
    };

    return (
        <>
            <PageMeta title="My Nutrition Plan | Miisky Health" description="View and track your daily nutrition plan" />
            <PageBreadcrumb pageTitle="My Allotted Meals" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="min-h-screen bg-white dark:bg-gray-950 p-4 lg:p-12">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Hero Stats & Mode Toggle */}
                    <div className="bg-indigo-600 rounded-[40px] p-6 lg:p-10 text-white shadow-2xl shadow-indigo-200/50 dark:shadow-none flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden transition-all">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                        
                        <div className="z-10">
                            <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <button 
                                    onClick={() => setViewMode("list")}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                                >
                                    <FiList size={14} /> Timeline
                                </button>
                                <button 
                                    onClick={() => setViewMode('weekly')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'weekly' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                                >
                                    <FiList size={14} /> Weekly
                                </button>
                                <button 
                                    onClick={() => setViewMode("calendar")}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                                >
                                    <FiCalendar size={14} /> Calendar
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 z-10">
                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/20">
                                <FiActivity size={24} className="text-emerald-300" />
                                <div className="text-left">
                                    <span className="block text-xl font-black leading-none">{allMeals.filter(m => m.is_consumed).length}</span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Finished</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/20">
                                <FiClock size={24} className="text-amber-300" />
                                <div className="text-left">
                                    <span className="block text-xl font-black leading-none">{allMeals.filter(m => !m.is_consumed).length}</span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Upcoming</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6">
                            <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing nutrition profile...</p>
                        </div>
                    ) : viewMode === "calendar" ? (
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-transparent dark:border-white/[0.05] shadow-xl overflow-hidden custom-calendar relative">
                            {/* Hover Card */}
                            <AnimatePresence>
                                {hoveredEvent && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        style={{ 
                                            position: "fixed", 
                                            left: mousePos.x + 20, 
                                            top: mousePos.y + 20,
                                            zIndex: 9999
                                        }}
                                        className="bg-white dark:bg-gray-800 border dark:border-white/10 rounded-2xl p-4 shadow-2xl w-64 pointer-events-none"
                                    >
                                        <div className="flex items-center gap-2 mb-2 text-indigo-500 font-black uppercase tracking-widest text-[8px]">
                                            {getMealIcon(hoveredEvent.meal_type_details?.name)}
                                            {hoveredEvent.meal_type_details?.name}
                                        </div>
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 italic">
                                            {hoveredEvent.food_details?.name}
                                        </h4>
                                        <div className="flex flex-wrap justify-between items-center gap-2 text-[10px] font-bold text-gray-400">
                                            <span>Qty: {hoveredEvent.quantity}</span>
                                            {hoveredEvent.packaging_material_details?.name && (
                                                <span className="flex items-center gap-1 text-indigo-500">
                                                    <FiPackage size={10} /> {hoveredEvent.packaging_material_details.name}
                                                </span>
                                            )}
                                            <span className={hoveredEvent.is_consumed ? 'text-emerald-500' : 'text-amber-500'}>
                                                {hoveredEvent.is_consumed ? 'Consumed' : 'Pending'}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: "prev,next",
                                    center: "title",
                                    right: "dayGridMonth,timeGridWeek"
                                }}
                                datesSet={handleCalendarChange}
                                events={allMeals.map(m => ({
                                    id: m.id.toString(),
                                    title: `${m.meal_type_details?.name}: ${m.food_details?.name}`,
                                    start: m.meal_date,
                                    allDay: true,
                                    extendedProps: { 
                                        meal: m,
                                        calendar: m.is_consumed ? "Success" : "Primary",
                                        icon: m.meal_type_details?.name 
                                    }
                                }))}
                                eventMouseEnter={(info: any) => {
                                    setHoveredEvent(info.event.extendedProps.meal);
                                    setMousePos({ x: info.jsEvent.clientX + 15, y: info.jsEvent.clientY + 15 });
                                }}
                                eventMouseLeave={() => {
                                    setHoveredEvent(null);
                                }}
                                eventContent={(eventInfo) => {
                                    const colorClass = eventInfo.event.extendedProps.calendar === "Success" ? 'bg-emerald-500' : 'bg-indigo-500';
                                    return (
                                        <div className={`flex items-center gap-2 p-1.5 rounded-lg text-white ${colorClass} text-[9px] font-bold uppercase tracking-tighter overflow-hidden truncate cursor-pointer`}>
                                            <div className="shrink-0 scale-75">
                                                {getMealIcon(eventInfo.event.extendedProps.icon)}
                                            </div>
                                            <span className="truncate">{eventInfo.event.title}</span>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    ) : viewMode === "weekly" ? (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-transparent dark:border-white/[0.05] shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => {
                                            const d = new Date(weeklyStartDate);
                                            d.setDate(d.getDate() - 7);
                                            setWeeklyStartDate(d.toISOString().split('T')[0]);
                                        }}
                                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FiX className="rotate-180" /> {/* Using FiX as a placeholder for arrow if needed, but better use a real icon */}
                                        <span className="sr-only">Previous Week</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                    </button>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest italic">
                                            Week of {new Date(weeklyStartDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {(() => {
                                                const end = new Date(weeklyStartDate);
                                                end.setDate(end.getDate() + 6);
                                                return `Showing through ${end.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
                                            })()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const d = new Date(weeklyStartDate);
                                            d.setDate(d.getDate() + 7);
                                            setWeeklyStartDate(d.toISOString().split('T')[0]);
                                        }}
                                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input 
                                        type="month" 
                                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold border-none focus:ring-2 ring-indigo-500/20"
                                        value={`${new Date(weeklyStartDate).getFullYear()}-${String(new Date(weeklyStartDate).getMonth() + 1).padStart(2, '0')}`}
                                        onChange={(e) => {
                                            const [y, m] = e.target.value.split('-');
                                            const d = new Date(parseInt(y), parseInt(m) - 1, 1);
                                            const day = d.getDay();
                                            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                                            setWeeklyStartDate(new Date(d.setDate(diff)).toISOString().split('T')[0]);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto pb-4 scrollbar-thin">
                                <div className="min-w-[1200px] grid grid-cols-8 gap-4">
                                    <div className="pt-16">
                                        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(type => (
                                            <div key={type} className="h-48 flex items-center justify-center">
                                                <div className="rotate-[-90deg] whitespace-nowrap text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                                                    {type}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const d = new Date(weeklyStartDate);
                                        d.setDate(d.getDate() + i);
                                        const dateStr = d.toISOString().split('T')[0];
                                        const dayMeals = allMeals.filter(m => m.meal_date === dateStr);
                                        
                                        return (
                                            <div key={dateStr} className="space-y-4">
                                                <div className="text-center p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl mb-6">
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{d.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                                                    <p className="text-lg font-black text-gray-900 dark:text-white italic">{d.getDate()}</p>
                                                </div>

                                                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(type => {
                                                    const typeMeals = dayMeals.filter(m => m.meal_type_details?.name.toLowerCase().includes(type.toLowerCase()));
                                                    return (
                                                        <div key={type} className="h-48 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 p-3 flex flex-col gap-2 overflow-y-auto scrollbar-none hover:border-indigo-500/20 transition-colors">
                                                            {typeMeals.length === 0 ? (
                                 <div className="flex-1 flex flex-col items-center justify-center opacity-20 grayscale">
                                                                    {getMealIcon(type)}
                                                                    <span className="text-[8px] font-bold uppercase mt-1">Empty</span>
                                                                </div>
                                                            ) : (
                                                                typeMeals.map(m => (
                                                                    <div key={m.id} className={`p-3 rounded-2xl ${m.is_consumed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-500/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/10'} border shadow-sm`}>
                                                                        <div className="flex items-center gap-1.5 mb-2">
                                                                            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${m.is_consumed ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/40'}`}>
                                                                                {m.meal_type_details?.name || 'Meal'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <p className={`text-[9px] font-black uppercase tracking-tighter truncate leading-tight ${m.is_consumed ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                                                {m.food_details?.name}
                                                                            </p>
                                                                            {m.is_consumed && <FiCheckCircle className="text-emerald-500 shrink-0" size={10} />}
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-auto">
                                                                            <span className="text-[8px] font-bold text-gray-400">Qty: {m.quantity}</span>
                                                                            {!m.is_consumed && (
                                                                                <button 
                                                                                    onClick={() => handleMarkConsumed(m.id)}
                                                                                    className="p-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                                                                                >
                                                                                    <FiCheck size={10} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Timeline View */
                        <div className="space-y-16">
                            {sortedDates.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[40px] p-24 border-2 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                    <div className="size-24 rounded-[30px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 mb-8">
                                        <FiCalendar size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">No Meals Allotted Yet</h3>
                                    <p className="text-gray-400 font-medium max-w-sm">Your nutritionist is crafting your personalized plan. Check back shortly!</p>
                                </div>
                            ) : (
                                sortedDates.map((dateStr) => {
                                    const meals = groupedByDate[dateStr];
                                    const dateObj = new Date(dateStr);
                                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                                    
                                    const dailyCals = meals.reduce((sum, m) => sum + (m.food_details?.nutrition?.calories || 0) * (m.quantity || 1), 0);

                                    return (
                                        <div key={dateStr} className="relative pl-12 lg:pl-24">
                                            <div className="absolute top-0 left-0 h-full w-[2px] bg-gray-100 dark:bg-white/5"></div>
                                            <div className="absolute top-0 left-[-6px] w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/50"></div>
                                            
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                                                <div>
                                                    <h2 className={`text-2xl lg:text-4xl font-black uppercase tracking-tighter ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                        {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'long' })}
                                                    </h2>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        {meals.length} {meals.length === 1 ? 'Meal' : 'Meals'} Planned
                                                    </p>
                                                </div>
                                                {dailyCals > 0 && (
                                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                                                        <FiActivity size={14} /> Total Daily: {Math.round(dailyCals)} kcal
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                                                {meals.map((meal) => (
                                                    <div key={meal.id} className={`group relative bg-white dark:bg-gray-900 rounded-[40px] border border-transparent dark:border-white/[0.05] p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${meal.is_consumed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20"></div>
                                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                                            <div className="size-14 rounded-[22px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-colors group-hover:bg-white dark:group-hover:bg-gray-800 shadow-inner">
                                                                {getMealIcon(meal.meal_type_details?.name)}
                                                            </div>
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${meal.is_consumed ? 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30' : 'bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'}`}>
                                                                {meal.is_consumed ? 'Consumed' : 'Pending'}
                                                            </span>
                                                        </div>
                                                        <div className="relative z-10">
                                                            <p className="text-[10px] font-black italic text-indigo-500 uppercase tracking-widest mb-4">
                                                                {meal.meal_type_details?.name || 'Meal'}
                                                            </p>
                                                            <div className="flex items-start justify-between gap-2 mb-4">
                                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                                                                    {meal.food_details?.name}
                                                                </h3>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openFoodRecipe(meal.food)}
                                                                        className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                                                        title="View recipe"
                                                                    >
                                                                        <GiCookingPot size={18} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openFoodNutrition(meal.food)}
                                                                        className="p-2 rounded-xl text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                                                        title="View nutrients"
                                                                    >
                                                                        <FiEye size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="group/note relative">
                                                                {meal.notes ? (
                                                                    <div className="bg-gray-50 dark:bg-white/[0.03] p-4 rounded-2xl mb-6 relative hover:bg-indigo-50/50 dark:hover:bg-white/[0.05] transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-white/10 group-hover:shadow-sm">
                                                                        <p className="text-xs text-gray-500 font-medium italic pr-8">
                                                                            "{meal.notes}"
                                                                        </p>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setEditingNoteId(meal.id);
                                                                                setTempNote(meal.notes || "");
                                                                            }}
                                                                            className="absolute top-3 right-3 opacity-0 group-hover/note:opacity-100 p-1.5 bg-white dark:bg-gray-800 rounded-lg text-indigo-500 shadow-sm border border-gray-100 dark:border-white/10 transition-all hover:scale-110"
                                                                        >
                                                                            <FiEdit2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setEditingNoteId(meal.id);
                                                                            setTempNote("");
                                                                        }}
                                                                        className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl group-hover:shadow-md"
                                                                    >
                                                                        <FiEdit2 size={12} /> Add Special Note
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-3 mb-10">
                                                                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-[10px] font-bold text-gray-500 tracking-wider flex items-center gap-2">
                                                                    <span className="opacity-40">Qty:</span> {meal.quantity}
                                                                </div>
                                                                {meal.food_details?.nutrition?.calories && (
                                                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-[10px] font-bold text-gray-500 tracking-wider flex items-center gap-2">
                                                                        <span className="opacity-40 uppercase">E:</span> {meal.food_details.nutrition.calories} kcal
                                                                    </div>
                                                                )}
                                                                {meal.packaging_material_details?.name && (
                                                                    <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-2">
                                                                        <FiPackage size={12} className="opacity-70" />
                                                                        <span className="opacity-80">Packaging:</span> {meal.packaging_material_details.name}
                                                                    </div>
                                                                )}
                                                                {meal.micro_kitchen_details?.brand_name && (
                                                                    <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-[10px] font-bold text-amber-700 dark:text-amber-300 tracking-wider flex items-center gap-2">
                                                                        <span className="opacity-80">Kitchen:</span> {meal.micro_kitchen_details.brand_name}
                                                                    </div>
                                                                )}
                                                                {meal.delivery && (
                                                                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                                                        meal.delivery.status === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                                                                        meal.delivery.status === 'in_transit' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 animate-pulse' :
                                                                        'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                                    }`}>
                                                                        <FiPackage size={12} />
                                                                        <span className="opacity-70 lowercase font-bold">Delivery:</span> {meal.delivery.status.replace('_', ' ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {(() => {
                                                                const dateMeals = groupedByDate[dateStr];
                                                                const sortedById = [...dateMeals].sort((a, b) => a.id - b.id);
                                                                const idx = sortedById.findIndex((x) => x.id === meal.id);
                                                                if (idx === -1) return null;
                                                                if (idx === 0) {
                                                                    const prevDate = sortedDates[sortedDates.indexOf(dateStr) + 1];
                                                                    const prevDateMeals = prevDate ? groupedByDate[prevDate] : [];
                                                                    const prevKitchen = prevDateMeals[0]?.micro_kitchen;
                                                                    if (
                                                                        meal.micro_kitchen &&
                                                                        prevKitchen &&
                                                                        meal.micro_kitchen !== prevKitchen
                                                                    ) {
                                                                        return (
                                                                            <div className="mb-6 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/40">
                                                                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                                                                                    Kitchen switched from this date
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                }
                                                                return null;
                                                            })()}
                                                            {!meal.is_consumed && (
                                                                <button 
                                                                    onClick={() => handleMarkConsumed(meal.id)}
                                                                    className="w-full py-5 bg-gray-900 dark:bg-indigo-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:shadow-2xl hover:bg-black dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 active:scale-95"
                                                                >
                                                                    Mark as Consumed <FiCheckCircle size={14} />
                                                                </button>
                                                            )}
                                                            {meal.is_consumed && (
                                                                <div className="flex items-center justify-center gap-3 py-5 text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                                                                    <FiCheckCircle size={18} /> Logged at {meal.consumed_at && new Date(meal.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Note Editor Modal */}
            <AnimatePresence>
                {editingNoteId !== null && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10"
                        >
                            <div className="p-8 lg:p-12 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight mb-2">Meal Notes</h2>
                                        <p className="text-gray-400 font-medium italic text-sm leading-relaxed">Add preferences or instructions (e.g., "No onions", "Extra spicy")</p>
                                    </div>
                                    <button 
                                        onClick={() => setEditingNoteId(null)}
                                        className="p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] text-gray-400 hover:text-rose-500 transition-all"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <div className="relative group/field">
                                    <textarea 
                                        value={tempNote}
                                        onChange={(e) => setTempNote(e.target.value)}
                                        placeholder="Enter your special meal requirements..."
                                        className="w-full p-8 bg-gray-50 dark:bg-white/[0.02] border border-transparent dark:border-white/[0.05] rounded-[30px] shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm min-h-[160px] placeholder:text-gray-300 placeholder:font-medium text-gray-700 dark:text-gray-200"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setEditingNoteId(null)}
                                        className="flex-1 py-5 rounded-[22px] border-2 border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={updatingNote}
                                        className="flex-[2] flex items-center justify-center gap-3 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 transition-all"
                                    >
                                        {updatingNote ? <span className="animate-pulse">Updating...</span> : <><FiCheck size={14} /> Update Note</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Food Nutrition Modal */}
            <AnimatePresence>
                {foodNutritionOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-gray-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10"
                        >
                            <div className="p-6 lg:p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {foodNutrition?.food_name || "Food Nutrients"}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setFoodNutritionOpen(false)}
                                        className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-gray-400 hover:text-rose-500"
                                    >
                                        <FiX size={18} />
                                    </button>
                                </div>
                                {foodNutritionLoading ? (
                                    <p className="text-sm text-gray-500">Loading...</p>
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
                                    <p className="text-sm text-gray-500">No nutrition data</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {foodRecipeOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-gray-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col"
                        >
                            <div className="p-8 border-b dark:border-white/5 flex items-start justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <GiCookingPot size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">
                                            {foodRecipe?.name || "Recipe Details"}
                                        </h2>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Cooking Instructions & Ingredients</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFoodRecipeOpen(false)}
                                    className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] text-gray-400 hover:text-rose-500 shadow-sm transition-all"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                                {foodRecipeLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading recipe secrets...</p>
                                    </div>
                                ) : foodRecipe ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Left Side: Image & Ingredients */}
                                        <div className="space-y-10">
                                            {foodRecipe.image && (
                                                <div className="relative rounded-[32px] overflow-hidden aspect-video shadow-xl">
                                                    <img src={foodRecipe.image} alt={foodRecipe.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-8 h-1 bg-indigo-500 rounded-full"></div>
                                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Ingredients</h3>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {foodRecipe.ingredients.length > 0 ? (
                                                        foodRecipe.ingredients.map((ing, idx) => (
                                                            <div key={ing.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.03] rounded-2xl group hover:bg-indigo-50/50 dark:hover:bg-white/[0.05] transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="size-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-indigo-500 shadow-sm">{idx + 1}</span>
                                                                    <div>
                                                                        <p className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">{ing.ingredient_name}</p>
                                                                        {ing.notes && <p className="text-[9px] text-gray-400 font-medium italic">{ing.notes}</p>}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{ing.quantity} {ing.unit_name}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">No ingredients listed.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Description & Steps */}
                                        <div className="space-y-10">
                                            {foodRecipe.description && (
                                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[32px] border border-indigo-100/50 dark:border-indigo-900/20">
                                                    <p className="text-xs leading-relaxed text-indigo-900 dark:text-indigo-300 font-medium italic">
                                                        "{foodRecipe.description}"
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                                                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Cooking Steps</h3>
                                                </div>
                                                <div className="space-y-6">
                                                    {foodRecipe.steps.length > 0 ? (
                                                        foodRecipe.steps.sort((a, b) => a.step_number - b.step_number).map((step) => (
                                                            <div key={step.id} className="relative pl-12">
                                                                <div className="absolute left-0 top-0 size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20">
                                                                    {step.step_number}
                                                                </div>
                                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                                                                    {step.instruction}
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">No steps provided.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <p className="text-gray-400 font-bold">Recipe details are missing for this item.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-gray-50/50 dark:bg-white/[0.02] border-t dark:border-white/5 flex justify-end">
                                <button
                                    onClick={() => setFoodRecipeOpen(false)}
                                    className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-transform"
                                >
                                    Close Recipe
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MealsAllotedPage;
