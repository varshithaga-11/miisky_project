import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
    getClinicalReviewDashboard,
    saveNutritionistReview,
    ClinicalReviewPatientRow,
    PatientHealthReport,
    NutritionistReview,
    ClinicalReviewDashboardResponse,
} from "./api";
import { markCategoryRead } from "../../../api/notifications";
import { NOTIFICATION_CATEGORY_PATIENT_HEALTH_REPORT, dispatchHealthReportUploadUnreadRefresh } from "../../../constants/notifications";
import { useNotifications } from "../../../context/NotificationContext";
import { toast, ToastContainer } from "react-toastify";
import { FiUsers, FiFileText, FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiInfo, FiChevronLeft, FiChevronRight, FiEye, FiDownload } from "react-icons/fi";
import { resolveMediaUrl } from "../../AdminSide/PatientOverview/api";

const PAGE_SIZE = 5;

/** Newest uploads first (by PatientHealthReport.uploaded_on). */
function sortReportsByUploadedOn(reports: PatientHealthReport[]): PatientHealthReport[] {
    return [...reports].sort(
        (a, b) => new Date(b.uploaded_on).getTime() - new Date(a.uploaded_on).getTime()
    );
}

function getReportDownloadFilename(report: PatientHealthReport): string {
    const fromUrl = report.report_file.split("/").pop()?.split("?")[0];
    if (fromUrl && /\.[a-zA-Z0-9]{1,8}$/.test(fromUrl)) {
        return fromUrl;
    }
    const safe = (report.title || "health-report").replace(/[^\w.-]+/g, "_").slice(0, 80);
    return `${safe}-${report.id}`;
}

