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
        setExplicitPatientId(mapping.user.id);
    };

    const goToPage = (p: number) => {
        if (p < 1 || (totalPages > 0 && p > totalPages)) return;
        setExplicitPatientId(null);
        setPage(p);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Patient Document Review" description="Review health reports for your assigned patients" />
            <PageBreadcrumb pageTitle="Clinical Records Review" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-12">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Sidebar: Patient List */}
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05] h-full overflow-y-auto max-h-[calc(100vh-200px)]">
                            <div className="mb-6">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiUsers className="text-blue-500" /> My Patients
                                </h1>
                                <p className="text-gray-500 mt-1 font-medium text-xs">Search and select a patient to review reports.</p>
                            </div>

                            <div className="mb-4">
                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search name, email, username…"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-gray-400"
                                    aria-label="Search patients"
                                />
                            </div>

                            <div className="space-y-4">
                                {loading && (
                                    <div className="animate-pulse space-y-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-2xl"></div>
                                        ))}
                                    </div>
                                )}

                                {!loading &&
                                    patients.map((mapping) => (
                                        <button
                                            key={mapping.user.id}
                                            type="button"
                                            onClick={() => selectPatient(mapping)}
                                            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left ${
                                                effectiveUserId === mapping.user.id
                                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
                                                    : "bg-gray-50 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                            }`}
                                        >
                                            <div
                                                className={`p-2 rounded-xl ${
                                                    effectiveUserId === mapping.user.id
                                                        ? "bg-white/20"
                                                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                                                }`}
                                            >
                                                <FiUsers size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm line-clamp-1">
                                                    {mapping.user.first_name} {mapping.user.last_name}
                                                </p>
                                                <p
                                                    className={`text-[10px] font-bold ${
                                                        effectiveUserId === mapping.user.id
                                                            ? "text-blue-100"
                                                            : "text-gray-400 uppercase tracking-tighter mt-1"
                                                    }`}
                                                >
                                                    Joined: {new Date(mapping.assigned_on).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </button>
                                    ))}

                                {!loading && patients.length === 0 && (
                                    <p className="text-center text-sm text-gray-500 py-8">No patients match your search.</p>
                                )}
                            </div>

                            {!loading && patientCount > 0 && (
                                <div className="mt-6 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => goToPage(page - 1)}
                                        disabled={page <= 1}
                                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
                                        aria-label="Previous page"
                                    >
                                        <FiChevronLeft size={20} />
                                    </button>
                                    <span className="text-xs font-bold text-gray-500 tabular-nums">
                                        Page {page} / {Math.max(1, totalPages)} · {patientCount} total
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => goToPage(page + 1)}
                                        disabled={page >= totalPages}
                                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600"
                                        aria-label="Next page"
                                    >
                                        <FiChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-3 space-y-8">
                        {selectedPatient ? (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white dark:bg-gray-800 rounded-[32px] border border-transparent dark:border-white/[0.05]">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                            {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                                        </h2>
                                        <p className="text-gray-500 font-medium">Record Folder • {selectedPatient.user.email}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Reports</p>
                                            <p className="text-2xl font-black text-blue-900 dark:text-blue-400">{reportsTotal}</p>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Reviews Given</p>
                                            <p className="text-2xl font-black text-green-900 dark:text-green-400">{reviewsTotal}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                                <FiFileText className="text-blue-500" /> Patient Library
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            {sortedReports.length === 0 ? (
                                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
                                                    <FiInfo className="size-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                                    <p className="text-gray-500">No documents uploaded yet.</p>
                                                </div>
                                            ) : (
                                                sortedReports.map((report) => (
                                                    <div
                                                        key={report.id}
                                                        onClick={() => toggleReportSelection(report.id)}
                                                        className={`bg-white dark:bg-gray-800 p-5 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group ${
                                                            selectedReports.includes(report.id)
                                                                ? "border-blue-500 bg-blue-50/30"
                                                                : "border-transparent dark:border-white/[0.05] hover:border-blue-500/30 shadow-sm"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`p-3 rounded-2xl ${
                                                                selectedReports.includes(report.id)
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                                                            }`}
                                                        >
                                                            <FiFileText size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{report.title}</h4>
                                                                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mt-0.5">
                                                                        {report.report_type?.replace("_", " ")} • {new Date(report.uploaded_on).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {report.reviews && report.reviews.length > 0 && (
                                                                <div className="mt-3 space-y-2">
                                                                    {report.reviews.map((rev) => (
                                                                        <div
                                                                            key={rev.id}
                                                                            className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20"
                                                                        >
                                                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex justify-between">
                                                                                <span>{rev.nutritionist_name}</span>
                                                                                <span>{new Date(rev.created_on).toLocaleDateString()}</span>
                                                                            </p>
                                                                            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium italic">
                                                                                &quot;{rev.comments}&quot;
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="flex shrink-0 items-center gap-2"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <a
                                                                href={resolveMediaUrl(report.report_file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-gray-900/80 text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                                                title="View in new window"
                                                            >
                                                                <FiEye size={16} />
                                                                View
                                                            </a>
                                                            <a
                                                                href={resolveMediaUrl(report.report_file)}
                                                                download={getReportDownloadFilename(report)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-gray-900/80 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                                                                title="Download file"
                                                            >
                                                                <FiDownload size={16} />
                                                                Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05]">
                                            <div className="mb-6 flex items-center justify-between">
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Professional Review</h3>
                                                <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-amber-500 animate-pulse"></div>
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                                        {selectedReports.length} Reports Selected
                                                    </span>
                                                </div>
                                            </div>

                                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                                <textarea
                                                    rows={5}
                                                    placeholder="Enter clinical observations, dietary suggestions, or follow-up instructions..."
                                                    value={comments}
                                                    onChange={(e) => setComments(e.target.value)}
                                                    className="w-full px-6 py-5 bg-gray-50/50 dark:bg-gray-900/50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-medium"
                                                />
                                                <button
                                                    type="submit"
                                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all"
                                                >
                                                    Submit Analysis <FiSend />
                                                </button>
                                            </form>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="px-2 text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <FiClock /> Previous Comments
                                            </h3>

                                            <div className="space-y-4">
                                                {reviews.length === 0 ? (
                                                    <div className="text-center py-10 opacity-50 italic text-gray-400 text-sm">No previous reviews recorded.</div>
                                                ) : (
                                                    reviews.map((review) => (
                                                        <div
                                                            key={review.id}
                                                            className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-transparent dark:border-white/[0.05] shadow-sm relative overflow-hidden group"
                                                        >
                                                            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <FiMessageSquare className="text-indigo-400" />
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 tracking-widest mb-3 uppercase">
                                                                <FiCheckCircle size={10} /> {new Date(review.created_on).toLocaleDateString()} at{" "}
                                                                {new Date(review.created_on).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed italic line-clamp-4">
                                                                &quot;{review.comments}&quot;
                                                            </p>
                                                            {review.report_details && review.report_details.length > 0 && (
                                                                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-white/[0.05]">
                                                                    {review.report_details.map((rd) => (
                                                                        <span
                                                                            key={rd.id}
                                                                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-[8px] font-black text-blue-500 rounded-lg tracking-widest uppercase border border-blue-100 dark:border-blue-900/30"
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
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-[600px] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[40px]">
                                <div className="text-center">
                                    <FiUsers className="size-20 mx-auto text-gray-200 dark:text-gray-800 mb-6" />
                                    <h2 className="text-2xl font-black text-gray-400">
                                        {loading ? "Loading…" : "No patient selected"}
                                    </h2>
                                    <p className="text-gray-400 font-medium">
                                        {loading ? "Fetching your patient list." : "Adjust search or pick a patient from the list."}
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
