import { useState, useEffect } from "react";
import { FiClock, FiInfo, FiCheck, FiList, FiCalendar, FiUser, FiPackage, FiHash, FiNavigation2, FiRefreshCcw, FiStar, FiTruck, FiClipboard } from "react-icons/fi";
import { haversineKm, parseGeoCoord } from "../../../utils/haversineKm";
import { fetchUserById } from "../PatientOverview/api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { InfoRow, InfoSection, EmptyState } from "../PatientOverview/PatientDataViews";
import { createApiUrl } from "../../../access/access";
import { AdminOrderList } from "../shared/AdminOrderList";
import type {
  AdminMicroKitchenPatientCard,
  AdminKitchenDeliveryProfile,
  AdminKitchenGlobalAssignment,
  AdminKitchenMealDeliveryAssignment,
  AdminKitchenPlannedLeave,
  AdminKitchenTeamMember,
  DeliveryChargeSlabAdmin,
} from "./api";

const formatPersonName = (person: any) => {
  if (!person) return "N/A";
  const name = `${person.first_name || ""} ${person.last_name || ""}`.trim();
  return name || person.username || person.email || "Unknown";
};

const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

function DenseInfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col py-1.5 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
      <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-0.5">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-all leading-tight">
        {value != null && value !== "" ? value : "—"}
      </span>
    </div>
  );
}

