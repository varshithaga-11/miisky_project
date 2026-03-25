import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { resolveMediaUrl } from "./api";

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
  physical_activity: "Physical activity",
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
  has_diabetes: "Diabetes",
  has_thyroid: "Thyroid",
  has_bp: "Blood pressure",
  has_cardiac_issues: "Cardiac issues",
  is_anemic: "Anemic",
  surgery_history: "Surgery history",
  on_medication: "On medication",
  alcohol_per_week: "Alcohol (per week)",
  smoking_per_day: "Smoking (per day)",
  sleep_quality: "Sleep quality",
  stress_level: "Stress level",
  falls_sick_frequency: "Falls sick frequency",
  additional_notes: "Additional notes",
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
      <ul className="list-disc list-inside space-y-1">
        {val.map((x, i) => (
          <li key={i}>{String(x)}</li>
        ))}
      </ul>
    );
  }
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    return (
      <div className="space-y-1 text-xs">
        {Object.entries(o).map(([k, v]) => (
          <div key={k}>
            <span className="text-gray-500">{humanizeKey(k)}: </span>
            <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
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
  "family_history",
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
          {rep.report_file && (
            <a
              href={resolveMediaUrl(rep.report_file)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-blue-600 hover:underline"
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
          <div className="mt-4 text-xs text-gray-500">
            Assigned on: <span className="text-gray-700 dark:text-gray-300">{m.assigned_on ?? "—"}</span>
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
              {p.micro_kitchen_details?.brand_name || "—"}
            </div>
            <div>
              <span className="text-gray-500">Plan dates · </span>
              {p.start_date || "—"} → {p.end_date || "—"}
              {p.diet_plan_details?.no_of_days != null ? ` (${p.diet_plan_details.no_of_days} day(s))` : ""}
            </div>
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
  quantity?: number | null;
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function padDateKey(y: number, m: number, day: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DisplayMeals({ meals }: { meals: MealRow[] }) {
  if (!meals.length) return <EmptyState message="No meals recorded for this patient." />;
  return <MealsCalendarView meals={meals} />;
}

function MealsCalendarView({ meals }: { meals: MealRow[] }) {
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

  const [viewDate, setViewDate] = useState(() => {
    const first = meals.find((x) => x.meal_date)?.meal_date;
    if (first) {
      const [y, mo, dd] = first.split("-").map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(mo)) return new Date(y, mo - 1, dd || 1);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const goToday = () => setViewDate(new Date());

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-200/70 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50/90 via-white to-sky-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/30 p-4 sm:p-6 shadow-md">
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
                className={`min-h-[100px] rounded-xl border p-1.5 flex flex-col ${dayMeals.length
                    ? "border-cyan-300/80 bg-white/90 dark:bg-cyan-950/20 dark:border-cyan-800/70 shadow-sm"
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
                  {dayMeals.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-md bg-gradient-to-r from-cyan-100/90 to-teal-50 dark:from-cyan-900/40 dark:to-teal-900/20 border border-cyan-200/60 dark:border-cyan-800/50 px-1.5 py-1 text-[10px] leading-tight"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {m.meal_type_details?.name || "Meal"}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 truncate">{m.food_details?.name || "—"}</div>
                      {m.packaging_material_details?.name && (
                        <div className="text-cyan-800 dark:text-cyan-300/90 truncate">📦 {m.packaging_material_details.name}</div>
                      )}
                      {m.quantity != null && (
                        <div className="text-gray-500 dark:text-gray-500">Qty {m.quantity}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
