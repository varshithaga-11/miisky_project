import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { resolveMediaUrl } from "./api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiClock, FiCheckCircle, FiAlertCircle, FiTag, FiCalendar, 
  FiCreditCard, FiEye, FiUser, FiActivity, FiShield, FiSearch, FiTrendingUp, 
  FiShoppingBag, FiMapPin, FiTruck, FiX,
  FiChevronRight,
  FiExternalLink,
  FiMessageSquare,
  FiStar,
  FiHelpCircle
} from "react-icons/fi";

/** Definition list row */
export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(140px,180px)_1fr] gap-2 py-2 border-b border-gray-100 dark:border-gray-700/80 text-sm last:border-0">
      <dt className="text-gray-500 dark:text-gray-400 font-medium">{label}</dt>
      <dd className="text-gray-900 dark:text-gray-100 break-words">{value ?? "—"}</dd>
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-gray-600/80 bg-gradient-to-br from-white to-slate-50/80 dark:from-gray-900 dark:to-gray-800/90 p-4 shadow-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-3">{title}</h4>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">{message}</p>;
}

export type UserDetailRecord = Record<string, unknown> & {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  zip_code?: string | null;
  role?: string;
  is_active?: boolean;
  is_patient_mapped?: boolean;
  created_on?: string | null;
  joined_date?: string | null;
  city?: number | null;
  state?: number | null;
  country?: number | null;
  city_name?: string | null;
  state_name?: string | null;
  country_name?: string | null;
  photo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function DisplayUserProfile({ user }: { user: UserDetailRecord }) {
  const photoUrl = user.photo ? resolveMediaUrl(String(user.photo)) : null;
  const cityLabel = user.city_name || (user.city != null ? `ID ${user.city}` : "—");
  const stateLabel = user.state_name || (user.state != null ? `ID ${user.state}` : "—");
  const countryLabel = user.country_name || (user.country != null ? `ID ${user.country}` : "—");

  return (
    <div className="space-y-5">
      {photoUrl && (
        <div className="flex justify-center sm:justify-start">
          <img
            src={photoUrl}
            alt="Profile"
            className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-lg"
          />
        </div>
      )}
      <InfoSection title="Identity">
        <InfoRow label="Full name" value={[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"} />
        <InfoRow label="Username" value={user.username} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Role" value={user.role} />
        <InfoRow label="Active" value={user.is_active ? "Yes" : "No"} />
      </InfoSection>
      <InfoSection title="Contact">
        <InfoRow label="Mobile" value={user.mobile} />
        <InfoRow label="WhatsApp" value={user.whatsapp} />
      </InfoSection>
      <InfoSection title="Personal">
        <InfoRow label="Date of birth" value={user.dob} />
        <InfoRow label="Gender" value={user.gender} />
      </InfoSection>
      <InfoSection title="Address">
        <InfoRow label="Street address" value={user.address} />
        <InfoRow label="City" value={cityLabel} />
        <InfoRow label="State / region" value={stateLabel} />
        <InfoRow label="Country" value={countryLabel} />
        <InfoRow label="PIN / ZIP" value={user.zip_code} />
        <InfoRow
          label="Coordinates"
          value={
            user.latitude != null || user.longitude != null
              ? `${user.latitude ?? "—"}, ${user.longitude ?? "—"}`
              : "—"
          }
        />
      </InfoSection>
      <InfoSection title="Care">
        <InfoRow label="Mapped to nutritionist" value={user.is_patient_mapped ? "Yes" : "No"} />
        <InfoRow label="Joined" value={user.joined_date ?? user.created_on} />
      </InfoSection>
    </div>
  );
}

const Q_LABELS: Record<string, string> = {
  id: "Record ID",
  user: "User ID",
  age: "Age",
  height_cm: "Height (cm)",
  weight_kg: "Weight (kg)",
  work_type: "Work type",
  meals_per_day: "Meals per day",
  skips_meals: "Skips meals",
  snacks_between_meals: "Snacks between meals",
  food_source: "Food source",
  diet_pattern: "Diet pattern",
  consumes_egg: "Consumes egg",
  consumes_dairy: "Consumes dairy",
  food_allergy: "Food allergy",
  food_allergy_details: "Allergy details",
  fruits_per_day: "Fruits per day",
  vegetables_per_day: "Vegetables per day",
  surgery_history: "Surgery history",
  on_medication: "On medication",
  sleep_quality: "Sleep quality",
  stress_level: "Stress level",
  falls_sick_frequency: "Falls sick frequency",
  additional_notes: "Additional notes",
  habits: "Lifestyle habits",
  physical_activities: "Physical activities",
  created_on: "Created",
  updated_on: "Updated",
};

function formatJsonish(val: unknown): ReactNode {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val || "—";
  if (Array.isArray(val)) {
    if (val.length === 0) return "—";
    return (
      <ul className="list-disc list-outside ml-4 space-y-2 mt-1">
        {val.map((x, i) => (
          <li key={i} className="text-gray-800 dark:text-gray-200">
            {formatJsonish(x)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    
    // If it's a known named entity (e.g. from health conditions, symptoms, etc.), just return its name.
    if ("name" in o) {
      return String(o.name);
    }

    return (
      <div className="space-y-2 text-xs mt-1 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
        {Object.entries(o).map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:gap-2 sm:items-baseline">
            <span className="text-gray-500 font-medium sm:min-w-[130px]">{humanizeKey(k)}:</span>
            <span className="text-gray-900 dark:text-gray-100 flex-1 break-words">
              {formatJsonish(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return String(val);
}

function humanizeKey(k: string): string {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const JSON_BLOCK_KEYS = new Set([
  "health_conditions",
  "symptoms",
  "deficiencies",
  "autoimmune_diseases",
  "digestive_issues",
  "skin_issues",
  "habits",
  "physical_activities",
  "food_preferences",
]);

export function DisplayQuestionnaire({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return <EmptyState message="No questionnaire submitted for this patient." />;
  const q = rows[0];

  const simple: [string, unknown][] = [];
  const jsonBlocks: [string, unknown][] = [];
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined) continue;
    if (JSON_BLOCK_KEYS.has(k)) jsonBlocks.push([k, v]);
    else simple.push([k, v]);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {simple.map(([k, v]) => (
          <InfoRow key={k} label={Q_LABELS[k] ?? humanizeKey(k)} value={k === "user" ? String(v) : formatJsonish(v)} />
        ))}
      </div>
      {jsonBlocks.map(([k, v]) => (
        <InfoSection key={k} title={Q_LABELS[k] ?? humanizeKey(k)}>
          <div className="text-sm">{formatJsonish(v)}</div>
        </InfoSection>
      ))}
    </div>
  );
}

export type HealthReportRow = {
  id: number;
  title?: string | null;
  report_file?: string | null;
  report_type?: string | null;
  uploaded_on?: string | null;
  reviews?: { id: number; comments: string; created_on: string; nutritionist_name: string; }[];
  user_details?: { first_name?: string; last_name?: string; email?: string };
};

export function DisplayHealthReports({ items }: { items: HealthReportRow[] }) {
  if (!items.length) return <EmptyState message="No health reports uploaded." />;
  return (
    <ul className="space-y-3">
      {items.map((rep) => (
        <li
          key={rep.id}
          className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/40 shadow-sm"
        >
          <div className="font-medium text-gray-900 dark:text-white">{rep.title || "Untitled report"}</div>
          <div className="text-xs text-gray-500 mt-1">
            Type: {rep.report_type || "—"} · Uploaded: {rep.uploaded_on || "—"}
          </div>
          {rep.reviews && rep.reviews.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 leading-none tracking-wide">Doctor / Nutritionist Notes</div>
              {rep.reviews.map((rev) => (
                <div key={rev.id} className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border-l-2 border-indigo-400 dark:border-indigo-500 shadow-sm">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                    {rev.nutritionist_name || "Nutritionist"} · {rev.created_on ? new Date(rev.created_on).toLocaleDateString() : ""}
                  </div>
                  <div className="whitespace-pre-wrap">{rev.comments}</div>
                </div>
              ))}
            </div>
          )}
          {rep.report_file && (
            <a
              href={resolveMediaUrl(rep.report_file)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-blue-600 hover:underline font-medium"
            >
              Open file
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export type PersonSummary = {
  id?: number;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  mobile?: string | null;
};

export type MappingRow = {
  id: number;
  user?: number;
  nutritionist?: number;
  assigned_on?: string;
  is_active?: boolean;
  user_details?: PersonSummary | null;
  nutritionist_details?: PersonSummary | null;
  reassignment_details?: {
    previous_nutritionist: string | null;
    new_nutritionist: string | null;
    reason: string;
    notes: string | null;
    effective_from: string;
  } | null;
};

function formatPersonName(p?: PersonSummary | null): string {
  if (!p) return "—";
  const n = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return n || p.username || p.email || (p.id != null ? `User #${p.id}` : "—");
}

export function DisplayNutritionistMapping({ items }: { items: MappingRow[] }) {
  if (!items.length) return <EmptyState message="No nutritionist assignment on file." />;
  return (
    <ul className="space-y-4">
      {items.map((m) => (
        <li
          key={m.id}
          className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/30 dark:to-gray-900 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Mapping #{m.id}</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.is_active
                ? "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200"
                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
            >
              {m.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="rounded-lg bg-white/60 dark:bg-gray-800/50 p-3 border border-gray-100 dark:border-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Patient</div>
              <div className="font-semibold text-gray-900 dark:text-white">{formatPersonName(m.user_details)}</div>
              {m.user_details?.email && <div className="text-gray-600 dark:text-gray-300 mt-1">{m.user_details.email}</div>}
              {m.user_details?.mobile && <div className="text-gray-500 text-xs mt-0.5">{m.user_details.mobile}</div>}
              {/* <div className="text-xs text-gray-400 mt-2">User ID: {m.user ?? "—"}</div> */}
            </div>
            <div className="rounded-lg bg-white/60 dark:bg-gray-800/50 p-3 border border-gray-100 dark:border-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Nutritionist</div>
              <div className="font-semibold text-gray-900 dark:text-white">{formatPersonName(m.nutritionist_details)}</div>
              {m.nutritionist_details?.email && (
                <div className="text-gray-600 dark:text-gray-300 mt-1">{m.nutritionist_details.email}</div>
              )}
              {m.nutritionist_details?.mobile && (
                <div className="text-gray-500 text-xs mt-0.5">{m.nutritionist_details.mobile}</div>
              )}
              {/* <div className="text-xs text-gray-400 mt-2">User ID: {m.nutritionist ?? "—"}</div> */}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 border-t border-emerald-100 dark:border-emerald-900/40 pt-3">
            <div>Assigned on: <span className="text-gray-700 dark:text-gray-300 font-medium">{m.assigned_on ?? "—"}</span></div>
            {m.reassignment_details && (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/40">
                <span className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tighter">Switched from: {m.reassignment_details.previous_nutritionist || "Unknown"}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600 dark:text-gray-300">Effective: {m.reassignment_details.effective_from}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export type NutritionistProfileRow = Record<string, unknown>;

export function DisplayNutritionistProfile({ items }: { items: NutritionistProfileRow[] }) {
  if (!items.length) return <EmptyState message="No nutritionist profile found for this ID." />;
  const p = items[0];
  const skip = new Set(["id", "user"]);
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
      {Object.entries(p)
        .filter(([k]) => !skip.has(k))
        .map(([k, v]) => (
          <InfoRow key={k} label={humanizeKey(k)} value={formatJsonish(v)} />
        ))}
    </div>
  );
}

export type ReportDetailRow = {
  id: number;
  title?: string | null;
  report_type?: string | null;
  uploaded_on?: string | null;
  report_file?: string | null;
};

export type ReviewRow = {
  id: number;
  comments?: string | null;
  created_on?: string | null;
  report_details?: ReportDetailRow[];
  nutritionist?: number;
  nutritionist_details?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
};

export function DisplayReviews({ items }: { items: ReviewRow[] }) {
  if (!items.length) return <EmptyState message="No nutritionist reviews yet." />;
  return (
    <ul className="space-y-5">
      {items.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border border-violet-200/80 dark:border-violet-900/50 bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-950/20 dark:to-gray-900 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-xs text-gray-500">
              {r.created_on ? new Date(r.created_on).toLocaleString() : "—"}
            </div>
            {r.nutritionist_details && (
              <div className="text-sm font-medium text-violet-800 dark:text-violet-300">
                {[r.nutritionist_details.first_name, r.nutritionist_details.last_name].filter(Boolean).join(" ") ||
                  "Nutritionist"}
                {r.nutritionist_details.email ? ` · ${r.nutritionist_details.email}` : ""}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap border-l-4 border-violet-300 dark:border-violet-600 pl-3">
            {r.comments || "—"}
          </p>
          {r.report_details && r.report_details.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Linked health reports</div>
              <ul className="space-y-2">
                {r.report_details.map((rep) => (
                  <li
                    key={rep.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 p-3"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{rep.title || `Report #${rep.id}`}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {rep.report_type || "—"} · {rep.uploaded_on ? new Date(rep.uploaded_on).toLocaleString() : "—"}
                      </div>
                    </div>
                    {rep.report_file && (
                      <a
                        href={resolveMediaUrl(rep.report_file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline shrink-0"
                      >
                        Open file
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export type DietPlanRow = Record<string, unknown> & {
  id?: number;
  status?: string;
  diet_plan_details?: { title?: string; code?: string; no_of_days?: number };
  nutritionist_details?: { first_name?: string; last_name?: string; email?: string };
  micro_kitchen_details?: { brand_name?: string };
  original_micro_kitchen_details?: { brand_name?: string };
  micro_kitchen_effective_from?: string | null;
  kitchen_reassignments?: {
    from: string;
    to: string;
    reason: string;
    date: string;
    effective_from: string;
    by: string;
  }[];
  start_date?: string | null;
  end_date?: string | null;
  payment_status?: string;
  amount_paid?: number | string | null;
  transaction_id?: string | null;
  payment_screenshot?: string | null;
  payment_uploaded_on?: string | null;
  is_payment_verified?: boolean;
  verified_by?: number | null;
  verified_by_details?: { id?: number; first_name?: string | null; last_name?: string | null; email?: string | null; username?: string } | null;
  verified_on?: string | null;
};

export function DisplayDietPlans({ items }: { items: DietPlanRow[] }) {
  if (!items.length) return <EmptyState message="No diet plan instances." />;
  return (
    <ul className="space-y-5">
      {items.map((p, idx) => (
        <li
          key={p.id ?? idx}
          className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/25 dark:to-gray-900 p-5 shadow-sm overflow-hidden"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              {p.diet_plan_details?.title || "Plan"}
              {p.diet_plan_details?.code ? (
                <span className="text-sm font-normal text-gray-500 ml-2">({p.diet_plan_details.code})</span>
              ) : null}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}
            >
              {p.status || "—"}
            </span>
          </div>
          <div className="mt-2 grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <span className="text-gray-500">Nutritionist · </span>
              {[p.nutritionist_details?.first_name, p.nutritionist_details?.last_name].filter(Boolean).join(" ") || "—"}
              {p.nutritionist_details?.email ? ` · ${p.nutritionist_details.email}` : ""}
            </div>
            <div>
              <span className="text-gray-500">Micro kitchen · </span>
              <span className="font-semibold text-gray-900 dark:text-white">{p.micro_kitchen_details?.brand_name || "—"}</span>
              {p.original_micro_kitchen_details && (
                <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 text-[10px]">
                  <span className="text-gray-400 line-through tracking-wider uppercase font-medium">{p.original_micro_kitchen_details.brand_name}</span>
                  <span className="text-amber-500 font-black">→</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black uppercase">Switch on {p.micro_kitchen_effective_from || 'N/A'}</span>
                </span>
              )}
            </div>
            <div>
              <span className="text-gray-500">Plan dates · </span>
              {p.start_date || "—"} → {p.end_date || "—"}
              {p.diet_plan_details?.no_of_days != null ? ` (${p.diet_plan_details.no_of_days} day(s))` : ""}
            </div>
            
            {p.kitchen_reassignments && p.kitchen_reassignments.length > 0 && (
              <div className="mt-2 border-l-2 border-amber-300 dark:border-amber-700 pl-3 pt-1 pb-1">
                <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-500 mb-1 block tracking-wider">Kitchen Reassignments</span>
                <ul className="space-y-2">
                  {p.kitchen_reassignments.map((rea, rIdx) => (
                    <li key={rIdx} className="text-xs text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="line-through text-gray-500">{rea.from}</span>
                        <span className="text-amber-500 font-bold">→</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{rea.to}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-1 text-[10px] text-gray-500">
                        <div><span className="font-medium">Effective:</span> {rea.effective_from || "N/A"}</div>
                        <div><span className="font-medium">By:</span> {rea.by} on {new Date(rea.date).toLocaleDateString()}</div>
                        <div className="col-span-2 mt-0.5"><span className="font-medium">Reason:</span> {rea.reason || "—"}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-amber-200/60 dark:border-amber-900/40">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-800/80 dark:text-amber-400 mb-3">
              Payment & verification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/70 dark:bg-gray-800/50 p-3 border border-amber-100 dark:border-gray-700">
                <div className="text-xs text-gray-500">Amount paid</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {p.amount_paid != null && p.amount_paid !== "" ? String(p.amount_paid) : "—"}
                </div>
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-gray-800/50 p-3 border border-amber-100 dark:border-gray-700">
                <div className="text-xs text-gray-500">Transaction ID</div>
                <div className="font-mono text-gray-900 dark:text-white break-all">{p.transaction_id || "—"}</div>
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-gray-800/50 p-3 border border-amber-100 dark:border-gray-700">
                <div className="text-xs text-gray-500">Payment status</div>
                <div className="font-medium">{p.payment_status || "—"}</div>
                {p.payment_uploaded_on && (
                  <div className="text-xs text-gray-500 mt-1">Uploaded {new Date(p.payment_uploaded_on).toLocaleString()}</div>
                )}
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-gray-800/50 p-3 border border-amber-100 dark:border-gray-700">
                <div className="text-xs text-gray-500">Verified by</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {p.verified_by_details
                    ? [p.verified_by_details.first_name, p.verified_by_details.last_name].filter(Boolean).join(" ") ||
                    p.verified_by_details.username ||
                    p.verified_by_details.email ||
                    `User #${p.verified_by_details.id}`
                    : p.verified_by != null
                      ? `User ID ${p.verified_by}`
                      : "—"}
                </div>
                {p.verified_on && (
                  <div className="text-xs text-gray-500 mt-1">{new Date(p.verified_on).toLocaleString()}</div>
                )}
              </div>
            </div>
            {p.payment_screenshot && (
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-2">Payment screenshot</div>
                <a
                  href={resolveMediaUrl(p.payment_screenshot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-md max-w-xs"
                >
                  <img
                    src={resolveMediaUrl(p.payment_screenshot)}
                    alt="Payment screenshot"
                    className="max-h-48 w-full object-contain bg-gray-100 dark:bg-gray-800"
                  />
                </a>
                <div className="mt-2">
                  <a
                    href={resolveMediaUrl(p.payment_screenshot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open full image
                  </a>
                </div>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export type MealRow = {
  id: number;
  meal_date?: string | null;
  meal_type_details?: { name?: string | null };
  food_details?: { name?: string | null };
  packaging_material_details?: { name?: string | null };
  micro_kitchen_details?: { id?: number; brand_name?: string | null };
  quantity?: number | null;
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function padDateKey(y: number, m: number, day: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DisplayMeals({
  meals,
  month,
  year,
  onMonthChange,
}: {
  meals: MealRow[];
  month: number;
  year: number;
  onMonthChange: (m: number, y: number) => void;
}) {
  if (!meals.length) {
    return (
      <div className="space-y-4">
        <MealsHeader month={month - 1} year={year} onMonthChange={onMonthChange} />
        <EmptyState message={`No meals found for ${MONTH_NAMES[month - 1]} ${year}.`} />
      </div>
    );
  }
  return <MealsCalendarView meals={meals} month={month} year={year} onMonthChange={onMonthChange} />;
}

export function DisplayNutritionistHistory({ items }: { items: any[] }) {
  if (!items.length) return <EmptyState message="No nutritionist reassignment history found." />;
  return (
    <div className="space-y-4">
      {items.map((h) => (
        <div key={h.id} className="relative pl-8 pb-8 last:pb-0">
          <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-indigo-100 dark:bg-indigo-900/40" />
          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-500 flex items-center justify-center z-10 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>
          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-white dark:bg-indigo-950/20 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
               <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{h.reassigned_on ? new Date(h.reassigned_on).toLocaleDateString() : 'N/A'}</span>
               <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/60 uppercase">Audit Log #{h.id}</span>
            </div>
            <div className="flex items-center gap-4 text-sm mb-4">
               <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Previous</div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">{h.previous_nutritionist_name || '—'}</div>
               </div>
               <div className="text-indigo-500 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase">To</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="9 5l7 7-7 7" /></svg>
               </div>
               <div className="flex-1 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 text-center">
                  <div className="text-[10px] text-indigo-400 uppercase font-bold mb-1">New Assignment</div>
                  <div className="font-bold text-indigo-900 dark:text-indigo-200 truncate">{h.new_nutritionist_name || '—'}</div>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
               <div className="space-y-1">
                  <span className="text-gray-400 font-medium uppercase tracking-tighter">Reason:</span>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold">{h.reason?.replace(/_/g, ' ') || '—'}</p>
               </div>
               <div className="space-y-1">
                  <span className="text-gray-400 font-medium uppercase tracking-tighter">Effective From:</span>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold">{h.effective_from || 'Immediate'}</p>
               </div>
            </div>
            {h.notes && (
               <div className="mt-4 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20">
                  <span className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest block mb-1">Internal Notes</span>
                  <p className="text-xs text-amber-800 dark:text-amber-200 italic">"{h.notes}"</p>
               </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-900 text-[10px] text-gray-400 flex justify-between">
               <span>Authorized by: {h.reassigned_by_name || 'System'}</span>
               <span>Audit verified</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DisplayKitchenHistory({ items }: { items: any[] }) {
  if (!items.length) return <EmptyState message="No micro-kitchen reassignment history found." />;
  return (
    <div className="space-y-4">
      {items.map((h) => (
        <div key={h.id} className="relative pl-8 pb-8 last:pb-0">
          <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-amber-100 dark:bg-amber-900/40" />
          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-amber-500 flex items-center justify-center z-10 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="rounded-2xl border border-amber-100 dark:border-amber-950 bg-white dark:bg-amber-950/20 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
               <span className="text-xs font-black text-amber-600 uppercase tracking-widest">{h.reassigned_on ? new Date(h.reassigned_on).toLocaleDateString() : 'N/A'}</span>
               <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold border border-amber-100 dark:border-amber-900/60 uppercase">Kitchen Log #{h.id}</span>
            </div>
            <div className="flex items-center gap-4 text-sm mb-4">
               <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Original Kitchen</div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">{h.previous_kitchen_name || '—'}</div>
               </div>
               <div className="text-amber-500 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase">Switch</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </div>
               <div className="flex-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 text-center">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold mb-1">Target Kitchen</div>
                  <div className="font-bold text-amber-900 dark:text-amber-200 truncate">{h.new_kitchen_name || '—'}</div>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
               <div className="space-y-1">
                  <span className="text-gray-400 font-medium uppercase tracking-tighter">Reason:</span>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold">{h.reason?.replace(/_/g, ' ') || '—'}</p>
               </div>
               <div className="space-y-1">
                  <span className="text-gray-400 font-medium uppercase tracking-tighter">Takes Effect From:</span>
                  <p className="text-gray-900 dark:text-gray-200 font-semibold font-mono tracking-tight">{h.effective_from || '—'}</p>
               </div>
            </div>
            {h.notes && (
               <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Administrative Notes</span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic">"{h.notes}"</p>
               </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-900 text-[10px] text-gray-400 flex justify-between">
               <span>Switched by: {h.reassigned_by_name || 'System'}</span>
               <span className="font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tighter">Kitchen Verified</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MealsHeader({
  month,
  year,
  onMonthChange,
}: {
  month: number;
  year: number;
  onMonthChange: (m: number, y: number) => void;
}) {
  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    onMonthChange(d.getMonth() + 1, d.getFullYear());
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    onMonthChange(d.getMonth() + 1, d.getFullYear());
  };
  const goToday = () => {
    const d = new Date();
    onMonthChange(d.getMonth() + 1, d.getFullYear());
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {MONTH_NAMES[month]} {year}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Meals & packaging by day</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={prevMonth}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={goToday}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-600 text-white shadow hover:bg-cyan-700"
        >
          Today
        </button>
        <button
          type="button"
          onClick={nextMonth}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function MealsCalendarView({
  meals,
  month: targetMonth,
  year: targetYear,
  onMonthChange,
}: {
  meals: MealRow[];
  month: number;
  year: number;
  onMonthChange: (m: number, y: number) => void;
}) {
  const byDate = useMemo(() => {
    const m = new Map<string, MealRow[]>();
    for (const meal of meals) {
      const d = meal.meal_date?.trim();
      if (!d) continue;
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(meal);
    }
    return m;
  }, [meals]);

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const year = targetYear;
  const month = targetMonth - 1; // 0-indexed for JS Date

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);



  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-200/70 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50/90 via-white to-sky-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/30 p-4 sm:p-6 shadow-md">
        <MealsHeader month={month} year={year} onMonthChange={onMonthChange} />

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-2">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((dayNum, i) => {
            if (dayNum === null) {
              return <div key={`empty-${i}`} className="min-h-[100px] rounded-lg bg-gray-50/50 dark:bg-gray-800/20" />;
            }
            const key = padDateKey(year, month, dayNum);
            const dayMeals = byDate.get(key) || [];
            const isToday =
              new Date().toDateString() === new Date(year, month, dayNum).toDateString();

            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredDate(key)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`relative min-h-[100px] rounded-xl border p-1.5 flex flex-col transition-all duration-200 ${dayMeals.length
                  ? "border-cyan-300/80 bg-white/90 dark:bg-cyan-950/20 dark:border-cyan-800/70 shadow-sm hover:shadow-lg hover:border-cyan-400 hover:-translate-y-1 hover:z-30 cursor-default"
                  : "border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/30"
                  } ${isToday ? "ring-2 ring-cyan-400 dark:ring-cyan-600" : ""}`}
              >
                <div
                  className={`text-xs font-bold mb-1 shrink-0 ${isToday ? "text-cyan-600 dark:text-cyan-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {dayNum}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 max-h-[88px] sm:max-h-[100px]">
                  {dayMeals.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="rounded-md bg-gradient-to-r from-cyan-100/90 to-teal-50 dark:from-cyan-900/40 dark:to-teal-900/20 border border-cyan-200/60 dark:border-cyan-800/50 px-1.5 py-1 text-[10px] leading-tight"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {m.meal_type_details?.name || "Meal"}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 truncate">{m.food_details?.name || "—"}</div>
                    </div>
                  ))}
                  {dayMeals.length > 3 && (
                    <div className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold text-center">
                      +{dayMeals.length - 3} more
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {hoveredDate === key && dayMeals.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-cyan-200 dark:border-cyan-800 p-4 pointer-events-none"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-cyan-600 dark:text-cyan-400 text-xs uppercase tracking-widest">
                          {MONTH_NAMES[month]} {dayNum} Plan
                        </h4>
                        <div className="h-1 w-12 bg-cyan-100 dark:bg-cyan-900 rounded-full" />
                      </div>
                      <div className="space-y-4">
                        {dayMeals.map((m) => (
                          <div key={m.id} className="relative pl-4 border-l-2 border-cyan-500/30 hover:border-cyan-500 transition-colors">
                            <div className="text-[10px] font-black text-cyan-600/70 dark:text-cyan-400/70 uppercase tracking-tighter mb-0.5">
                              {m.meal_type_details?.name || "Meal"}
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white font-bold leading-tight">
                              {m.food_details?.name || "—"}
                            </div>
                            {m.micro_kitchen_details?.brand_name && (
                              <div className="mt-1 text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-tighter">
                                🏢 {m.micro_kitchen_details.brand_name}
                              </div>
                            )}
                            {(m.packaging_material_details?.name || m.quantity != null) && (
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                {m.packaging_material_details?.name && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-900/30 text-[10px] font-medium text-cyan-700 dark:text-cyan-300">
                                    📦 {m.packaging_material_details.name}
                                  </span>
                                )}
                                {m.quantity != null && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                                    qty: {m.quantity}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Arrow */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-cyan-200 dark:border-cyan-800 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          All meals (list)
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 dark:bg-gray-800/60">
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Meal</th>
                <th className="px-3 py-2 font-medium">Food</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Packaging</th>
                <th className="px-3 py-2 font-medium">Kitchen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {[...meals]
                .sort((a, b) => String(a.meal_date).localeCompare(String(b.meal_date)))
                .map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                    <td className="px-3 py-2 whitespace-nowrap">{m.meal_date || "—"}</td>
                    <td className="px-3 py-2">{m.meal_type_details?.name || "—"}</td>
                    <td className="px-3 py-2">{m.food_details?.name || "—"}</td>
                    <td className="px-3 py-2">{m.quantity ?? "—"}</td>
                    <td className="px-3 py-2">{m.packaging_material_details?.name || "—"}</td>
                    <td className="px-3 py-2">{m.micro_kitchen_details?.brand_name || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
}

export interface PaymentEntry {
  id: string | number;
  date: string;
  amount: number | string;
  status: string;
  type: string;
  reference: string;
  details: string;
  screenshot?: string | null;
  originalData?: any;
}

export function DisplayPaymentHistory({ items }: { items: PaymentEntry[] }) {
  const [selectedItem, setSelectedItem] = useState<PaymentEntry | null>(null);

  if (!items.length) return <EmptyState message="No payment transactions found." />;

  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("verified") || s === "paid" || s === "delivered" || s === "success") 
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/10";
    if (s.includes("pending")) 
      return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-500/10";
    if (s.includes("failed") || s.includes("rejected") || s === "cancelled") 
      return "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-500/10";
    return "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-100 dark:border-white/5";
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {items.map((tx, idx) => (
          <motion.div
            key={`${tx.type}-${tx.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="group relative bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-white/5 p-4 hover:border-indigo-200 dark:hover:border-indigo-900/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-[240px]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  tx.type.includes("Plan") ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20"
                }`}>
                  {tx.type.includes("Plan") ? <FiTag size={20} /> : <FiCreditCard size={20} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">ID: {tx.id}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      tx.type.includes("Plan") ? "bg-indigo-100/50 text-indigo-600" : "bg-emerald-100/50 text-emerald-600"
                    }`}>{tx.type}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-md">{tx.details}</h4>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><FiCalendar className="text-indigo-500" /> {new Date(tx.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><FiShield className="text-indigo-500" /> Ref: {tx.reference}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-lg font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
                    ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyles(tx.status)}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${tx.status.toLowerCase().includes('verified') || tx.status.toLowerCase() === 'paid' ? 'bg-emerald-500' : 'bg-current'}`} />
                    {tx.status}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(tx)}
                  className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20"
                >
                  <FiEye size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <TransactionDetailModal entry={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TransactionDetailModal({ entry, onClose }: { entry: PaymentEntry; onClose: () => void }) {
  const d = entry.originalData || {};
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-[30px] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${
                 entry.type.includes("Plan") ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"
               }`}>
                 {entry.type}
               </div>
               <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Transaction Log</h2>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-rose-500 transition-all">
              <FiX size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400"><FiCalendar size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Date</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(entry.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400"><FiShield size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Status</p>
                      <p className="text-sm font-bold text-indigo-500 uppercase">{entry.status}</p>
                    </div>
                  </div>
               </div>
            </div>
            <div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400"><FiTag size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Reference</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[140px]">{entry.reference}</p>
                    </div>
                  </div>
                  {entry.type.includes("Plan") && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400"><FiActivity size={18} /></div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Validity</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{d.diet_plan_details?.no_of_days ?? '—'} Days</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Financial Summary</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
             </div>
             
             <div className="rounded-[25px] bg-slate-50 dark:bg-white/[0.02] p-6 space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400 uppercase text-[10px] font-black">Description</span>
                  <span className="text-gray-900 dark:text-white">{entry.details}</span>
                </div>
                {entry.type.includes("Order") && d.order_type && (
                   <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-400 uppercase text-[10px] font-black">Order Type</span>
                    <span className="text-gray-900 dark:text-white uppercase">{d.order_type}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-gray-200/50 dark:border-white/5">
                  <span className="text-gray-500 font-bold uppercase text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">₹{Number(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
             </div>
          </div>

          {entry.screenshot && (
            <div className="space-y-3">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Proof</span>
               <a href={resolveMediaUrl(entry.screenshot)} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-2xl border-4 border-gray-50 dark:border-gray-800 shadow-lg">
                  <img src={resolveMediaUrl(entry.screenshot)} alt="Proof" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <FiExternalLink className="text-white text-2xl" />
                  </div>
               </a>
            </div>
          )}

          <div className="flex gap-4">
             <button onClick={onClose} className="flex-1 py-4 rounded-2xl border-2 border-gray-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Dismiss</button>
             {entry.type.includes("Order") && (
               <button className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">Print Receipt</button>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function DisplayMeetings({ items }: { items: any[] }) {
  if (!items.length) return <EmptyState message="No consultation meetings scheduled." />;
  return (
    <div className="space-y-4">
      {items.map((m, idx) => (
        <motion.div
          key={m.id || idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="relative pl-6 pb-6 last:pb-0"
        >
          <div className="absolute left-[7px] top-2 bottom-0 w-px bg-gray-100 dark:bg-white/5" />
          <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-gray-900 z-10 ${
            m.status === 'completed' ? 'border-emerald-500' : m.status === 'pending' ? 'border-amber-500' : 'border-indigo-500'
          }`} />
          
          <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800/40 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                   {new Date(m.preferred_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                 </span>
                 <span className="text-[10px] text-gray-400 font-bold uppercase">• {m.preferred_time}</span>
               </div>
               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                 m.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                 m.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                 'bg-indigo-50 text-indigo-600 border-indigo-100'
               }`}>{m.status}</span>
            </div>
            
            <div className="flex items-start gap-3">
               <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                 <FiCalendar size={18} />
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">Consultation with {m.nutritionist_details?.first_name || 'Nutritionist'}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{m.reason || 'No reason provided'}"</p>
               </div>
            </div>

            {m.meeting_link && (
               <div className="mt-4 pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    <FiActivity size={10} className="text-emerald-500" /> Recorded Session
                  </div>
                  <a href={m.meeting_link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Join / View Link <FiChevronRight />
                  </a>
               </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function DisplaySupportTickets({ items }: { items: any[] }) {
  if (!items.length) return <EmptyState message="No support tickets raised by this patient." />;
  return (
    <div className="space-y-4">
      {items.map((t, idx) => (
        <motion.div
           key={t.id || idx}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: idx * 0.05 }}
           className="group bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-white/5 p-4 hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all"
        >
           <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Ticket #{t.id}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                      t.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                    }`}>{t.priority} priority</span>
                 </div>
                 <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{t.title}</h4>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                t.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                'bg-gray-50 text-gray-500 border-gray-100'
              }`}>{t.status}</span>
           </div>
           
           <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{t.description}</p>
           
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                 <FiMessageSquare size={12} className="text-indigo-400" /> {t.category_details?.name || 'General Support'}
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Updated: {new Date(t.updated_at || t.created_at).toLocaleDateString()}</p>
           </div>
        </motion.div>
      ))}
    </div>
  );
}

export function DisplayNutritionistRatings({ ratings }: { ratings: any[] }) {
  if (!ratings.length) return <EmptyState message="Patient hasn't submitted any expert reviews yet." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ratings.map((r, idx) => (
        <motion.div
           key={idx}
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-white/5 p-5 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <FiStar size={40} className="text-amber-500 fill-current" />
           </div>
           
           <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={12} className={i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-200 dark:text-gray-700'} />
              ))}
           </div>

           <p className="text-xs text-gray-600 dark:text-gray-300 italic mb-4 leading-relaxed font-medium">"{r.review || 'No written feedback provided.'}"</p>
           
           <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                 <FiUser size={14} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-none mb-0.5">
                    {r.nutritionist_details?.first_name || 'Nutritionist'}
                 </p>
                 <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Expert Feedback</p>
              </div>
           </div>
        </motion.div>
      ))}
    </div>
  );
}

export function DisplayKitchenRatings({ ratings }: { ratings: any[] }) {
  if (!ratings.length) return <EmptyState message="Patient hasn't submitted any kitchen reviews yet." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ratings.map((r, idx) => (
        <motion.div
           key={idx}
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-white/5 p-5 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <FiStar size={40} className="text-amber-500 fill-current" />
           </div>
           
           <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={12} className={i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-200 dark:text-gray-700'} />
              ))}
           </div>

           <p className="text-xs text-gray-600 dark:text-gray-300 italic mb-4 leading-relaxed font-medium">"{r.review || 'No written feedback provided.'}"</p>
           
           <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                 <FiUser size={14} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-none mb-0.5">
                    {r.kitchen_details?.brand_name || 'Kitchen'}
                 </p>
                 <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Kitchen Feedback</p>
              </div>
           </div>
        </motion.div>
      ))}
    </div>
  );
}
