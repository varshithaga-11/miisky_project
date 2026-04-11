import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyHealthReports, uploadHealthReport, deleteHealthReport, PatientHealthReport } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUpload, FiFileText, FiTrash2, FiPlus, FiCheckCircle, FiInfo, FiMessageSquare, FiSearch, FiX } from "react-icons/fi";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const HealthReportUploadPage: React.FC = () => {
    const [reports, setReports] = useState<PatientHealthReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [newReport, setNewReport] = useState({
        title: "",
        report_type: "",
        file: null as File | null
    });
    const [reportToDelete, setReportToDelete] = useState<PatientHealthReport | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await getMyHealthReports();
            setReports(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load health reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewReport({ ...newReport, file: e.target.files[0] });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReport.file) {
            toast.warning("Please select a file to upload");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("title", newReport.title || newReport.file.name);
        formData.append("report_type", newReport.report_type);
        formData.append("report_file", newReport.file);

        try {
            await uploadHealthReport(formData);
            toast.success("Health report uploaded successfully!");
            setNewReport({ title: "", report_type: "", file: null });
            fetchReports();
        } catch (error) {
            console.error(error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (report: PatientHealthReport) => {
        setReportToDelete(report);
    };

    const confirmDelete = async () => {
        if (!reportToDelete) return;
        setIsDeleting(true);
        try {
            await deleteHealthReport(reportToDelete.id);
            toast.success("Health report deleted successfully");
            setReports(reports.filter(r => r.id !== reportToDelete.id));
            setReportToDelete(null);
        } catch (error) {
            toast.error("Failed to delete health report");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredReports = React.useMemo(() => {
        if (!searchTerm.trim()) return reports;
        const q = searchTerm.toLowerCase();
        return reports.filter((r) => {
            if ((r.title && r.title.toLowerCase().includes(q)) || (r.report_type && r.report_type.toLowerCase().includes(q))) {
                return true;
            }
            return (r.reviews || []).some((rv) => {
                const text = [rv.comments, rv.nutritionist_name, rv.doctor_name, rv.nutritionist_only_name]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return text.includes(q);
            });
        });
    }, [reports, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="My Health Reports" description="Upload and manage your medical reports" />
            <PageBreadcrumb pageTitle="Health Reports Library" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-12">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Upload Section */}
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05]">
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">New Submission</h1>
                                <p className="text-gray-500 mt-1 font-medium">Add medical records for nutritionist review.</p>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Report Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Blood Test - Jan 2024"
                                        value={newReport.title}
                                        onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Document Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Blood Test, Scan, Prescription"
                                        value={newReport.report_type}
                                        onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select File</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${newReport.file ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 group-hover:border-blue-500 bg-gray-50 dark:bg-gray-900/50 dark:border-white/10'}`}>
                                            <FiUpload className={`size-10 mb-4 ${newReport.file ? 'text-green-500' : 'text-gray-300 group-hover:text-blue-500'}`} />
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                {newReport.file ? newReport.file.name : "Click to select or drag & drop"}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-2">PDF, JPG, PNG (Max 10MB)</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30'}`}
                                >
                                    {uploading ? (
                                        <>Preparing...</>
                                    ) : (
                                        <>Upload Document <FiPlus /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Dashboard/List Section */}
                    <div className="xl:col-span-2">
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">My Library</h1>
                                <p className="text-gray-500 mt-1 font-medium italic">Your secure digital medical archive.</p>
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search title, type, or feedback..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 rounded-[22px] outline-none transition-all font-bold text-sm shadow-xl shadow-gray-200/40 dark:shadow-none dark:text-white placeholder:font-medium placeholder:text-gray-400"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                                ))
                            ) : filteredReports.length === 0 ? (
                                <div className="md:col-span-2 text-center py-20 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
                                    <FiFileText className="size-16 mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                                    <h3 className="text-xl font-bold dark:text-white">No matches found</h3>
                                    <p className="text-gray-500">Try adjusting your search query.</p>
                                </div>
                            ) : (
                                filteredReports.map((report) => (
                                    <div key={report.id} className="bg-white dark:bg-gray-800 p-6 rounded-[32px] flex flex-col gap-5 shadow-sm border border-transparent hover:shadow-xl hover:border-blue-500/20 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                                                <FiFileText size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{report.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-[10px] font-black text-gray-500 rounded uppercase tracking-wider">
                                                        {report.report_type?.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {new Date(report.uploaded_on).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a 
                                                    href={report.report_file} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:text-blue-500 rounded-xl transition-all"
                                                    title="View File"
                                                >
                                                    <FiInfo size={18} />
                                                </a>
                                                <button 
                                                    onClick={() => handleDelete(report)}
                                                    className="p-3 bg-red-50/50 dark:bg-red-900/10 text-red-400 hover:text-red-600 rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Nutritionist & doctor comments (same API row; role distinguishes who wrote it) */}
                                        {report.reviews && report.reviews.length > 0 && (
                                            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-3xl p-5 space-y-4 border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FiMessageSquare className="text-blue-500 size-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        Feedback from your care team
                                                    </span>
                                                </div>
                                                {report.reviews.map((review) => {
                                                    const role = review.reviewer_role ?? "unknown";
                                                    const isDoctor = role === "doctor";
                                                    const isNutritionist = role === "nutritionist";
                                                    const badgeClass = isDoctor
                                                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200/60"
                                                        : isNutritionist
                                                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200/40"
                                                          : "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 border-violet-200/40";
                                                    const borderClass = isDoctor
                                                        ? "border-emerald-500/35"
                                                        : isNutritionist
                                                          ? "border-blue-500/30"
                                                          : "border-violet-500/30";
                                                    const roleLabel = isDoctor
                                                        ? "Doctor"
                                                        : isNutritionist
                                                          ? "Nutritionist"
                                                          : "Clinical";
                                                    return (
                                                        <div key={review.id} className={`relative pl-4 border-l-2 ${borderClass}`}>
                                                            <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span
                                                                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${badgeClass}`}
                                                                    >
                                                                        {roleLabel}
                                                                    </span>
                                                                    <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest leading-none bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
                                                                        {review.nutritionist_name}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[8px] font-bold text-gray-400 shrink-0">
                                                                    {new Date(review.created_on).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">
                                                                &ldquo;{review.comments}&rdquo;
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Summary Card */}
                        <div className="mt-8 p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] text-white overflow-hidden relative">
                            <FiCheckCircle className="absolute -bottom-6 -right-6 size-48 opacity-10" />
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-black mb-2">Care team review</h3>
                                    <p className="text-blue-100 font-medium max-w-md">
                                        Your nutritionist and care doctors can leave comments on your uploads here when they review your file.
                                    </p>
                                </div>
                                <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                    <span className="text-4xl font-black">{reports.length}</span>
                                    <span className="ml-3 font-bold text-blue-100 uppercase tracking-widest text-xs">Files Total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!reportToDelete}
                onClose={() => setReportToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Medical Document?"
                message={reportToDelete ? (
                    (reportToDelete.reviews || []).length > 0
                        ? `This report has ${reportToDelete.reviews?.length} comment(s) from your care team (nutritionist or doctor). Deleting it will also permanently remove this feedback. Are you sure?`
                        : `Are you sure you want to delete "${reportToDelete.title || 'this report'}"? This action cannot be undone.`
                ) : ""}
                confirmText="Delete Document"
            />
        </div>
    );
};

export default HealthReportUploadPage;
