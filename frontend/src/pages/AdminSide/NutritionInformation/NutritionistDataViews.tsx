import { useState, useCallback, useEffect } from "react";
import {
    FiUser, FiBriefcase, FiCheck, FiFileText, FiClock, FiVideo,
    FiList, FiCalendar, FiHash, FiPackage, FiRefreshCcw, FiHome, FiChevronLeft, FiChevronRight, FiLoader
} from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { InfoRow, InfoSection, EmptyState } from "../PatientOverview/PatientDataViews";
import { createApiUrl } from "../../../access/access";
import { getNutritionistMealsWithMonth, getNutritionistMeetingsPaginated, getNutritionistTicketsPaginated } from "./api";

const getMediaUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

const Sentinel = ({ loading, hasMore }: { loading: boolean; hasMore: boolean }) => (
    <div id="scroll-sentinel" className="py-8 flex justify-center">
        {loading ? (
            <div className="flex flex-col items-center gap-2">
                <FiLoader className="size-6 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading records...</span>
            </div>
        ) : hasMore ? (
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Scroll to load more</div>
        ) : (
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">— End of meeting history —</div>
        )}
    </div>
);

export function DisplayNutritionistInfo({ nutritionist }: { nutritionist: any }) {
    const profile = nutritionist.profile || {};
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
                        <FiUser /> Personal Info
                    </h4>
                    <div className="space-y-1">
                        <InfoRow label="Username" value={nutritionist.username} />
                        <InfoRow label="Email" value={nutritionist.email} />
                        <InfoRow label="Mobile" value={nutritionist.mobile || "N/A"} />
                        <InfoRow label="WhatsApp" value={nutritionist.whatsapp || "N/A"} />
                        <InfoRow label="Gender" value={nutritionist.gender} />
                    </div>
                </section>

                <section className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
                        <FiBriefcase /> Qualification
                    </h4>
                    <div className="space-y-1">
                        <InfoRow label="Qualification" value={profile.qualification || "N/A"} />
                        <InfoRow label="Experience" value={`${profile.years_of_experience || 0} Years`} />
                        <InfoRow label="License" value={profile.license_number || "PENDING"} />
                        <InfoRow label="Status" value={profile.is_verified ? "VERIFIED" : "PENDING VERIFICATION"} />
                    </div>
                </section>

                <section className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
                        <FiCheck /> Channels & Ratings
                    </h4>
                    <div className="space-y-1">
                        <InfoRow label="Available Modes" value={profile.available_modes || "Online"} />
                        <InfoRow label="Rating" value={profile.rating?.toFixed(1) || "0.0"} />
                        <InfoRow label="Total Reviews" value={profile.total_reviews || 0} />
                        <InfoRow label="Consultation" value="Online/Offline" />
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <InfoSection title="Education & Certifications">
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Education</span>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{profile.education || "—"}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Certifications</span>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{profile.certifications || "—"}</p>
                        </div>
                    </div>
                </InfoSection>
                <InfoSection title="About & Specialty">
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Specializations</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {(profile.specializations ? profile.specializations.split(',') : ["General Nutrition"]).map((s: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase tracking-tight">
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Languages</span>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{profile.languages || "English"}</p>
                        </div>
                    </div>
                </InfoSection>
            </div>

            <section>
                <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold mb-4 flex items-center gap-2">
                    Professional Bio
                </h4>
                <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 italic text-sm text-gray-700 dark:text-gray-300">
                    {profile.experience || "No professional bio provided by nutritionist."}
                </div>
            </section>
        </div>
    );
}

export function DisplayNutritionistPatients({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <EmptyState message="Zero active allotments for this nutritionist." />;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
                <div key={p.id} className="p-6 rounded-[32px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 font-black text-lg shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                {p.first_name?.[0]}{p.last_name?.[0]}
                            </div>
                            <div className="min-w-0">
                                <div className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter italic truncate text-lg leading-none mb-1 group-hover:text-blue-600 transition-colors">{p.first_name} {p.last_name}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{p.email}</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter italic">Active</span>
                            <span className="text-[10px] font-bold text-gray-400">#{p.id}</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Assigned Kitchen</span>
                                <div className="flex items-center gap-2">
                                    <div className="size-5 rounded-md bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                                        <FiHome size={12} />
                                    </div>
                                    <span className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter truncate">{p.kitchen_brand}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1 text-right">Since</span>
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{new Date(p.assigned_on).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Reassignment History */}
                        {p.reassignment_history && p.reassignment_history.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <FiRefreshCcw size={10} className="animate-spin-slow" /> Assignment History
                                </span>
                                <div className="space-y-1.5">
                                    {p.reassignment_history.map((h: any, idx: number) => (
                                        <div key={idx} className="px-3 py-2 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-[10px]">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-500 uppercase font-black tracking-tight">From: {h.from}</span>
                                                <span className="text-gray-400 font-bold">{new Date(h.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-amber-800/70 dark:text-amber-400 italic font-medium leading-tight line-clamp-1">{h.reason}: {h.notes || "No notes"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DisplayNutritionistDietPlans({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <EmptyState message="No diet plans suggested yet." />;
    return (
        <div className="space-y-6">
            {items.map((plan) => (
                <div key={plan.id} className="p-8 rounded-[40px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    {/* Decorative element */}
                    <div className="absolute -top-10 -right-10 size-40 bg-amber-500/5 blur-3xl rounded-full group-hover:scale-150 transition-transform"></div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                        <div className="flex items-start gap-6">
                            <div className="p-5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-[24px] shrink-0 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                                <FiFileText size={32} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] mb-2 italic flex items-center gap-2">
                                    <FiClock /> Suggested on {new Date(plan.suggested_on).toLocaleDateString()}
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3 group-hover:text-amber-600 transition-colors">{plan.diet_plan_details?.title}</h3>
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-gray-900 dark:bg-white/10 flex items-center justify-center text-white shrink-0">
                                        <FiUser size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PATIENT</div>
                                        <div className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter truncate">{plan.user_details?.first_name} {plan.user_details?.last_name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 lg:justify-end">
                            <div className="flex flex-col lg:items-end">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Assigned Kitchen</div>
                                <div className="flex items-center gap-2 lg:flex-row-reverse">
                                    <div className="size-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                        <FiHome size={14} />
                                    </div>
                                    <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">{plan.micro_kitchen_details?.brand_name || "NOT ASSIGNED"}</span>
                                </div>
                            </div>
                            <div className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all ${plan.status === 'active' ? "bg-green-600 text-white shadow-green-600/20" :
                                    plan.status === 'completed' ? "bg-blue-600 text-white shadow-blue-600/20" :
                                        plan.status === 'rejected' ? "bg-red-600 text-white shadow-red-600/20" : "bg-amber-50 text-white shadow-amber-500/20"
                                }`}>
                                {plan.status.replace("_", " ")}
                            </div>
                        </div>
                    </div>

                    {/* Kitchen Reassignment History */}
                    {plan.kitchen_reassignments && plan.kitchen_reassignments.length > 0 && (
                        <div className="mt-8 pt-6 border-t dark:border-white/5 space-y-4">
                            <div className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                <FiRefreshCcw size={14} className="animate-spin-slow" /> Kitchen Assignment Logistics
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.kitchen_reassignments.map((kr: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-3xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 text-xs">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Migration</div>
                                                <div className="font-black uppercase tracking-tighter italic"> {kr.from} <span className="text-amber-500 mx-1">→</span> {kr.to}</div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 text-[9px] font-bold text-amber-600 uppercase italic">EFF: {kr.effective_from}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-amber-100/50 dark:border-amber-900/30">
                                            <span className="text-[9px] font-black text-amber-700/60 uppercase">{kr.reason}</span>
                                            <span className="text-[9px] font-bold text-gray-400 font-mono">{new Date(kr.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export function DisplayNutritionistMeals({ items: initialItems, nutritionistId }: { items: any[], nutritionistId: number }) {
    const [viewType, setViewType] = useState<"list" | "calendar">("calendar");
    const [meals, setMeals] = useState(initialItems);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const fetchMeals = useCallback(async (m: number, y: number) => {
        setLoading(true);
        try {
            const data = await getNutritionistMealsWithMonth(nutritionistId, m, y);
            setMeals(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [nutritionistId]);

    const handleMonthChange = (direction: 'next' | 'prev') => {
        let newM = currentMonth;
        let newY = currentYear;
        if (direction === 'next') {
            if (currentMonth === 12) { newM = 1; newY++; }
            else newM++;
        } else {
            if (currentMonth === 1) { newM = 12; newY--; }
            else newM--;
        }
        setCurrentMonth(newM);
        setCurrentYear(newY);
        fetchMeals(newM, newY);
    };

    const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

    return (
        <div className="space-y-6">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-white/60 dark:bg-white/[0.02] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex bg-gray-100 dark:bg-gray-950 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 h-fit shadow-inner">
                        <button
                            onClick={() => setViewType("calendar")}
                            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'calendar'
                                ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <FiCalendar size={16} /> Calendar
                        </button>
                        <button
                            onClick={() => setViewType("list")}
                            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'list'
                                ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <FiList size={16} /> List View
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleMonthChange('prev')}
                        className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                    <div className="text-center min-w-[120px]">
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">{currentYear}</div>
                        <div className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">{monthName}</div>
                    </div>
                    <button
                        onClick={() => handleMonthChange('next')}
                        className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <FiLoader className="size-10 animate-spin text-indigo-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filtering Meal Logs...</p>
                </div>
            ) : meals.length === 0 ? (
                <EmptyState message={`No meal allotments found for ${monthName} ${currentYear}.`} />
            ) : (
                <div className="animate-in fade-in duration-700">
                    {viewType === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                            {meals.map(m => <MealCard key={m.id} m={m} />)}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 right-0 size-64 bg-indigo-500/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>

                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                initialDate={`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`}
                                headerToolbar={false}
                                events={meals.map(m => ({
                                    id: String(m.id),
                                    title: `${m.meal_type_details?.name}: ${m.food_details?.name}`,
                                    start: m.meal_date,
                                    allDay: true,
                                    backgroundColor: m.meal_type_details?.name?.toLowerCase() === 'breakfast' ? '#3b82f6' :
                                        m.meal_type_details?.name?.toLowerCase() === 'lunch' ? '#f59e0b' :
                                            m.meal_type_details?.name?.toLowerCase() === 'dinner' ? '#10b981' : '#4f46e5',
                                    borderColor: 'transparent',
                                    extendedProps: { m }
                                }))}
                                eventContent={(arg) => (
                                    <div
                                        title={`${arg.event.title}\nKitchen: ${arg.event.extendedProps.m.micro_kitchen_details?.brand_name || 'N/A'}\nPatient: ${arg.event.extendedProps.m.user_details?.first_name} ${arg.event.extendedProps.m.user_details?.last_name}`}
                                        className="px-2 py-1 rounded-lg text-[9px] font-black uppercase overflow-hidden truncate transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                                    >
                                        <div className="size-1.5 rounded-full bg-white/60 shrink-0"></div>
                                        {arg.event.title}
                                    </div>
                                )}
                                height="auto"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MealCard({ m }: { m: any }) {
    const kitchenBrand = m.micro_kitchen_details?.brand_name || "NOT ASSIGNED";
    return (
        <div className="group rounded-[40px] border border-gray-100 dark:border-white/[0.05] p-8 bg-white/80 dark:bg-gray-800/40 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-600 font-black text-6xl italic transform rotate-6 scale-150 pointer-events-none">
                {m.meal_type_details?.name?.[0]}
            </div>

            <div className="flex items-start justify-between gap-6 mb-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-[22px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <FiClock size={28} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 italic">{m.meal_date}</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                            {m.meal_type_details?.name || "MEAL"}
                        </div>
                        <div className="flex items-center gap-2">
                            <FiHome size={10} className="text-amber-500" />
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{kitchenBrand}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-5 relative z-10">
                <div className="p-4 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 leading-tight uppercase tracking-tighter flex items-center gap-2">
                        <span className="size-2 bg-indigo-500 rounded-full"></span>
                        {m.food_details?.name || "FOOD ITEM"}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-xl text-white">
                            <FiHash size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Qty {m.quantity || 1}</span>
                        </div>
                        {m.packaging_material_details?.name && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300">
                                <FiPackage size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{m.packaging_material_details.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gray-900 dark:bg-white/10 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
                            <FiUser size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-black text-gray-900 dark:text-white uppercase truncate italic">{m.user_details?.first_name} {m.user_details?.last_name || "PATIENT"}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: #{m.user}</div>
                        </div>
                    </div>

                    {m.food_details?.image && (
                        <div className="hidden sm:block w-14 h-14 rounded-2xl overflow-hidden shadow-md ring-4 ring-gray-100 dark:ring-white/5 group-hover:rotate-6 transition-transform">
                            <img src={getMediaUrl(m.food_details.image)} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function DisplayNutritionistMeetings({ nutritionistId }: { nutritionistId: number }) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMore = useCallback(async (pageNum: number) => {
        if (loading || (!hasMore && pageNum > 1)) return;
        setLoading(true);
        try {
            const data = await getNutritionistMeetingsPaginated(nutritionistId, pageNum);
            const results = data.results || [];
            setItems(prev => pageNum === 1 ? results : [...prev, ...results]);
            setHasMore(!!data.next);
            setError(null);
        } catch (e: any) {
            setError("Failed to load meetings");
        } finally {
            setLoading(false);
        }
    }, [nutritionistId, loading, hasMore]);

    useEffect(() => {
        loadMore(1);
    }, [nutritionistId]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(p => {
                        const next = p + 1;
                        loadMore(next);
                        return next;
                    });
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = document.querySelector("#scroll-sentinel");
        if (sentinel) observer.observe(sentinel);

        return () => observer.disconnect();
    }, [loadMore, hasMore, loading]);

    if (error && items.length === 0) return <div className="p-8 text-center text-red-500 font-bold uppercase italic tracking-widest">{error}</div>;
    if (!loading && items.length === 0) return <EmptyState message="No meeting records found." />;

    return (
        <div className="space-y-4">
            {items.map((meet) => (
                <div key={meet.id} className="p-6 rounded-[32px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-xl transition-all">
                    <div className="flex items-start gap-5">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[20px] group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <FiVideo size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em] mb-2 font-mono">Patient Interaction #{meet.id}</div>
                            <div className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 italic">Meet with {meet.patient_details?.first_name} {meet.patient_details?.last_name}</div>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 italic uppercase">
                                <FiClock size={14} className="text-blue-500" /> Requested: {meet.preferred_date} AT {meet.preferred_time}
                            </div>
                            {meet.status === 'approved' && meet.scheduled_datetime && (
                                <div className="text-[10px] font-black text-green-600 mt-2 uppercase tracking-tight italic bg-green-50 dark:bg-green-900/10 px-4 py-1 rounded-full inline-block border border-green-100 dark:border-green-900/30 shadow-sm animate-pulse-slow">
                                    Confirmed: {new Date(meet.scheduled_datetime).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${meet.status === 'completed' ? "bg-green-50 text-green-700 border-green-100" :
                                meet.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                                    meet.status === 'approved' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                            {meet.status}
                        </div>
                        {meet.meeting_link && (
                            <a href={meet.meeting_link} target="_blank" rel="noreferrer" className="px-6 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white active:scale-95 shadow-lg shadow-gray-900/10">
                                Launch Virtual Session
                            </a>
                        )}
                    </div>
                </div>
            ))}
            <Sentinel loading={loading} hasMore={hasMore} />
        </div>
    );
}

export function DisplayNutritionistReviews({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <EmptyState message="No reviews yet for this nutritionist." />;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((r: any) => (
                    <div key={r.id} className="rounded-[40px] border border-gray-100 dark:border-white/[0.05] p-8 bg-white dark:bg-gray-800/30 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 text-6xl text-amber-500/5 font-black italic -mr-4 -mt-4 group-hover:scale-125 transition-transform">★</div>

                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-lg shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    {r.patient_details?.first_name?.[0] || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg leading-tight truncate">
                                        {[r.patient_details?.first_name, r.patient_details?.last_name].filter(Boolean).join(" ") || "Verified User"}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest italic">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "Historical Record"}</div>
                                </div>
                            </div>
                            <div className="px-5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-black text-lg border border-amber-100 dark:border-amber-900/30 flex items-center gap-1 shadow-sm">
                                {r.rating} <span className="text-xs">★</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-2 top-0 text-3xl text-indigo-200 dark:text-indigo-900/40 font-serif leading-none">&ldquo;</div>
                            <p className="text-base text-gray-700 dark:text-gray-300 italic leading-relaxed pl-4 pr-2 font-medium">&quot; {r.review || "No verbal feedback provided by patient."} &quot;</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DisplayNutritionistTickets({ nutritionistId }: { nutritionistId: number }) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMore = useCallback(async (pageNum: number) => {
        if (loading || (!hasMore && pageNum > 1)) return;
        setLoading(true);
        try {
            const data = await getNutritionistTicketsPaginated(nutritionistId, pageNum);
            const results = data.results || [];
            setItems(prev => pageNum === 1 ? results : [...prev, ...results]);
            setHasMore(!!data.next);
            setError(null);
        } catch (e: any) {
            setError("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, [nutritionistId, loading, hasMore]);

    useEffect(() => {
        loadMore(1);
    }, [nutritionistId]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(p => {
                        const next = p + 1;
                        loadMore(next);
                        return next;
                    });
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = document.querySelector("#scroll-sentinel");
        if (sentinel) observer.observe(sentinel);

        return () => observer.disconnect();
    }, [loadMore, hasMore, loading]);

    if (error && items.length === 0) return <div className="p-8 text-center text-red-500 font-bold uppercase italic tracking-widest">{error}</div>;
    if (!loading && items.length === 0) return <EmptyState message="No support requests found." />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {items.map((t: any) => (
                    <div key={t.id} className="rounded-[44px] border border-gray-100 dark:border-white/[0.05] p-10 bg-white/60 dark:bg-gray-800/30 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        {/* Status accent bar */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${t.status === 'open' ? 'bg-amber-500' :
                                t.status === 'resolved' ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>

                        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                            <div className="space-y-4 max-w-3xl">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-xl">TRACKER ID: #{t.id}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${t.status === 'open' ? 'bg-amber-100/50 text-amber-700 border-amber-200' :
                                                t.status === 'resolved' ? 'bg-green-100/50 text-green-700 border-green-200' :
                                                    'bg-gray-100/50 text-gray-700 border-gray-200'
                                            }`}>
                                            {t.status}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${t.priority === 'high' ? 'bg-red-600 text-white shadow-red-600/20' :
                                                t.priority === 'medium' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-indigo-600 text-white shadow-indigo-600/20'
                                            }`}>
                                            {t.priority} PRIORITY
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10">{t.category_details?.name || "Support"}</span>
                                </div>
                                <h4 className="text-3xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors leading-[1]">{t.title}</h4>
                            </div>
                            <div className="text-right text-[11px] text-gray-400 font-black uppercase italic bg-gray-50 dark:bg-white/[0.02] px-5 py-2 rounded-2xl border border-gray-100 dark:border-white/5 h-fit shadow-inner">
                                {new Date(t.created_at).toLocaleString()}
                            </div>
                        </div>

                        {/* From/To Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-5 rounded-3xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                                <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 italic">FROM (CREATOR)</div>
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 shadow-sm font-black uppercase italic border border-blue-100 dark:border-blue-900/30">
                                        {t.created_by_details?.first_name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.created_by_details?.first_name} {t.created_by_details?.last_name}</div>
                                        <div className="text-[9px] font-bold text-blue-500/70 uppercase tracking-tighter italic">{t.created_by_details?.role?.replace('_', ' ')}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20">
                                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 italic">TO (ASSIGNED TO)</div>
                                {t.assigned_to_details ? (
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-600 shadow-sm font-black uppercase italic border border-indigo-100 dark:border-indigo-900/30">
                                            {t.assigned_to_details?.first_name?.[0] || 'A'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.assigned_to_details?.first_name} {t.assigned_to_details?.last_name}</div>
                                            <div className="text-[9px] font-bold text-indigo-500/70 uppercase tracking-tighter italic">{t.assigned_to_details?.role?.replace('_', ' ')}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center h-10 italic text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unassigned</div>
                                )}
                            </div>
                        </div>

                        <div className="relative mb-8">
                            <div className="text-base text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-white/[0.01] p-8 rounded-[32px] border border-gray-100/50 dark:border-white/5 shadow-inner">
                                {t.description || "No problem dossier provided."}
                            </div>
                        </div>

                        {t.admin_response && (
                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/[0.05] relative">
                                <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-3 mb-4 italic">
                                    <div className="size-2.5 bg-indigo-600 rounded-full animate-ping"></div>
                                    Resolution Statement
                                </div>
                                <div className="p-8 rounded-[32px] bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 text-indigo-600 text-5xl font-black italic">SOLVED</div>
                                    <p className="text-lg text-gray-700 dark:text-gray-200 italic font-bold tracking-tight relative z-10 leading-snug">&quot; {t.admin_response} &quot;</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <Sentinel loading={loading} hasMore={hasMore} />
        </div>
    );
}

export function DisplayNutritionistPayouts({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <EmptyState message="No patient-linked payout records found." />;
    return (
        <div className="space-y-8 pb-12">
            {items.map((group: any) => {
                if (!group || !group.patient) return null;
                return (
                    <div key={group.patient.id} className="p-8 rounded-[44px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm overflow-hidden relative group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b dark:border-white/5">
                            <div className="flex items-center gap-5">
                                <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner uppercase italic">
                                    {group.patient.name?.[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none mb-2">{group.patient.name}</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FiUser size={12} /> ID: #{group.patient.id}</span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FiList size={12} /> {group.trackers.length} Active Records</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Recipient: Nutritionist</div>
                                <div className="px-5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase italic tracking-widest border border-blue-100 dark:border-blue-900/30 shadow-sm">
                                    Financial Audit Tracked
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {group.trackers.map((p: any) => (
                                <div key={p.id} className="rounded-3xl border border-gray-100 dark:border-white/[0.05] p-6 bg-gray-50/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all relative overflow-hidden group/card shadow-sm hover:shadow-xl">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="min-w-0">
                                            <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 italic">
                                                #{p.id} · {p.payout_type?.toUpperCase()} · SNAPSHOT: {p.snapshot}
                                            </div>
                                            <div className="text-[15px] font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-tight truncate overflow-visible">
                                                {p.recipient_label}
                                            </div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1.5 opacity-60">
                                                <FiCalendar size={10} /> {p.period_from} → {p.period_to}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic shadow-sm border ${p.status === 'paid' ? "text-green-600 bg-green-50/50 border-green-100" : p.status === 'pending' ? "text-amber-600 bg-amber-50/50 border-amber-100" : "text-blue-600 bg-blue-50/50 border-blue-100"
                                            }`}>
                                            {p.status}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between gap-4 mt-6">
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Remaining</div>
                                            <div className={`text-lg font-black ${parseFloat(p.remaining_amount) > 0 ? 'text-amber-600' : 'text-green-600'}`}>₹{parseFloat(p.remaining_amount).toFixed(2)}</div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Share (%{p.shared_percentage})</div>
                                            <div className="text-lg font-black text-gray-900 dark:text-white italic">₹{parseFloat(p.total_amount).toFixed(2)}</div>
                                        </div>
                                    </div>

                                    {p.nutritionist_reassignments && p.nutritionist_reassignments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t dark:border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FiRefreshCcw size={10} className="text-amber-500 animate-spin-slow" />
                                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Migration Log</span>
                                            </div>
                                            <div className="space-y-1">
                                                {p.nutritionist_reassignments.map((nr: any, idx: number) => (
                                                    <div key={idx} className="text-[9px] text-gray-400 italic font-medium"> {nr.from} → {nr.to} · {nr.reason} ({new Date(nr.date).toLocaleDateString()})</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function DisplayNutritionistAvailability({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <EmptyState message="No availability slots configured." />;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 size-64 bg-emerald-500/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>

                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek'
                    }}
                    events={items.map((slot) => ({
                        id: String(slot.id),
                        title: `${slot.start_time} - ${slot.end_time} ${slot.is_booked ? '(BOOKED)' : '(AVAILABLE)'}`,
                        start: `${slot.date}T${slot.start_time}`,
                        end: `${slot.date}T${slot.end_time}`,
                        backgroundColor: slot.is_booked ? '#ef4444' : '#10b981',
                        borderColor: 'transparent',
                        extendedProps: { slot }
                    }))}
                    eventContent={(arg) => (
                        <div
                            title={`Time: ${arg.event.extendedProps.slot.start_time} - ${arg.event.extendedProps.slot.end_time}\nStatus: ${arg.event.extendedProps.slot.is_booked ? 'Booked' : 'Available'}`}
                            className="px-2 py-1 rounded-lg text-[9px] font-black uppercase overflow-hidden truncate transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                        >
                            <div className={`size-1.5 rounded-full shrink-0 ${arg.event.extendedProps.slot.is_booked ? 'bg-white' : 'bg-white/80'}`}></div>
                            {arg.event.title}
                        </div>
                    )}
                    height="auto"
                />
            </div>
        </div>
    );
}
