import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyMeals, markAsConsumed } from "./api";
import type { UserMeal } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiClock, FiCheckCircle, FiActivity, FiCalendar } from "react-icons/fi";
import { GiBreadSlice, GiBowlOfRice, GiHamburger, GiCookingPot } from "react-icons/gi";

const MealsAllotedPage: React.FC = () => {
    const [allMeals, setAllMeals] = useState<UserMeal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        setLoading(true);
        try {
            const meals = await getMyMeals();
            // Sort by date descending then by meal type
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

    const handleMarkConsumed = async (id: number) => {
        try {
            await markAsConsumed(id);
            setAllMeals(prev => prev.map(m => m.id === id ? { ...m, is_consumed: true, consumed_at: new Date().toISOString() } : m));
            toast.success("Great job! Meal logged. 🍱");
        } catch (err) {
            toast.error("Failed to log consumption");
        }
    };

    // Grouping by Date
    const groupedByDate: Record<string, UserMeal[]> = allMeals.reduce((acc, meal) => {
        const date = meal.meal_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(meal);
        return acc;
    }, {} as Record<string, UserMeal[]>);

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
    
    // Icon mapping for meal types
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
                    {/* Hero Stats */}
                    <div className="bg-indigo-600 rounded-[50px] p-8 lg:p-16 text-white shadow-2xl shadow-indigo-200/50 dark:shadow-none flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden transition-all hover:scale-[1.01]">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse"></div>
                        <div className="z-10">
                            <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                                Fuel Your <br/> Journey
                            </h1>
                            <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-white/30"></div> 
                                Nutrition Roadmap
                            </p>
                        </div>
                        <div className="flex gap-8 z-10">
                            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 text-center min-w-[140px]">
                                <FiActivity size={32} className="mx-auto mb-3 text-emerald-300" />
                                <span className="block text-2xl font-black">{allMeals.filter(m => m.is_consumed).length}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Finished</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 text-center min-w-[140px]">
                                <FiClock size={32} className="mx-auto mb-3 text-amber-300" />
                                <span className="block text-2xl font-black">{allMeals.filter(m => !m.is_consumed).length}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Upcoming</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-16">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <div className="w-16 h-16 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing nutrition profile...</p>
                            </div>
                        ) : sortedDates.length === 0 ? (
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
                                
                                // Total Daily Calories (dummy if not in food detail)
                                const dailyCals = meals.reduce((sum, m) => sum + (m.food_details?.nutrition?.calories || 0) * (m.quantity || 1), 0);

                                return (
                                    <div key={dateStr} className="relative pl-12 lg:pl-24">
                                        {/* Date Side Indicator */}
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
                                                    {/* Background Pattern */}
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
                                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                                                            {meal.food_details?.name}
                                                        </h3>
                                                        
                                                        {meal.notes && (
                                                            <p className="text-xs text-gray-400 font-medium mb-6 italic line-clamp-2">
                                                                "{meal.notes}"
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-3 mb-10">
                                                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-[10px] font-bold text-gray-500 tracking-wider flex items-center gap-2">
                                                                <span className="opacity-40">Qty:</span> {meal.quantity}
                                                            </div>
                                                            {meal.food_details?.nutrition?.calories && (
                                                                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-[10px] font-bold text-gray-500 tracking-wider flex items-center gap-2">
                                                                    <span className="opacity-40 uppercase">E:</span> {meal.food_details.nutrition.calories} kcal
                                                                </div>
                                                            )}
                                                        </div>

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
                </div>
            </div>
        </>
    );
};

export default MealsAllotedPage;
