import React, { useState } from "react";
import { FiClock, FiInfo, FiCheck, FiList, FiCalendar, FiUser, FiPackage, FiHash } from "react-icons/fi";
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

export function DisplayKitchenInfo({ kitchen }: { kitchen: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
            <FiInfo /> Basic Info
          </h4>
          <div className="space-y-1">
            <InfoRow label="Owner" value={`${kitchen.user_details?.first_name} ${kitchen.user_details?.last_name}`} />
            <InfoRow label="Email" value={kitchen.user_details?.email} />
            <InfoRow label="Mobile" value={kitchen.user_details?.mobile} />
            <InfoRow label="Cuisine" value={kitchen.cuisine_type} />
            <InfoRow label="Meal Type" value={kitchen.meal_type} />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
            <FiCheck /> Compliance
          </h4>
          <div className="space-y-1">
            <InfoRow label="FSSAI No" value={kitchen.fssai_no || "N/A"} />
            <InfoRow label="PAN No" value={kitchen.pan_no || "N/A"} />
            <InfoRow label="GST No" value={kitchen.gst_no || "N/A"} />
            <InfoRow label="Area" value={`${kitchen.kitchen_area} sq.ft`} />
            <InfoRow label="Platform" value={`${kitchen.platform_area} sq.ft`} />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
            <FiClock /> Operations
          </h4>
          <div className="space-y-1">
            <InfoRow label="LPG Cylinders" value={kitchen.lpg_cylinders} />
            <InfoRow label="Staff Count" value={kitchen.no_of_staff} />
            <InfoRow label="Water Source" value={kitchen.water_source} />
            <InfoRow label="Purification" value={kitchen.purification_type?.toUpperCase()} />
          </div>
        </section>
      </div>

      <section>
        <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold mb-4 flex items-center gap-2">
          Kitchen Photos & Certificates
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Exterior", url: kitchen.photo_exterior },
            { label: "Entrance", url: kitchen.photo_entrance },
            { label: "Kitchen", url: kitchen.photo_kitchen },
            { label: "Platform", url: kitchen.photo_platform },
            { label: "FSSAI Cert", url: kitchen.fssai_cert },
          ].map((img, idx) => {
            const src = typeof img.url === "string" ? getMediaUrl(img.url) : null;
            return (
              <div
                key={idx}
                className="group relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.05]"
              >
                {src ? (
                  <img src={src} alt={img.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
          Questionnaire / About
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoSection title="About Owner">
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{kitchen.about_you || "—"}</p>
          </InfoSection>
          <InfoSection title="Passion & Health">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Passion:</span>
                <p className="text-sm text-gray-700 dark:text-gray-200">{kitchen.passion_for_cooking || "—"}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Health Info:</span>
                <p className="text-sm text-gray-700 dark:text-gray-200">{kitchen.health_info || "—"}</p>
              </div>
            </div>
          </InfoSection>
          <InfoSection title="Constraints">
            <p className="text-sm text-gray-700 dark:text-gray-200">{kitchen.constraints || "—"}</p>
          </InfoSection>
        </div>
      </section>
    </div>
  );
}

export function DisplayKitchenPatients({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No patients assigned to this kitchen." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((x: any) => (
        <div key={x.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/60 dark:bg-gray-800/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-base">
                {[x.user_details?.first_name, x.user_details?.last_name].filter(Boolean).join(" ") || "Patient"}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  x.status === 'active' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}>
                  {x.status.replace("_", " ")}
                </span>
                <span>ID: {x.user}</span>
              </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-black text-gray-400 uppercase">Period</div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{x.start_date || "—"}</div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{x.end_date || "—"}</div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-white/5">
             <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Diet Plan</div>
             <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{x.diet_plan_details?.title || "—"}</div>
             <div className="mt-2 flex flex-wrap gap-1">
                {(x.meal_dates || []).slice(0, 5).map((d: string, idx: number) => (
                    <span key={idx} className="text-[9px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">{d}</span>
                ))}
                {(x.meal_dates || []).length > 5 && <span className="text-[9px] text-gray-400">+{x.meal_dates.length - 5} more</span>}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenInspections({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No inspection history found." />;
  return (
    <div className="space-y-4">
      {items.map((ins: any) => (
        <div key={ins.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/60 dark:bg-gray-800/30 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-lg">
                Inspection Record #{ins.id}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium"><FiClock size={12}/> {ins.inspection_date}</span>
                <span className="flex items-center gap-1 font-medium italic">Inspector: {ins.inspector_details?.username || "Admin"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="text-center px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                  <div className="text-[10px] font-black text-indigo-400 uppercase italic">Overall Score</div>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{ins.overall_score ?? "—"} <span className="text-xs font-normal">/ 10</span></div>
               </div>
               <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  ins.status === 'approved' ? "bg-green-100 text-green-700" : 
                  ins.status === 'rejected' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
               }`}>
                  {ins.status}
               </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             {[
               { label: "Ext Clean", score: ins.external_cleanliness },
               { label: "Int Clean", score: ins.interior_cleanliness },
               { label: "Plat Adeq", score: ins.kitchen_platform_adequacy },
               { label: "Plat Neat", score: ins.kitchen_platform_neatness },
               { label: "Safety", score: ins.safety },
               { label: "Water", score: ins.pure_water },
               { label: "Storage", score: ins.storage_facilities },
               { label: "Staff", score: ins.support_staff },
             ].map((score, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-white/5 text-center">
                   <div className="text-[9px] font-black text-gray-400 uppercase">{score.label}</div>
                   <div className="font-bold text-gray-900 dark:text-white">{score.score ?? "—"}</div>
                </div>
             ))}
          </div>

          {(ins.notes || ins.recommendation) && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-sm italic text-gray-700 dark:text-gray-300">
               {ins.notes && <p>&quot; {ins.notes} &quot;</p>}
               {ins.recommendation && <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-500">Rec: {ins.recommendation}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenReviews({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No reviews yet for this kitchen." />;
  return (
    <div className="space-y-4">
      {items.map((r: any) => (
        <div key={r.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/60 dark:bg-gray-800/30 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
               <div className="font-bold text-gray-900 dark:text-white">
                 {[r.user_details?.first_name, r.user_details?.last_name].filter(Boolean).join(" ") || "User"}
               </div>
               <div className="text-xs text-gray-500 mt-1 italic">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-black">
               {r.rating} ★
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 italic">&quot; {r.review || "No comments"} &quot;</p>
          <div className="mt-3 text-[10px] text-gray-400 uppercase font-black">Linked Order #{r.order || "N/A"}</div>
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenOrders({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No orders found." />;
  return (
    <div className="space-y-4">
      {items.map((o: any) => (
        <div key={o.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-4 bg-white/60 dark:bg-gray-800/30 shadow-sm flex flex-wrap items-center justify-between gap-4 hover:shadow-md transition-all">
          <div className="flex-1 min-w-[200px]">
             <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 dark:text-white text-base">Order #{o.id}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  o.status === 'delivered' ? "bg-green-100 text-green-700" : o.status === 'cancelled' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                   {o.status}
                </span>
             </div>
             <div className="text-xs text-gray-500 flex items-center gap-3">
                <span>{o.order_type?.toUpperCase()}</span>
                <span>•</span>
                <span>{o.created_at ? new Date(o.created_at).toLocaleString() : "—"}</span>
             </div>
             <div className="text-[11px] text-gray-500 mt-2 truncate max-w-md">📍 {o.delivery_address || "No address"}</div>
          </div>
          <div className="text-right">
             <div className="text-xs text-gray-400 font-bold uppercase">Total Amount</div>
             <div className="text-xl font-black text-gray-900 dark:text-white">₹ {o.total_amount ?? 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenFoods({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No foods available in menu right now." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((f: any) => (
        <div key={f.id} className="group rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-white/80 dark:bg-gray-800/40 p-5 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all">
          <div className="flex justify-between items-start mb-4">
             <div className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors">{f.food_details?.name || "Food"}</div>
             <div className="text-lg font-black text-blue-600 dark:text-blue-400 italic">₹ {f.price ?? 0}</div>
          </div>
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiClock className="text-blue-500" /> <span>Prep: {f.preparation_time || "—"}</span>
             </div>
             <div className={`text-[10px] font-black inline-flex px-2 py-0.5 rounded-full ${
               f.is_available ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
             }`}>
                {f.is_available ? "INSTOCK" : "UNAVAILABLE"}
             </div>
          </div>
          {f.food_details?.description && (
             <p className="mt-4 text-xs text-gray-500 line-clamp-2 italic leading-relaxed">
                {f.food_details.description}
             </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenDailyPrep({ items }: { items: any[] }) {
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [filterType, setFilterType] = useState<"today" | "tomorrow" | "thisWeek" | "all">("today");

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 864e5).toISOString().split('T')[0];
  
  const getWeekRange = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay();
    const last = first + 6;
    return {
       start: new Date(curr.setDate(first)).toISOString().split('T')[0],
       end: new Date(curr.setDate(last)).toISOString().split('T')[0]
    };
  };
  const weekRange = getWeekRange();

  const filteredItems = items.filter(m => {
    if (filterType === "today") return m.meal_date === today;
    if (filterType === "tomorrow") return m.meal_date === tomorrow;
    if (filterType === "thisWeek") return m.meal_date >= weekRange.start && m.meal_date <= weekRange.end;
    return true;
  });

  return (
    <div className="space-y-6">
       {/* High-Performance Controls */}
       <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/60 dark:bg-white/[0.02] p-4 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
             {[
               { id: "today", label: "Today" },
               { id: "tomorrow", label: "Tomorrow" },
               { id: "thisWeek", label: "This Week" },
               { id: "all", label: "See All" }
             ].map(f => (
                <button
                   key={f.id}
                   onClick={() => setFilterType(f.id as any)}
                   className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     filterType === f.id 
                     ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105" 
                     : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                   }`}
                >
                   {f.label}
                </button>
             ))}
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-950 p-1.5 rounded-2xl self-end md:self-auto border border-gray-200 dark:border-white/5">
             <button 
                onClick={() => setViewType("list")}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                   viewType === 'list' 
                   ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" 
                   : "text-gray-400 hover:text-gray-600"
                }`}
             >
                <FiList size={16} /> List
             </button>
             <button 
                onClick={() => setViewType("calendar")}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                   viewType === 'calendar' 
                   ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" 
                   : "text-gray-400 hover:text-gray-600"
                }`}
             >
                <FiCalendar size={16} /> Grid
             </button>
          </div>
       </div>

       {filteredItems.length === 0 ? (
          <div className="py-20">
             <EmptyState message={`No preparation tasks found for ${filterType === 'all' ? 'this history' : filterType}.`} />
          </div>
       ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             {viewType === "list" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                   {filteredItems.map(m => <MealCard key={m.id} m={m} />)}
                </div>
             ) : (
                <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl relative">
                   <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                      events={filteredItems.map(m => ({
                         id: String(m.id),
                         title: `${m.meal_type_details?.name}: ${m.food_details?.name}`,
                         start: m.meal_date,
                         allDay: true,
                         backgroundColor: '#4f46e5',
                         borderColor: 'transparent',
                         extendedProps: { m }
                      }))}
                      eventContent={(arg) => (
                         <div 
                            title={`${arg.event.title}\nPatient: ${arg.event.extendedProps.m.user_details?.first_name} ${arg.event.extendedProps.m.user_details?.last_name}\nQty: ${arg.event.extendedProps.m.quantity}`}
                            className="px-2 py-1 rounded-lg text-[9px] font-black uppercase overflow-hidden truncate transition-all hover:bg-amber-500 cursor-pointer"
                         >
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
               <div className="text-[10px] font-black text-indigo-400 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1">{m.meal_date}</div>
               <div className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover:text-indigo-600 transition-colors truncate">
                  {m.meal_type_details?.name}
               </div>
            </div>
         </div>

         <div className="space-y-5 relative z-10">
            <div className="p-4 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
               <div className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 leading-tight">{m.food_details?.name}</div>
               <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                     <FiHash size={12} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Qty {m.quantity}</span>
                  </div>
                  {m.packaging_material_details?.name && (
                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300">
                        <FiPackage size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{m.packaging_material_details.name}</span>
                     </div>
                  )}
               </div>
            </div>

            <div className="pt-5 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gray-900 dark:bg-white/10 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors shadow-lg">
                     <FiUser size={18} />
                  </div>
                  <div className="min-w-0">
                     <div className="text-sm font-black text-gray-900 dark:text-white uppercase truncate">{m.user_details?.first_name} {m.user_details?.last_name}</div>
                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Logistics Destination</div>
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
