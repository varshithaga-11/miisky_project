import { useCallback, useEffect, useMemo, useState } from "react";
import { FiClipboard, FiFileText, FiSearch, FiActivity, FiCheckCircle, FiUser } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import {
  fetchAdminPatientList,
  fetchQuestionnaireForPatient,
  fetchDietPlansForPatient,
  fetchHealthReportsForPatientDoctor,
  saveReviewForPatient,
  resolveMediaUrl,
  type PatientUserRow,
  type PatientHealthReportRow,
} from "./api";
import { toast, ToastContainer } from "react-toastify";

function DietPlanRowView({ plan }: { plan: Record<string, unknown> }) {
  const details = plan.diet_plan_details as { title?: string; code?: string } | undefined;
  const nut = plan.nutritionist_details as { first_name?: string; last_name?: string } | undefined;
  const title = details?.title ?? "—";
  const code = details?.code ?? "";
  return (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
      <TableCell className="px-4 py-3 text-sm">
        <div className="font-medium text-gray-900 dark:text-white">{title}</div>
        {code ? <div className="text-xs text-gray-500">{code}</div> : null}
      </TableCell>
      <TableCell className="px-4 py-3 text-sm capitalize">{String(plan.status ?? "—")}</TableCell>
      <TableCell className="px-4 py-3 text-sm capitalize">{String(plan.payment_status ?? "—")}</TableCell>
      <TableCell className="px-4 py-3 text-xs text-gray-500">
        {plan.suggested_on ? String(plan.suggested_on).slice(0, 10) : "—"}
      </TableCell>
      <TableCell className="px-4 py-3 text-xs text-gray-500">
        {[nut?.first_name, nut?.last_name].filter(Boolean).join(" ") || "—"}
      </TableCell>
    </TableRow>
  );
}

