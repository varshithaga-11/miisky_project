import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AllotedPatient,
  getMyAllotedPatientsLite,
  getPatientQuestionnaireByUser,
  fetchPatientKitchenDistances,
  PatientKitchenDistanceRow,
} from "./api";
import InputField from "../../../components/form/input/InputField";
import { UserCircleIcon, GroupIcon } from "../../../icons";
import { FiMapPin, FiActivity, FiUser, FiHeart, FiInfo, FiNavigation2, FiX, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const AllottedPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<AllotedPatient[]>([]);
  const [questionnaireByUserId, setQuestionnaireByUserId] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [questionnaireLoadingByUserId, setQuestionnaireLoadingByUserId] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [distanceModalPatient, setDistanceModalPatient] = useState<AllotedPatient | null>(null);
  const [distanceRows, setDistanceRows] = useState<PatientKitchenDistanceRow[] | null>(null);
  const [kitchensLoading, setKitchensLoading] = useState(false);
  const [kitchensFetchError, setKitchensFetchError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const patientsPerPage = 5;

  const extractLabel = (item: unknown) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object" && "name" in item) {
      const name = (item as { name?: unknown }).name;
      return typeof name === "string" ? name : "";
    }
    return "";
  };

  const getFoodPreferencesView = (foodPreferences: unknown): string[] | Record<string, string[]> | null => {
    if (!foodPreferences) return null;

    if (Array.isArray(foodPreferences)) {
      return foodPreferences.filter((value): value is string => typeof value === "string");
    }

    if (typeof foodPreferences === "string") {
      const trimmed = foodPreferences.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter((value): value is string => typeof value === "string");
          }
          if (parsed && typeof parsed === "object") {
            return parsed as Record<string, string[]>;
          }
        } catch {
          return [trimmed];
        }
      }
      return [trimmed];
    }

    if (foodPreferences && typeof foodPreferences === "object") {
      return foodPreferences as Record<string, string[]>;
    }

    return null;
  };

  const getConditionDetails = (item: unknown) => {
    if (!item || typeof item !== "object") return "";
    const condition = item as {
      since_when?: string | null;
      comments?: string | null;
      category?: string | null;
    };
    const parts: string[] = [];
    if (condition.category) parts.push(condition.category);
    if (condition.since_when) parts.push(`since ${condition.since_when}`);
    if (condition.comments) parts.push(condition.comments);
    return parts.join(" | ");
  };

  const loadPatientKitchenDistances = async (patientUserId: number) => {
    setKitchensLoading(true);
    setKitchensFetchError(false);
    try {
      const rows = await fetchPatientKitchenDistances(patientUserId);
      setDistanceRows(rows);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load distances");
      setKitchensFetchError(true);
      setDistanceRows(null);
    } finally {
      setKitchensLoading(false);
    }
  };

  const openDistanceModal = async (p: AllotedPatient) => {
    setDistanceModalPatient(p);
    setDistanceRows(null);
    await loadPatientKitchenDistances(p.user.id);
  };

  const closeDistanceModal = () => setDistanceModalPatient(null);

  const toggleRow = async (userId: number) => {
    if (expandedRows.includes(userId)) {
      setExpandedRows((prev) => prev.filter((r) => r !== userId));
      return;
    }

    if (!questionnaireByUserId[userId]) {
      setQuestionnaireLoadingByUserId((prev) => ({ ...prev, [userId]: true }));
      try {
        const questionnaire = await getPatientQuestionnaireByUser(userId);
        setQuestionnaireByUserId((prev) => ({ ...prev, [userId]: questionnaire }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load patient questionnaire");
        setQuestionnaireLoadingByUserId((prev) => ({ ...prev, [userId]: false }));
        return;
      } finally {
        setQuestionnaireLoadingByUserId((prev) => ({ ...prev, [userId]: false }));
      }
    }

    setExpandedRows((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyAllotedPatientsLite({
          page: currentPage,
          limit: patientsPerPage,
          search: debouncedSearchTerm || undefined,
        });
        setPatients(res.results || []);
        setTotalPatients(res.count || 0);
        setTotalPages(res.total_pages || 1);
        setExpandedRows([]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load allotted patients");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, patientsPerPage, debouncedSearchTerm]);

  const patientsWithQuestionnaire = useMemo(
    () =>
      patients.map((patient) => ({
        ...patient,
        questionnaire: questionnaireByUserId[patient.user.id] || null,
      })),
    [patients, questionnaireByUserId]
  );

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Allotted Patients" description="View and manage patients assigned to you" />
      <PageBreadcrumb pageTitle="Allotted Patients" />

      <div className="space-y-6">
        {/* Statistics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <GroupIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Patients</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{totalPatients}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-80">
            <InputField
              placeholder="Search by name, email or username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{patients.length}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPatients}</span> patient(s)
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <TableCell isHeader className="px-5 py-4 text-start font-bold">Patient</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-start font-bold">Contact Info</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-start font-bold text-center">Basics</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-start font-bold">Profile</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-end font-bold">Details</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                        <span className="text-gray-500">Loading patients...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : patientsWithQuestionnaire.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-20 text-center text-gray-500 italic">
                      {searchTerm ? "No patients found matching your search." : "No patients have been allotted to you yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  patientsWithQuestionnaire.map((p) => (
                    <React.Fragment key={p.user.id}>
                      <TableRow className="border-t border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                              <UserCircleIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-semibold text-gray-900 dark:text-white">
                                  {p.user.first_name || p.user.last_name
                                    ? `${p.user.first_name || ""} ${p.user.last_name || ""}`
                                    : p.user.username}
                                </span>
                                {p.mapping_id ? (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-tighter border border-emerald-100 dark:border-emerald-500/20">
                                    Active
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-white/[0.05] text-gray-500 rounded-full text-[8px] font-black uppercase tracking-tighter border border-gray-100 dark:border-white/[0.05]">
                                    Reassigned
                                  </div>
                                )}
                                {p.reassignment_details && (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full text-[8px] font-black uppercase tracking-tighter border border-brand-100 dark:border-brand-500/20">
                                    <FiInfo size={10} /> {p.reassignment_details.reason.replace('_', ' ')}
                                  </div>
                                )}
                              </div>
                              <span className="truncate text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
                                @{p.user.username}
                                {p.active_kitchen && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full text-[8px] font-black uppercase tracking-tighter border border-indigo-100 dark:border-indigo-500/20">
                                      <FiMapPin size={10} /> {p.active_kitchen.current_kitchen || 'No Kitchen'}
                                    </div>
                                    {p.active_kitchen.original_kitchen && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 dark:bg-white/[0.05] text-gray-500 rounded-full text-[8px] font-black uppercase tracking-tighter border border-gray-100 dark:border-white/[0.05]">
                                        Prev: {p.active_kitchen.original_kitchen} (Until: {p.active_kitchen.effective_from})
                                      </div>
                                    )}
                                  </div>
                                )}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{p.user.email}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{p.user.mobile || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase">
                                {p.questionnaire?.age ?? "??"} YRS
                             </div>
                             <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase">
                                {p.questionnaire?.weight_kg ? `${p.questionnaire.weight_kg}KG` : "??"}
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                <FiActivity className="text-indigo-500" /> {p.questionnaire?.work_type || "N/A"}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                <FiHeart className="text-rose-500" /> {p.questionnaire?.diet_pattern || "N/A"}
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-end">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Distance to micro kitchens"
                              onClick={() => openDistanceModal(p)}
                              className="p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                            >
                              <FiNavigation2 className="h-5 w-5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              title={expandedRows.includes(p.user.id) ? "Close details" : "View details"}
                              onClick={() => void toggleRow(p.user.id)}
                              disabled={!!questionnaireLoadingByUserId[p.user.id]}
                              className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center ${
                                expandedRows.includes(p.user.id)
                                  ? "bg-gray-900 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              {questionnaireLoadingByUserId[p.user.id] ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <FiEye className="h-5 w-5" aria-hidden />
                              )}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Section */}
                      <AnimatePresence>
                        {expandedRows.includes(p.user.id) && (
                          <TableRow className="bg-gray-50/30 dark:bg-white/[0.01]">
                            <TableCell colSpan={5} className="p-0">
                               <motion.div 
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: "auto" }}
                                 exit={{ opacity: 0, height: 0 }}
                                 className="overflow-hidden"
                               >
                                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-gray-100 dark:border-white/[0.05]">
                                     
                                     {/* Column 1: Personal & Physical */}
                                     <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-6">
                                           <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                              <FiUser size={18} />
                                           </div>
                                           <h5 className="font-black uppercase tracking-widest text-xs text-gray-900 dark:text-white">Profile Overview</h5>
                                        </div>
                                        
                                        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4 shadow-sm">
                                           <div className="flex justify-between items-center text-[10px] border-b border-gray-50 dark:border-white/5 pb-3">
                                              <span className="text-gray-400 font-bold uppercase">Height / Weight</span>
                                              <span className="text-gray-900 dark:text-white font-black">{p.questionnaire?.height_cm || '??'}cm / {p.questionnaire?.weight_kg || '??'}kg</span>
                                           </div>
                                           <div className="flex justify-between items-center text-[10px] border-b border-gray-50 dark:border-white/5 pb-3">
                                              <span className="text-gray-400 font-bold uppercase">Sleep / Stress</span>
                                              <span className="text-gray-900 dark:text-white font-black capitalize">{p.questionnaire?.sleep_quality || 'N/A'} / {p.questionnaire?.stress_level || 'N/A'}</span>
                                           </div>
                                           <div className="flex justify-between items-center text-[10px] border-b border-gray-50 dark:border-white/5 pb-3">
                                              <span className="text-gray-400 font-bold uppercase">Meal Pattern</span>
                                              <span className="text-gray-900 dark:text-white font-black">
                                                {p.questionnaire?.meals_per_day} Meals {p.questionnaire?.skips_meals ? '(Skips)' : ''}
                                              </span>
                                           </div>
                                           <div className="flex justify-between items-center text-[10px] border-b border-gray-50 dark:border-white/5 pb-3">
                                              <span className="text-gray-400 font-bold uppercase">Food Source</span>
                                              <span className="text-gray-900 dark:text-white font-black capitalize">{p.questionnaire?.food_source || 'N/A'}</span>
                                           </div>
                                           <div className="flex justify-between items-center text-[10px]">
                                              <span className="text-gray-400 font-bold uppercase">Sick Freq.</span>
                                              <span className="text-gray-900 dark:text-white font-black capitalize">{p.questionnaire?.falls_sick_frequency || 'N/A'}</span>
                                           </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                                           <FiMapPin className="text-indigo-500" />
                                           <div className="flex flex-col">
                                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</span>
                                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 italic">
                                                 {p.user.address ? `${p.user.address}, ` : ''}
                                                 {p.user.city || ''}
                                                 {p.user.state ? `, ${p.user.state}` : ''}
                                                 {p.user.zip_code ? ` - ${p.user.zip_code}` : ''}
                                                 {p.user.country ? `, ${p.user.country}` : ''}
                                                 {!p.user.address && !p.user.city && 'No address provided'}
                                              </span>
                                           </div>
                                        </div>
                                     </div>

                                     {/* Column 2: Health & Symptoms */}
                                     <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-6">
                                           <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                              <FiHeart size={18} />
                                           </div>
                                           <h5 className="font-black uppercase tracking-widest text-xs text-gray-900 dark:text-white">Health Indicators</h5>
                                        </div>

                                        <div className="space-y-4">
                                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Medical Conditions & Risks</span>
                                           <div className="flex flex-wrap gap-2">
                                              {Array.isArray(p.questionnaire?.health_conditions) &&
                                                p.questionnaire.health_conditions
                                                  .filter((h: unknown) => !(h && typeof h === "object") || Boolean((h as { has_condition?: boolean }).has_condition))
                                                  .map((h: unknown) => {
                                                   const label = typeof h === "string" ? h : String((h as { name?: string }).name || "");
                                                   const details = getConditionDetails(h);
                                                   if (!label) return null;
                                                   return (
                                                   <span key={label} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl text-[9px] font-black uppercase border border-rose-100/50 dark:border-rose-900/20">
                                                      {label.replace('_', ' ')}
                                                      {details ? ` (${details})` : ""}
                                                   </span>
                                                );})
                                              }
                                              {(!Array.isArray(p.questionnaire?.health_conditions) ||
                                                p.questionnaire.health_conditions.filter((h: unknown) => !(h && typeof h === "object") || Boolean((h as { has_condition?: boolean }).has_condition)).length === 0) && (
                                                <span className="text-[10px] italic text-gray-400">No active conditions reported</span>
                                              )}
                                           </div>

                                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pt-4">Symptoms & Vulnerabilities</span>
                                           <div className="flex flex-wrap gap-2">
                                              {Array.isArray(p.questionnaire?.symptoms) &&
                                                p.questionnaire.symptoms.map((s: unknown, idx: number) => {
                                                  const label = extractLabel(s);
                                                  if (!label) return null;
                                                  return (
                                                    <span key={`sym-${idx}-${label}`} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-xl text-[9px] font-black uppercase">
                                                       {label.replace('_', ' ')}
                                                    </span>
                                                  );
                                                })}
                                              {Array.isArray(p.questionnaire?.deficiencies) &&
                                                p.questionnaire.deficiencies.map((d: unknown, idx: number) => {
                                                  const label = extractLabel(d);
                                                  if (!label) return null;
                                                  return (
                                                    <span key={`def-${idx}-${label}`} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase italic">
                                                       Def: {label}
                                                    </span>
                                                  );
                                                })}
                                              {Array.isArray(p.questionnaire?.digestive_issues) &&
                                                p.questionnaire.digestive_issues.map((d: unknown, idx: number) => {
                                                  const label = extractLabel(d);
                                                  if (!label) return null;
                                                  return (
                                                    <span key={`dig-${idx}-${label}`} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-black uppercase">
                                                       {label.replace('_', ' ')}
                                                    </span>
                                                  );
                                                })}
                                              {Array.isArray(p.questionnaire?.skin_issues) &&
                                                p.questionnaire.skin_issues.map((d: unknown, idx: number) => {
                                                  const label = extractLabel(d);
                                                  if (!label) return null;
                                                  return (
                                                    <span key={`skin-${idx}-${label}`} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/10 text-teal-700 dark:text-teal-300 rounded-xl text-[9px] font-black uppercase">
                                                       Skin: {label.replace('_', ' ')}
                                                    </span>
                                                  );
                                                })}
                                              {Array.isArray(p.questionnaire?.autoimmune_diseases) &&
                                                p.questionnaire.autoimmune_diseases.map((d: unknown, idx: number) => {
                                                  const label = extractLabel(d);
                                                  if (!label) return null;
                                                  return (
                                                    <span key={`auto-${idx}-${label}`} className="px-3 py-1.5 bg-fuchsia-50 dark:bg-fuchsia-900/10 text-fuchsia-700 dark:text-fuchsia-300 rounded-xl text-[9px] font-black uppercase">
                                                       Auto: {label.replace('_', ' ')}
                                                    </span>
                                                  );
                                                })}
                                           </div>

                                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pt-4">Activities &amp; habits</span>
                                           <div className="flex flex-wrap gap-2">
                                              {Array.isArray(p.questionnaire?.physical_activities) &&
                                                p.questionnaire.physical_activities.map(
                                                  (
                                                    a: {
                                                      name?: string;
                                                      other_text?: string | null;
                                                      frequency?: string | null;
                                                      duration_minutes?: number | null;
                                                      comments?: string | null;
                                                    },
                                                    i: number
                                                  ) => {
                                                    if (!a?.name) return null;
                                                    const extras = [
                                                      a.frequency ? `freq: ${a.frequency}` : "",
                                                      a.duration_minutes != null ? `${a.duration_minutes} mins` : "",
                                                      a.other_text?.trim() || "",
                                                      a.comments?.trim() || "",
                                                    ].filter(Boolean);
                                                    return (
                                                      <span
                                                        key={`pa-${i}-${a.name}`}
                                                        className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase"
                                                        title={extras.join(" | ") || undefined}
                                                      >
                                                        {a.name}
                                                        {extras.length > 0 ? `: ${extras.join(", ")}` : ""}
                                                      </span>
                                                    );
                                                  }
                                                )}
                                              {Array.isArray(p.questionnaire?.habits) &&
                                                p.questionnaire.habits.map(
                                                  (
                                                    h: {
                                                      name?: string;
                                                      other_text?: string | null;
                                                      frequency?: string | null;
                                                      since_when?: string | null;
                                                      comments?: string | null;
                                                    },
                                                    i: number
                                                  ) => {
                                                    if (!h?.name) return null;
                                                    const extras = [
                                                      h.frequency ? `freq: ${h.frequency}` : "",
                                                      h.since_when ? `since: ${h.since_when}` : "",
                                                      h.other_text?.trim() || "",
                                                      h.comments?.trim() || "",
                                                    ].filter(Boolean);
                                                    return (
                                                      <span
                                                        key={`hab-${i}-${h.name}`}
                                                        className="px-3 py-1.5 bg-gray-800 text-white rounded-xl text-[9px] font-black uppercase"
                                                        title={extras.join(" | ") || undefined}
                                                      >
                                                        Habit: {h.name}
                                                        {extras.length > 0 ? `: ${extras.join(", ")}` : ""}
                                                      </span>
                                                    );
                                                  }
                                                )}
                                           </div>
                                        </div>
                                     </div>

                                     {/* Column 3: Preferences & Notes */}
                                     <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-6">
                                           <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                              <FiInfo size={18} />
                                           </div>
                                           <h5 className="font-black uppercase tracking-widest text-xs text-gray-900 dark:text-white">Preferences & Allergies</h5>
                                        </div>

                                        <div className="space-y-6">
                                            {p.reassignment_details && (
                                              <div className="mb-6 p-4 bg-brand-50/50 dark:bg-brand-500/5 rounded-2xl border border-brand-100/50 dark:border-brand-500/10">
                                                <div className="flex items-center gap-2 mb-3">
                                                  <FiInfo className="text-brand-500" size={14} />
                                                  <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest leading-none">Reassignment Details</span>
                                                </div>
                                                <div className="space-y-2">
                                                   <div className="flex justify-between text-[9px]">
                                                      <span className="text-gray-400 font-bold uppercase tracking-tighter">Effective From</span>
                                                      <span className="text-brand-600 dark:text-brand-400 font-black">{p.reassignment_details.effective_from}</span>
                                                   </div>
                                                   <div className="flex justify-between text-[9px]">
                                                      <span className="text-gray-400 font-bold uppercase tracking-tighter">Previous</span>
                                                      <span className="text-gray-700 dark:text-gray-300 font-bold">@{p.reassignment_details.previous_nutritionist}</span>
                                                   </div>
                                                   <div className="flex justify-between text-[9px]">
                                                      <span className="text-gray-400 font-bold uppercase tracking-tighter">New</span>
                                                      <span className="text-gray-700 dark:text-gray-300 font-bold">@{p.reassignment_details.new_nutritionist}</span>
                                                   </div>
                                                   <div className="flex justify-between text-[9px]">
                                                      <span className="text-gray-400 font-bold uppercase tracking-tighter">Reason</span>
                                                      <span className="text-gray-700 dark:text-gray-300 font-black uppercase">{p.reassignment_details.reason.replace('_', ' ')}</span>
                                                   </div>
                                                </div>
                                              </div>
                                            )}

                                           <div>
                                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Food Intake</span>
                                              <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
                                                 {p.questionnaire?.food_preferences ? (
                                                   (() => {
                                                     const preferences = getFoodPreferencesView(p.questionnaire.food_preferences);
                                                     if (Array.isArray(preferences)) {
                                                       return (
                                                         <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                                                           {preferences.join(", ")}
                                                         </p>
                                                       );
                                                     }
                                                     if (preferences && typeof preferences === "object") {
                                                       return (
                                                         <div className="grid grid-cols-1 gap-2">
                                                           {Object.entries(preferences).map(([cat, list]) => (
                                                             Array.isArray(list) && list.length > 0 && (
                                                               <div key={cat} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                                                                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{cat}</span>
                                                                 <p className="text-[9px] font-black text-indigo-500 uppercase">{list.join(", ")}</p>
                                                               </div>
                                                             )
                                                           ))}
                                                         </div>
                                                       );
                                                     }
                                                     return <span className="text-xs text-gray-400 italic">No preferences listed</span>;
                                                   })()
                                                 ) : (
                                                   <span className="text-xs text-gray-400 italic">No preferences listed</span>
                                                 )}
                                              </div>
                                           </div>
                                           
                                           {p.questionnaire?.food_allergy && (
                                              <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                                 <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">⚠️ ALLERGIES</span>
                                                 <p className="text-[10px] font-bold text-rose-500 italic">{p.questionnaire?.food_allergy_details || "Present - Details not specified"}</p>
                                              </div>
                                           )}
                                           
                                           <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2 underline decoration-indigo-200 decoration-4 underline-offset-4">Clinician Notes</span>
                                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                                 {p.questionnaire?.additional_notes || "No additional notes provided."}
                                              </p>
                                           </div>
                                        </div>
                                     </div>

                                  </div>
                               </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <FiChevronLeft size={20} />
                </button>
                <span className="text-xs font-bold text-gray-400">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <FiChevronRight size={20} />
                </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {distanceModalPatient && (
          <motion.div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDistanceModal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="distance-modal-title"
              className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/[0.08] dark:bg-gray-900"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-white/[0.06]">
                <div className="min-w-0">
                  <h2 id="distance-modal-title" className="text-lg font-black text-gray-900 dark:text-white">
                    Straight-line distance to kitchens
                  </h2>
                  <p className="mt-1 text-xs font-bold text-gray-500 dark:text-gray-400 truncate">
                    {distanceModalPatient.user.first_name || distanceModalPatient.user.last_name
                      ? `${distanceModalPatient.user.first_name || ""} ${distanceModalPatient.user.last_name || ""}`.trim()
                      : distanceModalPatient.user.username}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Patient coordinates:{" "}
                    {distanceModalPatient.user.latitude != null &&
                    distanceModalPatient.user.longitude != null ? (
                      <span className="text-indigo-600 dark:text-indigo-400 normal-case tracking-normal">
                        {Number(distanceModalPatient.user.latitude).toFixed(5)},{" "}
                        {Number(distanceModalPatient.user.longitude).toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 normal-case">Not set — distances unavailable</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDistanceModal}
                  className="shrink-0 rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  aria-label="Close"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-8rem)] px-6 py-4">
                {kitchensLoading ? (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <span className="text-sm text-gray-500">Loading kitchens…</span>
                  </div>
                ) : kitchensFetchError ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Could not load micro kitchens.</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (distanceModalPatient) {
                          void loadPatientKitchenDistances(distanceModalPatient.user.id);
                        }
                      }}
                      className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-600"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/[0.06]">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:border-white/[0.06] dark:bg-white/[0.03]">
                          <th className="px-4 py-3">Micro kitchen</th>
                          <th className="px-4 py-3">Kitchen lat, lng</th>
                          <th className="px-4 py-3 text-end">Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!distanceRows || distanceRows.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-10 text-center text-gray-500 italic">
                              No approved micro kitchens found.
                            </td>
                          </tr>
                        ) : (
                          distanceRows.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b border-gray-50 last:border-0 dark:border-white/[0.04]"
                            >
                              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                {row.brand_name || `Kitchen #${row.id}`}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                {row.latitude != null && row.longitude != null
                                  ? `${Number(row.latitude).toFixed(5)}, ${Number(row.longitude).toFixed(5)}`
                                  : "—"}
                              </td>
                              <td className="px-4 py-3 text-end font-black text-indigo-600 dark:text-indigo-400">
                                {row.distance_km !== null ? `${row.distance_km.toFixed(2)} km` : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
                  Distances use the Haversine formula (great-circle) on stored latitude and longitude. They are approximate
                  and do not reflect driving routes.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AllottedPatientsPage;