const UploadedDocumentsByPatientPage: React.FC = () => {
    const { fetchNotifications } = useNotifications();

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    /** When set, load detail for this patient; when null, server uses first patient on the current page. */
    const [explicitPatientId, setExplicitPatientId] = useState<number | null>(null);

    const [dashboard, setDashboard] = useState<ClinicalReviewDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState("");
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const patientsPerPage = 5;

    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
        setExplicitPatientId(null);
    }, [debouncedSearch]);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getClinicalReviewDashboard({
                page,
                page_size: PAGE_SIZE,
                search: debouncedSearch || undefined,
                patient_id: explicitPatientId ?? undefined,
            });
            setDashboard(res);
        } catch {
            toast.error("Failed to load clinical review data");
            setDashboard(null);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, explicitPatientId]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const patients = dashboard?.results ?? [];
    /** While a fetch is in flight after a click, keep highlighting / header aligned with intent. */
    const effectiveUserId =
        explicitPatientId ?? dashboard?.selected_user_id ?? null;
    const selectedPatient: ClinicalReviewPatientRow | null =
        effectiveUserId != null
            ? patients.find((m) => m.user.id === effectiveUserId) ?? null
            : null;

    const sortedReports = useMemo(() => {
        return sortReportsByUploadedOn(dashboard?.reports ?? []);
    }, [dashboard]);
    const reviews: NutritionistReview[] = dashboard?.reviews ?? [];
    const reportsTotal = dashboard?.reports_total ?? 0;
    const reviewsTotal = dashboard?.reviews_total ?? 0;
    const totalPages = dashboard?.total_pages ?? 1;
    const patientCount = dashboard?.count ?? 0;

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;
        if (!comments.trim()) {
            toast.warning("Please enter your comments");
            return;
        }

        try {
            await saveNutritionistReview({
                user: selectedPatient.user.id,
                comments: comments,
                reports: selectedReports,
            });
            toast.success("Review submitted successfully");
            setComments("");
            setSelectedReports([]);
            await loadDashboard();
        } catch {
            toast.error("Failed to submit review");
        }
    };

    const toggleReportSelection = (id: number) => {
        setSelectedReports((prev) =>
            prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
        );
    };

    const selectPatient = (mapping: ClinicalReviewPatientRow) => {
        const uid = mapping.user.id;
        setExplicitPatientId(uid);
        (async () => {
            try {
                await markCategoryRead(NOTIFICATION_CATEGORY_PATIENT_HEALTH_REPORT, uid);
                await fetchNotifications();
                dispatchHealthReportUploadUnreadRefresh();
            } catch {
                /* non-blocking */
            }
        })();
    };

    const goToPage = (p: number) => {
        if (p < 1 || (totalPages > 0 && p > totalPages)) return;
        setExplicitPatientId(null);
        setPage(p);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Patient Document Review" description="Review health reports for your assigned patients" />
            <div className="max-w-[1600px] mx-auto">
                <PageBreadcrumb pageTitle="Clinical Records Review" />
            </div>
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-6 lg:px-8 pb-12 max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                    {/* Sidebar: Patient List */}
                    <div className="xl:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/[0.05] sticky top-8 flex flex-col h-[calc(100vh-140px)]">
                            <div className="mb-6">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiUsers className="text-blue-500" /> My Patients
                                </h1>
                                <p className="text-gray-500 mt-1 font-medium text-xs">Search and select a patient to review reports.</p>
                            </div>

                            <div className="mb-4 relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                    <FiUsers size={16} />
                                </div>
                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search patients..."
                                    className="w-full pl-11 pr-4 py-3.5 rounded-[1.5rem] bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-white placeholder:text-gray-400 transition-all"
                                    aria-label="Search patients"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {loading && (
                                    <div className="animate-pulse space-y-3">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="h-20 bg-gray-50 dark:bg-gray-700/30 rounded-2xl"></div>
                                        ))}
                                    </div>
                                )}

                                {!loading &&
                                    patients.map((mapping) => (
                                        <button
                                            key={mapping.user.id}
                                            type="button"
                                            onClick={() => selectPatient(mapping)}
                                            className={`w-full p-4 rounded-3xl flex items-center gap-3 transition-all duration-300 group relative ${
                                                effectiveUserId === mapping.user.id
                                                    ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/40 translate-x-1"
                                                    : "bg-gray-50/80 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40 hover:shadow-lg"
                                            }`}
                                        >
                                            <div
                                                className={`p-2.5 rounded-2xl shrink-0 transition-colors ${
                                                    effectiveUserId === mapping.user.id
                                                        ? "bg-white/20"
                                                        : "bg-white dark:bg-gray-700 text-blue-500 shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30"
                                                }`}
                                            >
                                                <FiUsers size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-extrabold text-[13px] leading-tight line-clamp-1">
                                                    {mapping.user.first_name} {mapping.user.last_name}
                                                </p>
                                                <p
                                                    className={`text-[9px] font-bold mt-1.5 flex items-center gap-1 ${
                                                        effectiveUserId === mapping.user.id
                                                            ? "text-blue-100/80"
                                                            : "text-gray-400 uppercase tracking-tighter"
                                                    }`}
                                                >
                                                    <FiClock className="size-2.5" /> {new Date(mapping.assigned_on).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {effectiveUserId === mapping.user.id && (
                                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>
                                            )}
                                        </button>
                                    ))}

                                {!loading && patients.length === 0 && (
                                    <div className="text-center py-12 flex flex-col items-center gap-3 opacity-60">
                                        <FiUsers className="size-10 text-gray-300" />
                                        <p className="text-sm font-medium">No patients found</p>
                                    </div>
                                )}
                            </div>

                            {!loading && patientCount > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(page - 1)}
                                        disabled={page <= 1}
                                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
                                        aria-label="Previous page"
                                    >
                                        <FiChevronLeft size={18} />
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Page</span>
                                        <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums">
                                            {page} <span className="text-gray-400">/</span> {Math.max(1, totalPages)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => goToPage(page + 1)}
                                        disabled={page >= totalPages}
                                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
                                        aria-label="Next page"
                                    >
                                        <FiChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-9 space-y-6 lg:space-y-8">
                        {selectedPatient ? (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-white/[0.05] shadow-xl shadow-gray-100/30 dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="size-3 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Active Record</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                            {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                                        </h2>
                                        <p className="text-gray-500 font-bold mt-1 text-sm bg-gray-50 dark:bg-white/[0.03] inline-block px-3 py-1 rounded-full">{selectedPatient.user.email}</p>
                                    </div>
                                    <div className="mt-6 md:mt-0 flex gap-4 lg:gap-6">
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-4 rounded-3xl text-center border border-blue-100/50 dark:border-blue-900/20 group hover:bg-blue-600 transition-all duration-300">
                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 group-hover:text-white/80 uppercase tracking-widest mb-1">Total Reports</p>
                                            <p className="text-3xl font-black text-blue-900 dark:text-blue-200 group-hover:text-white transition-colors">{reportsTotal}</p>
                                        </div>
                                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 px-8 py-4 rounded-3xl text-center border border-emerald-100/50 dark:border-emerald-900/20 group hover:bg-emerald-600 transition-all duration-300">
                                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 group-hover:text-white/80 uppercase tracking-widest mb-1">Reviews Given</p>
                                            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200 group-hover:text-white transition-colors">{reviewsTotal}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                                    <div className="lg:col-span-7 space-y-6">
                                        <div className="flex items-center justify-between px-4">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-3">
                                                <div className="w-8 h-[1px] bg-blue-500/30"></div>
                                                Patient Library
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5">
                                            {sortedReports.length === 0 ? (
                                                <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center gap-4">
                                                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-300">
                                                        <FiFileText size={48} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-gray-400">No documents yet</p>
                                                        <p className="text-sm font-medium text-gray-400 mt-1">This patient hasn't uploaded any reports.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                sortedReports.map((report) => (
                                                    <div
                                                        key={report.id}
                                                        onClick={() => toggleReportSelection(report.id)}
                                                        className={`bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border transition-all duration-300 cursor-pointer group flex flex-col gap-5 ${
                                                            selectedReports.includes(report.id)
                                                                ? "border-blue-500 bg-blue-50/10 shadow-2xl shadow-blue-500/10 scale-[1.02]"
                                                                : "border-gray-50 dark:border-white/[0.05] hover:border-blue-500/20 shadow-xl shadow-gray-200/20 dark:shadow-none"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div
                                                                className={`p-4 rounded-2xl transition-all duration-500 ${
                                                                    selectedReports.includes(report.id)
                                                                        ? "bg-blue-500 text-white rotate-6 shadow-lg shadow-blue-500/40"
                                                                        : "bg-gray-50 dark:bg-gray-900/50 text-gray-400 group-hover:text-blue-500 group-hover:scale-110"
                                                                }`}
                                                            >
                                                                <FiFileText size={24} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight mb-1">{report.title}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] uppercase font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg tracking-wider">
                                                                        {report.report_type?.replace("_", " ")}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                                                                        <FiClock className="size-3" /> {new Date(report.uploaded_on).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0 flex items-center relative">
                                                                <div className={`size-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                                                    selectedReports.includes(report.id)
                                                                        ? "bg-blue-500 border-blue-500 scale-110"
                                                                        : "bg-white dark:bg-gray-700 border-gray-200 dark:border-white/10"
                                                                }`}>
                                                                    {selectedReports.includes(report.id) && <FiCheckCircle className="text-white size-4" />}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {report.reviews && report.reviews.length > 0 && (
                                                            <div className="space-y-3">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Recent Insights</p>
                                                                {report.reviews.map((rev) => (
                                                                    <div
                                                                        key={rev.id}
                                                                        className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden group/review"
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">{rev.nutritionist_name}</span>
                                                                            <span className="text-[9px] font-bold text-gray-400">{new Date(rev.created_on).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                                                                            &quot;{rev.comments}&quot;
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div
                                                            className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-white/5"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <a
                                                                href={resolveMediaUrl(report.report_file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-900/10"
                                                                title="View full document"
                                                            >
                                                                <FiEye size={16} /> View
                                                            </a>
                                                            <a
                                                                href={resolveMediaUrl(report.report_file)}
                                                                download={getReportDownloadFilename(report)}
                                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-white dark:bg-gray-700 text-slate-900 dark:text-white border border-gray-100 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 shadow-sm"
                                                                title="Download for offline access"
                                                            >
                                                                <FiDownload size={16} /> Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 space-y-8">
                                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 lg:p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/[0.05] sticky top-8">
                                            <div className="mb-8 flex items-center justify-between">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracing-tight">Professional Review</h3>
                                                <div className={`px-4 py-1.5 rounded-full flex items-center gap-3 transition-colors ${selectedReports.length > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-gray-50 dark:bg-gray-900 text-gray-400'}`}>
                                                    <div className={`size-2 rounded-full ${selectedReports.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                                        {selectedReports.length} {selectedReports.length === 1 ? 'Report' : 'Reports'}
                                                    </span>
                                                </div>
                                            </div>

                                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                                <div className="relative group">
                                                    <textarea
                                                        rows={6}
                                                        placeholder="Enter clinical observations, dietary suggestions, or follow-up instructions..."
                                                        value={comments}
                                                        onChange={(e) => setComments(e.target.value)}
                                                        className="w-full px-8 py-7 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-medium text-sm lg:text-base leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                                    />
                                                    <div className="absolute top-6 left-3 w-1 h-3/4 bg-gray-100 dark:bg-white/5 rounded-full group-focus-within:bg-blue-500/20 transition-colors"></div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={selectedReports.length === 0}
                                                    className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.25em] flex items-center justify-center gap-4 transition-all duration-500 text-sm ${
                                                        selectedReports.length > 0 
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/30 active:scale-95" 
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                                    }`}
                                                >
                                                    Submit Analysis <FiSend className={selectedReports.length > 0 ? "animate-bounce" : ""} />
                                                </button>
                                            </form>

                                            <div className="mt-12 space-y-8">
                                                <div className="flex items-center gap-3 px-2">
                                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 flex-1">
                                                        <FiClock /> Previous Insights
                                                    </h3>
                                                    <div className="h-[1px] bg-gray-100 dark:bg-white/5 flex-1"></div>
                                                </div>

                                                <div className="space-y-5">
                                                    {reviews.length === 0 ? (
                                                        <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2rem] border border-dashed border-gray-100 dark:border-white/5">
                                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic opacity-60">History is empty</p>
                                                        </div>
                                                    ) : (
                                                        reviews.map((review) => (
                                                            <div
                                                                key={review.id}
                                                                className="bg-white dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-white/[0.05] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                                                            >
                                                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                                    <FiMessageSquare className="text-blue-500" />
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 tracking-[0.1em] mb-4 uppercase bg-blue-50 dark:bg-blue-900/20 w-fit px-3 py-1 rounded-full">
                                                                    <FiCheckCircle size={10} /> {new Date(review.created_on).toLocaleDateString()}
                                                                </div>
                                                                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed italic border-l-2 border-blue-500/20 pl-4 py-2">
                                                                    &quot;{review.comments}&quot;
                                                                </p>
                                                                {review.report_details && review.report_details.length > 0 && (
                                                                    <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-gray-50 dark:border-white/[0.05]">
                                                                        {review.report_details.map((rd) => (
                                                                            <span
                                                                                key={rd.id}
                                                                                className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-[8px] font-black text-gray-500 dark:text-gray-400 rounded-xl tracking-widest uppercase border border-gray-200 dark:border-white/10"
                                                                            >
                                                                                {rd.title || "Untitled Document"}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-[70vh] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[4rem] bg-white/30 dark:bg-gray-800/20 backdrop-blur-sm shadow-inner">
                                <div className="text-center max-w-sm px-6">
                                    <div className="size-24 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                        <FiUsers className="size-10 text-gray-200 dark:text-gray-600" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                                        {loading ? "Discovering Records…" : "Ready to Review?"}
                                    </h2>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        {loading 
                                            ? "We're fetching your patient list and their clinical history. Just a moment." 
                                            : "Search and select a patient from the library to begin your professional clinical analysis."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadedDocumentsByPatientPage;
