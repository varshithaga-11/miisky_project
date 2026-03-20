import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyHealthReports, uploadHealthReport, deleteHealthReport, PatientHealthReport } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUpload, FiFileText, FiTrash2, FiPlus, FiCheckCircle, FiInfo, FiMessageSquare } from "react-icons/fi";

const HealthReportUploadPage: React.FC = () => {
    const [reports, setReports] = useState<PatientHealthReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [newReport, setNewReport] = useState({
        title: "",
        report_type: "",
        file: null as File | null
    });

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

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            await deleteHealthReport(id);
            toast.success("Report deleted");
            setReports(reports.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Delete failed");
        }
    };

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
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Library</h1>
                                <p className="text-gray-500 mt-1 font-medium">Access and manage all your secure medical documents.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                                ))
                            ) : reports.length === 0 ? (
                                <div className="md:col-span-2 text-center py-20 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
                                    <FiFileText className="size-16 mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                                    <h3 className="text-xl font-bold dark:text-white">No reports yet</h3>
                                    <p className="text-gray-500">Your uploaded records will appear here.</p>
                                </div>
                            ) : (
                                reports.map((report) => (
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
                                                    onClick={() => handleDelete(report.id)}
                                                    className="p-3 bg-red-50/50 dark:bg-red-900/10 text-red-400 hover:text-red-600 rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Nutritionist Comments Section */}
                                        {report.reviews && report.reviews.length > 0 && (
                                            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-3xl p-5 space-y-4 border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FiMessageSquare className="text-blue-500 size-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nutritionist Feedback</span>
                                                </div>
                                                {report.reviews.map((review) => (
                                                    <div key={review.id} className="relative pl-4 border-l-2 border-blue-500/30">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                                                {review.nutritionist_name}
                                                            </span>
                                                            <span className="text-[8px] font-bold text-gray-400">
                                                                {new Date(review.created_on).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">
                                                            "{review.comments}"
                                                        </p>
                                                    </div>
                                                ))}
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
                                    <h3 className="text-2xl font-black mb-2">Nutritionist Review</h3>
                                    <p className="text-blue-100 font-medium max-w-md">Your nutritionist will automatically be notified of any new uploads and will provide feedback in your next session.</p>
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
        </div>
    );
};

export default HealthReportUploadPage;
