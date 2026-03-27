import { useState } from "react";
import { 
    FiUser, FiBriefcase, FiCheck, FiFileText, FiClock, FiVideo,
    FiList, FiCalendar, FiHash, FiPackage
} from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { InfoRow, InfoSection, EmptyState } from "../PatientOverview/PatientDataViews";
import { createApiUrl } from "../../../access/access";

const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
                <div key={p.id} className="p-5 rounded-[24px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 font-bold shrink-0">
                                {p.first_name?.[0]}{p.last_name?.[0]}
                            </div>
                            <div className="min-w-0">
                                <div className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter italic truncate">{p.first_name} {p.last_name}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{p.email}</div>
                            </div>
                        </div>
                        {p.reassignment_details && (
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter italic">Reassigned</span>
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">{p.reassignment_details.effective_from}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 pt-3 border-t dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase">Assigned On</span>
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{new Date(p.assigned_on).toLocaleDateString()}</span>
                            </div>
                            <div className="size-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        </div>
                        {p.reassignment_details && (
                             <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-[9px]">
                                 <span className="text-gray-500 uppercase font-medium">From:</span>{" "}
                                 <span className="text-amber-700 dark:text-amber-400 font-black uppercase tracking-tighter line-through decoration-amber-300 ml-1">{p.reassignment_details.previous_nutritionist}</span>
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
        <div className="space-y-4">
            {items.map((plan) => (
                <div key={plan.id} className="p-6 rounded-[32px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl shrink-0">
                            <FiFileText size={24} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-1 italic">Suggested on {new Date(plan.suggested_on).toLocaleDateString()}</div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{plan.diet_plan_details?.title}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-500 italic uppercase">Patient:</span>
                                <span className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">{plan.user_details?.first_name} {plan.user_details?.last_name}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right shrink-0">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kitchen</div>
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{plan.micro_kitchen_details?.brand_name || "NOT ASSIGNED"}</div>
                        </div>
                        <div className="px-5 py-2 rounded-full border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-gray-900/40">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${
                                 plan.status === 'active' ? "text-green-600" :
                                 plan.status === 'completed' ? "text-blue-600" :
                                 plan.status === 'rejected' ? "text-red-600" : "text-amber-600"
                             }`}>{plan.status.replace("_", " ")}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DisplayNutritionistMeals({ items, patients }: { items: any[], patients: any[] }) {
    const [viewType, setViewType] = useState<"list" | "calendar">("list");
    const [selectedPatient, setSelectedPatient] = useState<number | "all">("all");

    const filteredItems = items.filter(m => {
        if (selectedPatient === "all") return true;
        return m.user === selectedPatient;
    });

    if (!items || items.length === 0) return <EmptyState message="No food allotments (meals) found." />;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 bg-white/60 dark:bg-white/[0.02] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Patient Selector */}
                <div className="flex flex-col gap-2 flex-grow max-w-2xl">
                    <label className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.2em] ml-2 italic">Select Client to Filter</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                        <button
                            onClick={() => setSelectedPatient("all")}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                                selectedPatient === "all"
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105"
                                : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-white/5"
                            }`}
                        >
                            All Clients
                        </button>
                        {patients.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPatient(p.id)}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
                                    selectedPatient === p.id
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105"
                                    : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-white/5"
                                }`}
                            >
                                <span className="size-4 rounded-md bg-white/20 flex items-center justify-center text-[8px]">{p.first_name?.[0]}{p.last_name?.[0]}</span>
                                {p.first_name} {p.last_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex bg-gray-100 dark:bg-gray-950 p-1.5 rounded-2xl self-end md:self-center border border-gray-200 dark:border-white/5 h-fit shadow-inner">
                    <button
                        onClick={() => setViewType("list")}
                        className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'list'
                        ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <FiList size={16} /> List
                    </button>
                    <button
                        onClick={() => setViewType("calendar")}
                        className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'calendar'
                        ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <FiCalendar size={16} /> Calendar
                    </button>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="py-20 animate-in fade-in duration-500">
                    <EmptyState message={`No meals found for ${selectedPatient === 'all' ? 'any client' : 'this client'}.`} />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {viewType === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                            {filteredItems.map(m => <MealCard key={m.id} m={m} />)}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 size-64 bg-indigo-500/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                            
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                                events={filteredItems.map(m => ({
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
                                        title={`${arg.event.title}\nPatient: ${arg.event.extendedProps.m.user_details?.first_name} ${arg.event.extendedProps.m.user_details?.last_name}\nQty: ${arg.event.extendedProps.m.quantity}`}
                                        className="px-2 py-1 rounded-lg text-[10px] font-black uppercase overflow-hidden truncate transition-all hover:scale-110 hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                                    >
                                        <div className="size-2 rounded-full bg-white/40 shrink-0"></div>
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
    return (
        <div className="group rounded-[40px] border border-gray-100 dark:border-white/[0.05] p-8 bg-white/80 dark:bg-gray-800/40 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
            {/* Detail Overlay on hover */}
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-600 font-black text-6xl italic transform rotate-6 scale-150 pointer-events-none">
                {m.meal_type_details?.name?.[0]}
            </div>

            <div className="flex items-start gap-6 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-[22px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <FiClock size={28} />
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-black text-indigo-400 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1 italic">{m.meal_date}</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover:text-indigo-600 transition-colors truncate leading-none">
                        {m.meal_type_details?.name || "MEAL"}
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
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20 antialiased">
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
                        <div className="w-11 h-11 rounded-2xl bg-gray-900 dark:bg-white/10 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors shadow-lg">
                            <FiUser size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-black text-gray-900 dark:text-white uppercase truncate italic">{m.user_details?.first_name} {m.user_details?.last_name || "PATIENT"}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Patient ID: {m.user}</div>
                        </div>
                    </div>

                    {m.food_details?.image && (
                        <div className="hidden sm:block w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-4 ring-gray-100 dark:ring-white/5 transform group-hover:rotate-6 transition-transform">
                            <img src={getMediaUrl(m.food_details.image)} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function DisplayNutritionistMeetings({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <EmptyState message="No meeting records found." />;
    return (
        <div className="space-y-4">
            {items.map((meet) => (
                <div key={meet.id} className="p-6 rounded-[32px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                            <FiVideo size={24} />
                        </div>
                        <div>
                             <div className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-1">Meet with {meet.patient_details?.first_name}</div>
                             <div className="flex items-center gap-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                                 <FiClock size={16} className="text-blue-500" /> {meet.preferred_date} AT {meet.preferred_time}
                             </div>
                             {meet.status === 'approved' && meet.scheduled_datetime && (
                                 <div className="text-xs font-bold text-green-600 mt-2 uppercase tracking-tight italic bg-green-50 dark:bg-green-900/10 px-3 py-1 rounded-xl inline-block">
                                     Scheduled: {new Date(meet.scheduled_datetime).toLocaleString()}
                                 </div>
                             )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                         <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                             meet.status === 'completed' ? "bg-green-50 text-green-700 border-green-100" :
                             meet.status === 'rejected' ? "bg-red-50 text-red-700 border-red-100" :
                             meet.status === 'approved' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"
                         }`}>
                             {meet.status}
                         </div>
                         {meet.meeting_link && (
                             <a href={meet.meeting_link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase transition-all hover:translate-x-1 flex items-center gap-1 italic underline decoration-2 underline-offset-4">
                                 Join MEETING
                             </a>
                         )}
                    </div>
                </div>
            ))}
        </div>
    );
}