function QuestionnaireView({ data }: { data: any }) {
  if (!data) return null;

  const renderSection = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white capitalize">
          {title}
        </h3>
      </div>
      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/[0.05] p-5 shadow-sm">
        {children}
      </div>
    </div>
  );

  const normalizeValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "—";
    if (value === true) return "Yes";
    if (value === false) return "No";
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "—";
    if (typeof value === "string") return value.trim() || "—";
    if (Array.isArray(value)) {
      if (value.length === 0) return "None reported";
      const labels = value
        .map((item) => {
          if (item === null || item === undefined) return "";
          if (typeof item === "string" || typeof item === "number") return String(item);
          if (typeof item === "object") {
            const obj = item as Record<string, unknown>;
            const base =
              (typeof obj.name === "string" && obj.name.trim()) ||
              (typeof obj.label === "string" && obj.label.trim()) ||
              (typeof obj.value === "string" && obj.value.trim()) ||
              (typeof obj.title === "string" && obj.title.trim()) ||
              "";
            const extras = [
              typeof obj.frequency === "string" && obj.frequency.trim()
                ? `frequency: ${obj.frequency.trim()}`
                : "",
              typeof obj.since_when === "string" && obj.since_when.trim()
                ? `since: ${obj.since_when.trim()}`
                : "",
              typeof obj.duration_minutes === "number" ? `duration: ${obj.duration_minutes} mins` : "",
              typeof obj.comments === "string" && obj.comments.trim()
                ? `comments: ${obj.comments.trim()}`
                : "",
              typeof obj.other_text === "string" && obj.other_text.trim() ? obj.other_text.trim() : "",
            ].filter(Boolean);
            if (base && extras.length > 0) return `${base} (${extras.join(", ")})`;
            if (base) return base;
            const compact = Object.entries(obj)
              .filter(([, v]) => v !== null && v !== undefined && v !== "")
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join(", ");
            return compact;
          }
          return "";
        })
        .filter(Boolean);
      return labels.length > 0 ? labels.join(", ") : "None reported";
    }
    if (typeof value === "object") {
      const compact = Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(", ");
      return compact || "—";
    }
    return String(value);
  };

  const InfoItem = ({ label, value, subValue }: { label: string; value: unknown; subValue?: string }) => (
    <div className="space-y-1">
      <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {normalizeValue(value)}
      </div>
      {subValue && <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{subValue}</div>}
    </div>
  );

  const BadgeList = ({ items }: { items: unknown[] }) => (
    <div className="flex flex-wrap gap-1.5">
      {items && items.length > 0 ? (
        items
          .map((item) => {
            if (typeof item === "string" || typeof item === "number") return String(item);
            if (item && typeof item === "object") {
              const obj = item as Record<string, unknown>;
              if (typeof obj.name === "string" && obj.name.trim()) return obj.name;
              if (typeof obj.label === "string" && obj.label.trim()) return obj.label;
              if (typeof obj.value === "string" && obj.value.trim()) return obj.value;
            }
            return "";
          })
          .filter(Boolean)
          .map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-gray-300 text-[11px] font-semibold border border-slate-200 dark:border-white/10"
            >
              {label}
            </span>
          ))
      ) : (
        <span className="text-gray-400 italic text-xs">None reported</span>
      )}
    </div>
  );

  const bmi =
    data.height_cm > 0 && data.weight_kg > 0
      ? (data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1)
      : "—";

  const joinNames = (arr: unknown) =>
    Array.isArray(arr)
      ? (arr as { name?: string; other_text?: string | null }[])
          .map((x) => {
            const base = x?.name || "";
            const o = x?.other_text?.trim();
            if (!base && !o) return "";
            if (o) return `${base} (${o})`;
            return base;
          })
          .filter(Boolean)
          .join(", ") || "—"
      : "—";

  const foodPreferenceText = (() => {
    const pref = data.food_preferences;
    if (Array.isArray(pref)) return pref.filter(Boolean).join(", ") || "None reported";
    if (typeof pref === "string") {
      const raw = pref.trim();
      if (!raw) return "None reported";
      // Backend sometimes stores JSON as a text field (e.g. "[\"Onion -dont add\"]").
      if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ") || "None reported";
          if (parsed && typeof parsed === "object") {
            const values = Object.values(parsed as Record<string, unknown>).filter(Boolean);
            return values.length > 0 ? values.join(", ") : "None reported";
          }
          return String(parsed || "None reported");
        } catch {
          return raw;
        }
      }
      return raw;
    }
    if (pref && typeof pref === "object") {
      const list = Object.values(pref).filter(Boolean);
      return list.length > 0 ? list.join(", ") : "None reported";
    }
    return "None reported";
  })();

  const shownKeys = new Set([
    "id",
    "user",
    "age",
    "height_cm",
    "weight_kg",
    "work_type",
    "physical_activities",
    "habits",
    "sleep_quality",
    "stress_level",
    "diet_pattern",
    "food_source",
    "meals_per_day",
    "meal_slots",
    "skips_meals",
    "snacks_between_meals",
    "falls_sick_frequency",
    "fruits_per_day",
    "vegetables_per_day",
    "non_veg_frequency",
    "consumes_egg",
    "consumes_dairy",
    "health_conditions",
    "symptoms",
    "deficiencies",
    "digestive_issues",
    "skin_issues",
    "autoimmune_diseases",
    "food_allergy",
    "food_allergy_details",
    "food_preferences",
    "surgery_history",
    "surgery_details",
    "medicine_allergy",
    "medicine_allergy_details",
    "consulted_doctor",
    "consultant_doctor_name",
    "consultant_doctor_specialty",
    "consultant_doctor_phone",
    "other_health_concerns",
    "menstrual_pattern",
    "on_medication",
    "additional_notes",
    "any_other_comments",
    "any_notes_for_care_team",
    "created_on",
    "updated_on",
  ]);

  const additionalEntries = Object.entries(data as Record<string, unknown>).filter(
    ([key]) => !shownKeys.has(key)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {renderSection(
            "Physical Stats & Lifestyle",
            <FiUser className="w-4 h-4" />,
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <InfoItem label="Age" value={`${data.age} years`} />
              <InfoItem label="Height" value={`${data.height_cm} cm`} />
              <InfoItem label="Weight" value={`${data.weight_kg} kg`} />
              <InfoItem label="BMI" value={bmi} />
              <InfoItem label="Work type" value={data.work_type} />
              <InfoItem label="Physical activities" value={joinNames(data.physical_activities)} />
              <InfoItem label="Lifestyle habits" value={joinNames(data.habits)} />
              <InfoItem label="Sleep Quality" value={data.sleep_quality} />
              <InfoItem label="Stress Level" value={data.stress_level} />
            </div>
          )}

          {renderSection(
            "Dietary Habits",
            <FiClipboard className="w-4 h-4" />,
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <InfoItem label="Pattern" value={data.diet_pattern?.replace("_", " ")} />
              <InfoItem label="Source" value={data.food_source} />
              <InfoItem label="Meals / Day" value={data.meals_per_day} />
              <InfoItem label="Meal Slots" value={data.meal_slots} />
              <InfoItem label="Skips Meals" value={data.skips_meals} />
              <InfoItem label="Snacks" value={data.snacks_between_meals} />
              <InfoItem label="Non-veg Frequency" value={data.non_veg_frequency} />
              <InfoItem label="Consumes Egg" value={data.consumes_egg} />
              <InfoItem label="Consumes Dairy" value={data.consumes_dairy} />
              <InfoItem label="Sick freq." value={data.falls_sick_frequency} />
              <div className="col-span-full grid grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-white/5 mt-2">
                <InfoItem label="Fruits / Day" value={data.fruits_per_day} />
                <InfoItem label="Veggies / Day" value={data.vegetables_per_day} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {renderSection(
            "Medical conditions",
            <FiActivity className="w-4 h-4" />,
            <div className="space-y-4">
              {data.health_conditions?.filter((c: any) => c.has_condition).length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {data.health_conditions
                    .filter((c: any) => c.has_condition)
                    .map((c: any) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/30 dark:border-red-500/10 dark:bg-red-500/5 transition-all hover:bg-red-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                          <div>
                            <div className="text-sm font-bold text-red-900 dark:text-red-400 capitalize">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-red-700/60 dark:text-red-400/50 uppercase tracking-wider font-semibold">
                              {c.category}
                            </div>
                          </div>
                        </div>
                        {c.since_when && (
                          <div className="text-[11px] text-red-600 dark:text-red-400/80 font-bold bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                            Since: {c.since_when}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-sm font-semibold border border-emerald-100 dark:border-emerald-500/20">
                    <FiCheckCircle className="w-4 h-4" /> No active issues
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/[0.05] p-5 shadow-sm space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Symptoms
                  </div>
                  <BadgeList items={data.symptoms} />
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Deficiencies
                  </div>
                  <BadgeList items={data.deficiencies} />
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Digestive Issues
                  </div>
                  <BadgeList items={data.digestive_issues} />
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Skin Issues
                  </div>
                  <BadgeList items={data.skin_issues} />
                </div>
                <div className="space-y-3 col-span-2">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Autoimmune Diseases
                  </div>
                  <BadgeList items={data.autoimmune_diseases} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderSection(
        "Clinical History & Consultation",
        <FiFileText className="w-4 h-4" />,
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem label="Surgery History" value={data.surgery_history} />
          <InfoItem label="Surgery Details" value={data.surgery_details} />
          <InfoItem label="Medicine Allergy" value={data.medicine_allergy} />
          <InfoItem label="Medicine Allergy Details" value={data.medicine_allergy_details} />
          <InfoItem label="Consulted Doctor" value={data.consulted_doctor} />
          <InfoItem label="Doctor Name" value={data.consultant_doctor_name} />
          <InfoItem label="Doctor Specialty" value={data.consultant_doctor_specialty} />
          <InfoItem label="Doctor Phone" value={data.consultant_doctor_phone} />
          <InfoItem label="Other Health Concerns" value={data.other_health_concerns} />
          <InfoItem label="Menstrual Pattern" value={data.menstrual_pattern} />
          <InfoItem label="On Medication" value={data.on_medication} />
        </div>
      )}

      {additionalEntries.length > 0 &&
        renderSection(
          "Other Questionnaire Fields",
          <FiClipboard className="w-4 h-4" />,
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalEntries.map(([key, value]) => (
              <InfoItem key={key} label={key.replace(/_/g, " ")} value={value} />
            ))}
          </div>
        )}

      {/* Footer Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-orange-50/40 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10">
          <div className="text-[10px] font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-2">
            Food Allergies
          </div>
          <p className="text-sm text-orange-900 dark:text-orange-200 font-medium">
            {data.food_allergy ? data.food_allergy_details || "Yes (No details provided)" : "None"}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
          <div className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-2">
            Preferences
          </div>
          <div className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">
            {foodPreferenceText}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Additional Notes
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
            {data.additional_notes || "No extra notes"}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/10">
          <div className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-2">
            Team Notes & Timeline
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-cyan-900 dark:text-cyan-100 font-medium">
              {data.any_notes_for_care_team || data.any_other_comments || "No care team notes"}
            </p>
            <p className="text-xs text-cyan-700/80 dark:text-cyan-200/80">
              Created: {data.created_on ? String(data.created_on).replace("T", " ").slice(0, 19) : "—"}
            </p>
            <p className="text-xs text-cyan-700/80 dark:text-cyan-200/80">
              Updated: {data.updated_on ? String(data.updated_on).replace("T", " ").slice(0, 19) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const AllPatientsPage: React.FC = () => {
  const [rows, setRows] = useState<PatientUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [qOpen, setQOpen] = useState(false);
  const [dietOpen, setDietOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [modalPatient, setModalPatient] = useState<PatientUserRow | null>(null);

  const [qLoading, setQLoading] = useState(false);
  const [qData, setQData] = useState<unknown | null>(null);

  const [dietLoading, setDietLoading] = useState(false);
  const [dietRows, setDietRows] = useState<Record<string, unknown>[]>([]);

  const [reportsLoading, setReportsLoading] = useState(false);
  const [reports, setReports] = useState<PatientHealthReportRow[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  /** Selected documents in list order (for comments panel). */
  const selectedReports = useMemo(
    () => reports.filter((r) => selectedReportIds.includes(r.id)),
    [reports, selectedReportIds]
  );

  const toggleReportSelection = (id: number) => {
    setSelectedReportIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllReports = () => {
    setSelectedReportIds(reports.map((r) => r.id));
  };

  const clearReportSelection = () => {
    setSelectedReportIds([]);
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminPatientList(currentPage, pageSize, searchTerm);
      setRows(res.results);
      setTotalItems(res.count);
      setTotalPages(res.total_pages);
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotalItems(0);
      setTotalPages(0);
      toast.error("Could not load patients");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openQuestionnaire = async (p: PatientUserRow) => {
    setModalPatient(p);
    setQOpen(true);
    setQLoading(true);
    setQData(null);
    try {
      setQData(await fetchQuestionnaireForPatient(p.id));
    } catch {
      toast.error("Failed to load questionnaire");
    } finally {
      setQLoading(false);
    }
  };

  const openDiet = async (p: PatientUserRow) => {
    setModalPatient(p);
    setDietOpen(true);
    setDietLoading(true);
    setDietRows([]);
    try {
      const raw = await fetchDietPlansForPatient(p.id);
      setDietRows(Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []);
    } catch {
      toast.error("Failed to load diet plans");
    } finally {
      setDietLoading(false);
    }
  };

  const openReports = async (p: PatientUserRow) => {
    setModalPatient(p);
    setReportsOpen(true);
    setReportsLoading(true);
    setReports([]);
    setCommentText("");
    setSelectedReportIds([]);
    try {
      const raw = await fetchHealthReportsForPatientDoctor(p.id);
      const list = (Array.isArray(raw) ? raw : []) as PatientHealthReportRow[];
      setReports(list);
      if (list.length === 1) {
        setSelectedReportIds([list[0].id]);
      }
    } catch {
      toast.error("Failed to load health reports");
    } finally {
      setReportsLoading(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPatient) return;
    const t = commentText.trim();
    if (!t) {
      toast.warning("Please enter a comment");
      return;
    }
    if (selectedReportIds.length === 0) {
      toast.warning("Select one or more documents on the left");
      return;
    }
    setSubmittingReview(true);
    try {
      await saveReviewForPatient({
        user: modalPatient.id,
        comments: t,
        reports: selectedReportIds,
      });
      toast.success("Comment saved");
      setCommentText("");
      const raw = await fetchHealthReportsForPatientDoctor(modalPatient.id);
      const list = (Array.isArray(raw) ? raw : []) as PatientHealthReportRow[];
      setReports(list);
      setSelectedReportIds((prev) => prev.filter((id) => list.some((r) => r.id === id)));
    } catch {
      toast.error("Failed to save comment");
    } finally {
      setSubmittingReview(false);
    }
  };

  // questionnaireJson useMemo removed as we now use QuestionnaireView component

  return (
    <>
      <PageMeta title="All patients" description="Browse patients, questionnaire, diet plans, and health reports" />
      <PageBreadcrumb pageTitle="All patients" />
      <ToastContainer position="bottom-right" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search name, email, mobile..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
                <Select
                  value={String(pageSize)}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "10", label: "10" },
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                  ]}
                  className="w-20"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} patients
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      #
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Patient
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Mobile
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                        Loading patients...
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, index) => (
                      <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                        <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {[r.first_name, r.last_name].filter(Boolean).join(" ") || r.username}
                          </div>
                          <div className="text-xs text-gray-500">{r.email}</div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{r.mobile || "—"}</TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openQuestionnaire(r)}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300"
                            >
                              <FiClipboard className="h-3.5 w-3.5" />
                              Questionnaire
                            </button>
                            <button
                              type="button"
                              onClick={() => openDiet(r)}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"
                            >
                              <FiFileText className="h-3.5 w-3.5" />
                              Diet plans
                            </button>
                            <button
                              type="button"
                              onClick={() => openReports(r)}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-300"
                            >
                              <FiActivity className="h-3.5 w-3.5" />
                              Health reports
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={qOpen}
        showCloseButton={false}
        onClose={() => {
          setQOpen(false);
          setModalPatient(null);
        }}
        className="max-w-6xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Questionnaire</h2>
            {modalPatient && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {[modalPatient.first_name, modalPatient.last_name].filter(Boolean).join(" ") || modalPatient.username}
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setQOpen(false)}>
            Close
          </Button>
        </div>
        <div className="p-6 flex-1 min-h-0">
          {qLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading questionnaire data...</p>
            </div>
          ) : !qData ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
               <FiClipboard className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
               <p className="text-gray-500 dark:text-gray-400 font-medium">No questionnaire submitted for this patient.</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto max-h-[calc(90vh-140px)] overflow-y-auto pr-1 sm:pr-2 overscroll-contain">
              <QuestionnaireView data={qData} />
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={dietOpen}
        showCloseButton={false}
        onClose={() => {
          setDietOpen(false);
          setModalPatient(null);
        }}
        className="max-w-6xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Diet plans</h2>
            {modalPatient && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {[modalPatient.first_name, modalPatient.last_name].filter(Boolean).join(" ") || modalPatient.username}
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setDietOpen(false)}>
            Close
          </Button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {dietLoading ? (
            <p className="text-gray-500">Loading…</p>
          ) : dietRows.length === 0 ? (
            <p className="text-gray-500">No diet plans found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader className="px-4 py-2 text-xs">
                      Plan
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2 text-xs">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2 text-xs">
                      Payment
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2 text-xs">
                      Suggested
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2 text-xs">
                      Nutritionist
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dietRows.map((plan) => (
                    <DietPlanRowView key={String(plan.id)} plan={plan} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={reportsOpen}
        showCloseButton={false}
        onClose={() => {
          setReportsOpen(false);
          setModalPatient(null);
        }}
        className="max-w-6xl w-[90vw] p-0 rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col h-[min(85vh,760px)] max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health reports</h2>
            {modalPatient && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {[modalPatient.first_name, modalPatient.last_name].filter(Boolean).join(" ") || modalPatient.username}
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setReportsOpen(false)}>
            Close
          </Button>
        </div>
        <div className="flex flex-1 flex-col md:flex-row min-h-0 overflow-hidden">
          {reportsLoading ? (
            <div className="p-6 text-gray-500">Loading…</div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-gray-500">No health reports uploaded.</div>
          ) : (
            <>
              {/* Left: document list */}
              <div className="w-full md:w-[min(100%,280px)] shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10 flex flex-col min-h-0 max-h-[40vh] md:max-h-none">
                <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Documents
                  </p>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={selectAllReports}
                      className="text-[11px] text-sky-600 hover:underline dark:text-sky-400"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={clearReportSelection}
                      className="text-[11px] text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p className="px-4 pb-2 text-[11px] text-gray-500">
                  Check one or more to view comments and add a note linked to all selected.
                </p>
                <ul className="overflow-y-auto flex-1 px-2 pb-4 space-y-1">
                  {reports.map((rep) => {
                    const fileUrl = resolveMediaUrl(rep.report_file);
                    const isSel = selectedReportIds.includes(rep.id);
                    return (
                      <li key={rep.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleReportSelection(rep.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleReportSelection(rep.id);
                            }
                          }}
                          className={`w-full text-left rounded-xl px-2 py-2 transition-colors border flex gap-2 items-start cursor-pointer ${
                            isSel
                              ? "bg-sky-50 border-sky-200 dark:bg-sky-500/15 dark:border-sky-500/40"
                              : "bg-gray-50/80 border-transparent hover:bg-gray-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleReportSelection(rep.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1.5 rounded border-gray-300 shrink-0"
                            aria-label={`Select ${rep.title || "report"}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                              {rep.title || "Untitled report"}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              {rep.report_type || "—"} · {rep.uploaded_on ? String(rep.uploaded_on).slice(0, 10) : "—"}
                            </div>
                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                              >
                                Open file
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right: comments for selected document(s) */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4 md:p-6">
                {selectedReports.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Select one or more documents on the left to see comments and add your note.
                  </p>
                ) : (
                  <>
                    <div className="shrink-0 mb-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {selectedReports.length === 1
                          ? selectedReports[0].title || "Untitled report"
                          : `${selectedReports.length} documents selected`}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedReports.length === 1
                          ? "Comments for this document"
                          : "Comments grouped by document below. Your new comment will apply to all selected documents."}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-[120px] rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-gray-900/30 p-4 mb-4 space-y-6">
                      {selectedReports.map((rep) => (
                        <section key={rep.id} className="border-b border-gray-200/80 dark:border-white/10 last:border-0 last:pb-0 pb-6 last:pb-0">
                          {selectedReports.length > 1 && (
                            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
                              {rep.title || "Untitled report"}
                            </h4>
                          )}
                          {rep.reviews && rep.reviews.length > 0 ? (
                            <ul className="space-y-4">
                              {[...rep.reviews]
                                .sort(
                                  (a, b) =>
                                    new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
                                )
                                .map((rv) => (
                                  <li
                                    key={rv.id}
                                    className="pb-4 border-b border-gray-200/60 dark:border-white/10 last:border-0 last:pb-0"
                                  >
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {rv.reviewer_role === "doctor"
                                          ? "Doctor"
                                          : rv.reviewer_role === "nutritionist"
                                            ? "Dietitian"
                                            : "Reviewer"}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {rv.nutritionist_name || "—"}
                                      </span>
                                      <span className="text-[10px] text-gray-400 ml-auto">
                                        {rv.created_on
                                          ? new Date(rv.created_on).toLocaleString()
                                          : ""}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                      {rv.comments}
                                    </p>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No comments yet for this document.</p>
                          )}
                        </section>
                      ))}
                    </div>

                    <form onSubmit={submitComment} className="shrink-0 space-y-3 border-t border-gray-100 dark:border-white/10 pt-4">
                      <Label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Add a comment
                      </Label>
                      <p className="text-xs text-gray-500">
                        Linked to {selectedReportIds.length} selected document
                        {selectedReportIds.length === 1 ? "" : "s"}.
                      </p>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm p-3"
                        placeholder="Write your comment…"
                      />
                      <Button type="submit" disabled={submittingReview}>
                        {submittingReview ? "Saving…" : "Submit comment"}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        </div>
      </Modal>

    </>
  );
};

export default AllPatientsPage;