export function DisplayKitchenInfo({ kitchen }: { kitchen: any }) {
  const formatCoord = (val: any) => {
    if (val == null || val === "") return "Not set";
    const n = parseFloat(String(val));
    return isNaN(n) ? "Invalid" : n.toFixed(6);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
            <FiInfo className="text-lg" /> Basic Info
          </h4>
          <div className="space-y-1">
            <DenseInfoRow label="Owner" value={`${kitchen.user_details?.first_name || ""} ${kitchen.user_details?.last_name || ""}`.trim()} />
            <DenseInfoRow label="Email" value={kitchen.user_details?.email} />
            <DenseInfoRow label="Mobile" value={kitchen.user_details?.mobile} />
            <DenseInfoRow label="Cuisine" value={kitchen.cuisine_type} />
            <DenseInfoRow label="Meal Type" value={kitchen.meal_type} />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
            <FiCheck className="text-lg" /> Compliance
          </h4>
          <div className="space-y-1">
            <DenseInfoRow label="FSSAI No" value={kitchen.fssai_no} />
            <DenseInfoRow label="PAN No" value={kitchen.pan_no} />
            <DenseInfoRow label="GST No" value={kitchen.gst_no} />
            <DenseInfoRow label="Area" value={kitchen.kitchen_area ? `${kitchen.kitchen_area} sq.ft` : null} />
            <DenseInfoRow label="Platform" value={kitchen.platform_area ? `${kitchen.platform_area} sq.ft` : null} />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
            <FiNavigation2 className="text-lg" /> Delivery Distance
          </h4>
          <div className="space-y-1">
            <DenseInfoRow label="Latitude" value={formatCoord(kitchen.latitude)} />
            <DenseInfoRow label="Longitude" value={formatCoord(kitchen.longitude)} />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
            <FiClock className="text-lg" /> Operations
          </h4>
          <div className="space-y-1">
            <DenseInfoRow label="LPG Cylinders" value={kitchen.lpg_cylinders} />
            <DenseInfoRow label="Staff Count" value={kitchen.no_of_staff} />
            <DenseInfoRow label="Water Source" value={kitchen.water_source} />
            <DenseInfoRow label="Purification" value={kitchen.purification_type?.toUpperCase()} />
          </div>
        </section>
      </div>

      <section className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-white/[0.05]">
        <h4 className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-black mb-6 flex items-center gap-2">
          <FiPackage className="text-lg" /> Kitchen Photos & Certificates
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                className="group relative aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.1] shadow-sm"
              >
                {src ? (
                  <img src={src} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                    <FiPackage className="text-gray-300 dark:text-gray-700 text-2xl mb-1" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">No Image</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-black uppercase tracking-wider">{img.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2">
          Questionnaire & Equipment
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <InfoSection title="Utilities & Equipment">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
               <DenseInfoRow label="Water Source" value={kitchen.water_source} />
               <DenseInfoRow label="Purification" value={kitchen.purification_type} />
               <DenseInfoRow label="LPG Cylinders" value={kitchen.lpg_cylinders} />
               <DenseInfoRow label="Staff Count" value={kitchen.no_of_staff} />
               <DenseInfoRow label="Water Taps" value={kitchen.no_of_water_taps} />
            </div>
          </InfoSection>
          
          <InfoSection title="Checklist / Facilities">
             <div className="space-y-2">
                {[
                  ["has_pets", "Has Pets"],
                  ["has_pests", "Has Pests"],
                  ["has_hobs", "Has Hobs"],
                  ["has_refrigerator", "Refrigerator"],
                  ["has_mixer", "Mixer"],
                  ["has_grinder", "Grinder"],
                  ["has_blender", "Blender"],
                ].map(([k, label]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    {kitchen[k] ? <FiCheck className="text-green-500" /> : <span className="text-gray-300">No</span>}
                  </div>
                ))}
             </div>
          </InfoSection>

          <InfoSection title="Details">
             <div className="space-y-1">
                <DenseInfoRow label="Pet Details" value={kitchen.pet_details} />
                <DenseInfoRow label="Pest Details" value={kitchen.pest_details} />
                <DenseInfoRow label="Pest Control" value={kitchen.pest_control_frequency} />
             </div>
          </InfoSection>

          <InfoSection title="Other Info">
             <div className="space-y-1">
                <DenseInfoRow label="Constraints" value={kitchen.constraints} />
                <DenseInfoRow label="Available Time" value={kitchen.time_available} />
                <DenseInfoRow label="Other Equipment" value={kitchen.other_equipment} />
                <DenseInfoRow label="Video URL" value={kitchen.kitchen_video_url} />
             </div>
          </InfoSection>
        </div>
      </section>
    </div>
  );
}

function distanceFromKitchen(
  kitchen: { latitude?: number | null; longitude?: number | null } | undefined,
  patientLat: unknown,
  patientLng: unknown
): number | null {
  const klat = parseGeoCoord(kitchen?.latitude);
  const klng = parseGeoCoord(kitchen?.longitude);
  const plat = parseGeoCoord(patientLat);
  const plng = parseGeoCoord(patientLng);
  if (klat === null || klng === null || plat === null || plng === null) return null;
  return haversineKm(klat, klng, plat, plng);
}

export function DisplayKitchenPatients({
  items,
  kitchen
}: {
  items: AdminMicroKitchenPatientCard[];
  kitchen?: { brand_name?: string | null };
}) {
  if (!items || items.length === 0) return <EmptyState message="No patients assigned to this kitchen." />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((x) => {
          const pd = x.patient_details;
          return (
            <div key={x.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/60 dark:bg-gray-800/30 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-base">
                    {[pd?.first_name, pd?.last_name].filter(Boolean).join(" ") || "Patient"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${x.status === 'active' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      }`}>
                      {String(x.status || "").replace("_", " ")}
                    </span>
                    <span>ID: {pd?.id ?? "—"}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  {x.distance_km != null ? (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/25 border border-indigo-100 dark:border-indigo-800/40 px-3 py-2">
                      <FiNavigation2 className="text-indigo-500 shrink-0" size={14} />
                      <div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase leading-none">Distance</div>
                        <div className="text-sm font-black text-indigo-700 dark:text-indigo-300">{Number(x.distance_km).toFixed(2)} km</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-gray-400 uppercase text-right max-w-[9rem]">
                      Distance n/a (check coords)
                    </div>
                  )}
                  <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Period</div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{x.start_date || "—"}</div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{x.end_date || "—"}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-3">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                    <FiUser className="text-blue-500" /> Assigned Nutritionist
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {x.nutritionist_details ? `${x.nutritionist_details.first_name} ${x.nutritionist_details.last_name}` : "Not assigned"}
                  </div>
                  {x.original_nutritionist_details && (
                    <div className="mt-1 text-[10px] text-gray-500 italic">
                      Was: {x.original_nutritionist_details.first_name} {x.original_nutritionist_details.last_name} 
                      {x.nutritionist_effective_from && ` (until ${x.nutritionist_effective_from})`}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Diet Plan</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{x.diet_plan_details?.plan_name || "—"}</div>
                </div>

                {x.delivery_slots_details && x.delivery_slots_details.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Assigned Slots</div>
                    <div className="flex flex-wrap gap-2">
                      {x.delivery_slots_details.map((slot: any) => (
                        <span key={slot.id} className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase border border-blue-100 dark:border-blue-900/50">
                          {slot.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DisplayKitchenDailyPrep({ 
  items, 
  onMonthChange
}: { 
  items: any[]; 
  onMonthChange?: (m: number, y: number) => void;
}) {
  const [viewType, setViewType] = useState<"list" | "calendar">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(d);
    onMonthChange?.(d.getMonth() + 1, d.getFullYear());
  };
  const handleNext = () => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(d);
    onMonthChange?.(d.getMonth() + 1, d.getFullYear());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/60 dark:bg-white/[0.02] p-4 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-2xl border border-gray-200 dark:border-white/5">
            <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all font-black text-gray-500">&lt;</button>
            <div className="px-4 py-2 text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest min-w-[140px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all font-black text-gray-500">&gt;</button>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-950 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5">
          <button
            onClick={() => setViewType("list")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'list' ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            <FiList size={16} /> List
          </button>
          <button
            onClick={() => setViewType("calendar")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewType === 'calendar' ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            <FiCalendar size={16} /> Monthly Grid
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {viewType === "list" ? (
          items.length === 0 ? <EmptyState message="No prep found for this month." /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {items.map(m => <MealCard key={m.id} m={m} />)}
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-gray-900/50 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl relative">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={currentDate.toISOString().split('T')[0]}
              headerToolbar={false}
              events={items.map(m => ({
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
                <span className="flex items-center gap-1 font-medium"><FiClock size={12} /> {ins.inspection_date}</span>
                <span className="flex items-center gap-1 font-medium italic">Inspector: {ins.inspector_details?.username || "Admin"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                <div className="text-[10px] font-black text-indigo-400 uppercase italic">Overall Score</div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{ins.overall_score ?? "—"} <span className="text-xs font-normal">/ 10</span></div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${ins.status === 'approved' ? "bg-green-100 text-green-700" :
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

          <div className="mt-4">
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Inspection Media</div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[
                { k: 'external_cleanliness_media', l: 'Ext' },
                { k: 'interior_cleanliness_media', l: 'Int' },
                { k: 'kitchen_platform_adequacy_media', l: 'Plt Adeq' },
                { k: 'kitchen_platform_neatness_media', l: 'Plt Neat' },
                { k: 'safety_media', l: 'Safe' },
                { k: 'pure_water_media', l: 'H2O' },
                { k: 'storage_facilities_media', l: 'Store' },
                { k: 'packing_space_media', l: 'Pack' },
                { k: 'kitchen_size_media', l: 'Size' },
                { k: 'discussion_with_chef_media', l: 'Chef' },
                { k: 'other_observations_media', l: 'Other' },
                { k: 'support_staff_media', l: 'Staff' },
              ].map((m, idx) => {
                const url = ins[m.k];
                if (!url) return null;
                const src = getMediaUrl(url);
                return (
                  <a key={idx} href={src} target="_blank" rel="noopener noreferrer" className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-white/10 hover:border-blue-500 transition-colors">
                    <img src={src} className="w-full h-full object-cover group-hover:opacity-100 transition-opacity" alt={m.l} />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white p-0.5 text-center truncate">{m.l}</div>
                  </a>
                );
              })}
            </div>
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
      <div className="grid grid-cols-1 gap-4">
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
    </div>
  );
}

export function DisplayKitchenOrders({ items }: { items: any[] }) {
  return (
    <div className="space-y-6">
      <AdminOrderList items={items || []} hideKitchen />
    </div>
  );
}

export function DisplayKitchenDeliverySlabs({ slabs }: { slabs: DeliveryChargeSlabAdmin[] }) {
  if (!slabs?.length) {
    return (
      <EmptyState message="No delivery charge slabs configured. Customer checkout will show ₹0 delivery until slabs are added." />
    );
  }
  const sorted = [...slabs].sort((a, b) => Number(a.min_km) - Number(b.min_km));
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Distance bands used to compute delivery on checkout (straight-line km). Charges apply to orders from this kitchen.
      </p>
      <div className="rounded-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/80 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Min km</th>
              <th className="px-4 py-3">Max km</th>
              <th className="px-4 py-3 text-right">Charge (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
            {sorted.map((s) => (
              <tr key={s.id} className="bg-white/80 dark:bg-gray-900/40">
                <td className="px-4 py-3 font-mono">{s.min_km}</td>
                <td className="px-4 py-3 font-mono">{s.max_km}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{s.charge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DisplayKitchenFoods({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No foods found for this kitchen." />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((f: any) => (
          <div key={f.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/60 dark:bg-gray-800/30 shadow-sm transition-all hover:border-indigo-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{f.food_details?.name}</div>
                <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold italic">{f.category_name || "Food"}</div>
              </div>
              <div className={`text-[10px] font-black inline-flex px-2 py-0.5 rounded-full ${f.is_available ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
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
    </div>
  );
}

export function DisplayKitchenTickets({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No support tickets for this kitchen." />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {items.map((t: any) => (
          <div key={t.id} className="rounded-[35px] border border-gray-100 dark:border-white/[0.05] p-6 bg-white/60 dark:bg-gray-800/30 shadow-sm relative overflow-hidden transition-all hover:shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">Ticket #{t.id}</span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    t.status === 'open' ? 'bg-amber-100 text-amber-600' :
                    t.status === 'resolved' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {t.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                    t.priority === 'high' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <h4 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">{t.title || t.subject}</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic leading-none">Created On</p>
                <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 mt-1 uppercase">
                  {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">From (Sender)</div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                      <FiUser size={14} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white uppercase leading-none">
                        {t.created_by_details ? `${t.created_by_details.first_name} ${t.created_by_details.last_name || ''}` : 'Unknown'}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                        Role: {t.user_type || 'User'}
                      </p>
                   </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">To (Assigned)</div>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                      <FiUser size={14} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white uppercase leading-none">
                        {t.assigned_to_details ? `${t.assigned_to_details.first_name} ${t.assigned_to_details.last_name || ''}` : 'Unassigned'}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                        Target Role: {t.target_user_type || 'N/A'}
                      </p>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Ticket Description</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                &quot;{t.description || t.message || "No message body"}&quot;
              </p>
            </div>
          </div>
        ))}
      </div>
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

export function DisplayKitchenPayouts({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <EmptyState message="No patient-linked payout records found." />;
    return (
        <div className="space-y-8 pb-12">
            <div className="space-y-8">
                {items.map((group: any) => {
                    if (!group || !group.patient) return null;
                    return (
                        <div key={group.patient.id} className="p-8 rounded-[44px] bg-white border border-gray-100 dark:bg-gray-800/30 dark:border-white/5 shadow-sm overflow-hidden relative group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b dark:border-white/5">
                                <div className="flex items-center gap-5">
                                    <div className="size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner uppercase italic">
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
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Recipient: Micro Kitchen</div>
                                    <div className="px-5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase italic tracking-widest border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                                        Financial Audit Tracked
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {group.trackers.map((p: any) => (
                                    <div key={p.id} className="rounded-3xl border border-gray-100 dark:border-white/[0.05] p-6 bg-gray-50/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all relative overflow-hidden group/card shadow-sm hover:shadow-xl">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="min-w-0">
                                                    <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 italic">
                                                        #{p.id} · {p.payout_type?.toUpperCase()} · SNAPSHOT: {p.snapshot}
                                                    </div>
                                                    <div className="text-[15px] font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none mb-2 truncate">
                                                        {p.recipient_label}
                                                    </div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1.5 opacity-60">
                                                        <FiCalendar size={10} /> {p.period_from} → {p.period_to}
                                                    </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic shadow-sm border ${
                                                    p.status === 'paid' ? "text-green-600 bg-green-50/50 border-green-100" : p.status === 'pending' ? "text-amber-600 bg-amber-50/50 border-amber-100" : "text-blue-600 bg-blue-50/50 border-blue-100"
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

                                        {p.kitchen_reassignments && p.kitchen_reassignments.length > 0 && (
                                            <div className="mt-4 pt-4 border-t dark:border-white/5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FiRefreshCcw size={10} className="text-amber-500 animate-spin-slow" />
                                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Migration Log</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {p.kitchen_reassignments.map((kr: any, idx: number) => (
                                                            <div key={idx} className="text-[9px] text-gray-400 italic font-medium"> {kr.from} → {kr.to} · {kr.reason} ({new Date(kr.date).toLocaleDateString()})</div>
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
        </div>
    );
}

export function DisplayKitchenDeliveryRatings({ items }: { items: any[] }) {
  if (!items || items.length === 0)
    return <EmptyState message="No delivery feedback found for this kitchen's orders." />;

  return (
    <div className="space-y-4">
      {items.map((r: any) => {
        const isIssue = r.feedback_type === "issue";
        return (
          <div
            key={r.id}
            className={`group rounded-2xl border p-6 shadow-sm transition-all ${
              isIssue
                ? "border-red-100 bg-red-50/20 dark:border-red-900/30 dark:bg-red-900/10 hover:border-red-300"
                : "border-gray-100 bg-white/60 dark:border-white/[0.05] dark:bg-gray-800/30 hover:border-indigo-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-bold text-gray-900 dark:text-white uppercase text-base tracking-tight">
                  {r.reported_by_details
                    ? `${r.reported_by_details.first_name} ${r.reported_by_details.last_name}`
                    : "Patient"}
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 italic flex items-center gap-2">
                  <FiClock size={10} /> {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isIssue && (
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    r.resolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {r.resolved ? "Resolved" : "Active Issue"}
                  </span>
                )}
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl font-black border shadow-sm ${
                  isIssue 
                    ? "bg-red-50 text-red-600 border-red-100" 
                    : "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100"
                }`}>
                  {isIssue ? (r.issue_type?.replace("_", " ") || "ISSUE") : (
                    <>
                      {r.rating} <FiStar className="fill-current" />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100/50 dark:border-white/5 mb-4 relative">
              <div className="absolute top-2 left-2 opacity-5 text-indigo-600 font-black text-4xl leading-none italic pointer-events-none">
                &quot;
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed relative z-10">
                {r.description || r.review || "No comments provided"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t border-gray-100 dark:border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <FiHash size={12} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Order: <span className="text-blue-500 dark:text-blue-400">#{r.order}</span>
                </span>
              </div>
              {r.user_meal_details && (
                <div className="flex items-center gap-2 border-l dark:border-white/10 pl-6">
                  <div className="size-6 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                    <FiPackage size={12} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Meal:{" "}
                    <span className="text-blue-500 dark:text-blue-400">
                      {r.user_meal_details.meal_date} (
                      {r.user_meal_details.status || "N/A"})
                    </span>
                  </span>
                </div>
              )}
              {r.delivery_person_details && (
                <div className="flex items-center gap-2 border-l dark:border-white/10 pl-6">
                  <div className="size-6 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <FiTruck size={12} />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Staff: <span className="text-blue-500 dark:text-blue-400">{r.delivery_person_details.first_name} {r.delivery_person_details.last_name || ""}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


export function DisplayKitchenDeliveryTeam({ items }: { items: AdminKitchenTeamMember[] }) {
  if (!items || items.length === 0) return <EmptyState message="No delivery team members linked to this kitchen." />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((member) => (
        <div
          key={member.id}
          className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/70 dark:bg-gray-800/30 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                {formatPersonName(member.delivery_person_details)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {member.delivery_person_details?.mobile || member.delivery_person_details?.email || "No contact info"}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                member.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {member.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Role</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{member.role}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Assigned on</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{member.assigned_on || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Zone</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{member.zone_name || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Pincode</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{member.pincode || "—"}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenGlobalAssignments({ items }: { items: AdminKitchenGlobalAssignment[] }) {
  if (!items || items.length === 0) return <EmptyState message="No global delivery assignments found." />;
  return (
    <div className="space-y-4">
      {items.map((assignment) => (
        <div
          key={assignment.id}
          className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/70 dark:bg-gray-800/30 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                {formatPersonName(assignment.patient_details)}{" "}
                <span className="text-gray-400">· {assignment.user_diet_plan_details?.diet_plan_name || "Diet plan"}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {assignment.user_diet_plan_details?.start_date || "—"} to {assignment.user_diet_plan_details?.end_date || "—"}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                assignment.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {assignment.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/30 p-4">
              <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Default delivery person</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatPersonName(assignment.delivery_person_details)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Default slot: {assignment.default_slot_details?.name || "—"}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-900/30 p-4">
              <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Covered slots</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {assignment.delivery_slots_details?.length
                  ? assignment.delivery_slots_details.map((slot) => slot.name).join(", ")
                  : "—"}
              </div>
            </div>
          </div>

          {assignment.slot_delivery_assignments && assignment.slot_delivery_assignments.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] font-black uppercase text-gray-400 mb-2">Per-slot assignment</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignment.slot_delivery_assignments.map((slot) => (
                  <div
                    key={`${assignment.id}-${slot.delivery_slot_id}`}
                    className="rounded-xl border border-gray-100 dark:border-white/[0.05] p-3 bg-gray-50/80 dark:bg-gray-900/20"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {slot.delivery_slot_details?.name || `Slot #${slot.delivery_slot_id}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatPersonName(slot.delivery_person_details || undefined)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignment.change_logs && assignment.change_logs.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] font-black uppercase text-gray-400 mb-2">Reassignment history</div>
              <div className="space-y-2">
                {assignment.change_logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/10 p-3 text-sm"
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {formatPersonName(log.previous_delivery_person_details)} to {formatPersonName(log.new_delivery_person_details)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {log.reason || "Reassigned"} · Effective {log.effective_from || "—"}
                    </div>
                    {log.notes && <div className="text-xs text-gray-500 mt-1">{log.notes}</div>}
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

export function DisplayKitchenDailyReassignments({ items }: { items: AdminKitchenMealDeliveryAssignment[] }) {
  if (!items || items.length === 0) return <EmptyState message="No daily delivery reassignments found." />;
  return (
    <div className="space-y-4">
      {items.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/70 dark:bg-gray-800/30 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                {row.user_meal_details?.patient_name || "Patient"} · {row.user_meal_details?.food_name || "Meal"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {row.user_meal_details?.meal_date || row.scheduled_date || "—"} · {row.user_meal_details?.meal_type || "—"}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
              {row.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Delivery person</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{formatPersonName(row.delivery_person_details)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Slot</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{row.delivery_slot_details?.name || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Scheduled</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{row.scheduled_date || "—"}</div>
            </div>
          </div>
          {row.reassignment_reason && (
            <div className="mt-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
              Reason: {row.reassignment_reason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenDeliveryProfiles({ items }: { items: AdminKitchenDeliveryProfile[] }) {
  if (!items || items.length === 0) return <EmptyState message="No delivery profiles found for this kitchen." />;
  return (
    <div className="space-y-4">
      {items.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/70 dark:bg-gray-800/30 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{formatPersonName(row.user_details || undefined)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {row.user_details?.mobile || row.user_details?.email || "No contact info"}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                row.is_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {row.is_verified ? "Verified" : "Pending"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Vehicle</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {row.vehicle_type || row.other_vehicle_name || "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Registration</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{row.register_number || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">License</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{row.license_number || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Verified on</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{row.verified_on || "—"}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {row.license_copy && (
              <a href={getMediaUrl(row.license_copy)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                License copy
              </a>
            )}
            {row.rc_copy && (
              <a href={getMediaUrl(row.rc_copy)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                RC copy
              </a>
            )}
            {row.insurance_copy && (
              <a href={getMediaUrl(row.insurance_copy)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Insurance
              </a>
            )}
            {row.puc_image && (
              <a href={getMediaUrl(row.puc_image)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                PUC
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenPlannedLeaves({ items }: { items: AdminKitchenPlannedLeave[] }) {
  if (!items || items.length === 0) return <EmptyState message="No planned leave entries found." />;
  return (
    <div className="space-y-3">
      {items.map((row) => (
        <div
          key={row.id}
          className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-4 bg-white/70 dark:bg-gray-800/30 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{formatPersonName(row.user_details)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {row.start_date} to {row.end_date}
                {row.start_time || row.end_time ? ` · ${row.start_time || "—"} to ${row.end_time || "—"}` : ""}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-700">
              {row.leave_type}
            </span>
          </div>
          {row.notes && <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">{row.notes}</div>}
        </div>
      ))}
    </div>
  );
}

export function DisplayOrderPaymentSnapshots({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No order payment snapshots found." />;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/5">
      <table className="w-full text-xs text-left">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-black text-gray-500">
          <tr>
            <th className="p-3">Order</th>
            <th className="p-3">Customer</th>
            <th className="p-3 text-right">Total</th>
            <th className="p-3 text-right text-emerald-600">Kitchen</th>
            <th className="p-3 text-right text-indigo-600">Platform</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
          {items.map((r) => (
            <tr key={r.id}>
              <td className="p-3 font-bold">#{r.order_id}</td>
              <td className="p-3 truncate max-w-[120px]">{r.customer_display}</td>
              <td className="p-3 text-right">₹{parseFloat(r.grand_total).toFixed(2)}</td>
              <td className="p-3 text-right text-emerald-600">₹{parseFloat(r.kitchen_amount).toFixed(2)} ({r.kitchen_percent}%)</td>
              <td className="p-3 text-right text-indigo-600">₹{parseFloat(r.platform_amount).toFixed(2)} ({r.platform_percent}%)</td>
              <td className="p-3 whitespace-nowrap text-gray-400">{new Date(r.order_created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DisplayKitchenExecution({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No meals scheduled for this date." />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((m) => (
          <div key={m.id} className="p-4 rounded-3xl border border-gray-100 dark:border-white/5 bg-white/50 dark:bg-gray-800/20 shadow-sm flex items-center justify-between transition-all hover:bg-white dark:hover:bg-gray-800/40">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                   {m.meal_type_details?.name?.[0]}
                </div>
                <div>
                   <div className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">{m.user_details?.first_name} {m.user_details?.last_name}</div>
                   <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">{m.food_details?.name}</div>
                </div>
             </div>
             <div className="text-right">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                  m.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                  m.status === 'prepared' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {m.status || 'scheduled'}
                </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DisplayStoreStaffItemsDeliveryFeedback({ items }: { items: any[] }) {
  if (!items || items.length === 0) return <EmptyState message="No item delivery feedback found." />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {items.map((f: any) => (
          <div key={f.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white/60 dark:bg-gray-800/30 shadow-sm transition-all hover:border-indigo-200">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">#{f.order} · {f.food_name || "Food"}</div>
                <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold italic">{f.created_at ? new Date(f.created_at).toLocaleString() : "—"}</div>
              </div>
              <div className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                Rating: {f.rating} ★
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 italic">&quot; {f.feedback || "No comments"} &quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
