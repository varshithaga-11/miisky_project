import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyInspectionReports, MicroKitchenInspection } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiCheckCircle, FiInfo, FiClipboard, FiImage } from "react-icons/fi";

const InspectionReportPage: React.FC = () => {
    const [reports, setReports] = useState<MicroKitchenInspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<MicroKitchenInspection | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getMyInspectionReports();
                setReports(data.results);
                if (data.results.length > 0) setSelectedReport(data.results[0]);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load inspection reports");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
            case 'rejected': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
            case 'submitted': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
            default: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
        }
    };

    const ratingFields = [
        { key: 'external_cleanliness', label: 'External Cleanliness', media: 'external_cleanliness_media' },
        { key: 'interior_cleanliness', label: 'Interior Cleanliness', media: 'interior_cleanliness_media' },
        { key: 'kitchen_platform_adequacy', label: 'Kitchen Platform Adequacy', media: 'kitchen_platform_adequacy_media' },
        { key: 'kitchen_platform_neatness', label: 'Kitchen Platform Neatness', media: 'kitchen_platform_neatness_media' },
        { key: 'safety', label: 'Safety Measures', media: 'safety_media' },
        { key: 'pure_water', label: 'Pure Water Access', media: 'pure_water_media' },
        { key: 'storage_facilities', label: 'Storage Facilities', media: 'storage_facilities_media' },
        { key: 'packing_space', label: 'Packing Space', media: 'packing_space_media' },
        { key: 'kitchen_size', label: 'Kitchen Size', media: 'kitchen_size_media' },
        { key: 'discussion_with_chef', label: 'Discussion with Chef', media: 'discussion_with_chef_media' },
        { key: 'other_observations', label: 'Other Observations', media: 'other_observations_media' },
        { key: 'support_staff', label: 'Support Staff', media: 'support_staff_media' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Inspection Report" description="Review your kitchen inspection history and results" />
            <PageBreadcrumb pageTitle="Inspection Reports" />
            <ToastContainer position="bottom-right" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 md:px-6">
                {/* Reports Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FiClipboard className="text-blue-500" /> History
                    </h2>
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>)}
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl text-center shadow-xs border border-gray-100 dark:border-white/[0.05]">
                            <p className="text-gray-500 text-sm">No inspections recorded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin">
                            {reports.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${
                                        selectedReport?.id === report.id
                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-white dark:bg-gray-800 border-transparent hover:border-blue-200 dark:hover:border-blue-800 text-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold">{new Date(report.inspection_date).toLocaleDateString()}</span>
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                            selectedReport?.id === report.id ? "bg-white/20 text-white" : getStatusStyle(report.status)
                                        }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className={`text-xs ${selectedReport?.id === report.id ? "text-blue-100" : "text-gray-500"}`}>
                                        Score: <span className="font-bold">{report.overall_score ?? "N/A"}</span>/10
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Report Detail View */}
                <div className="lg:col-span-3">
                    {selectedReport ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xs border border-gray-100 dark:border-white/[0.05] overflow-hidden">
                            <div className="p-6 md:p-8 space-y-8">
                                {/* Header Info */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h1 className="text-2xl font-bold dark:text-white capitalize">Inspection Results</h1>
                                        <p className="text-gray-500 text-sm">Code: {selectedReport.mc_code} | Date: {new Date(selectedReport.inspection_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{selectedReport.overall_score ?? "N/A"}</div>
                                            <div className="text-[10px] uppercase font-bold text-gray-400">Overall Score</div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl border-2 font-black uppercase text-sm tracking-widest ${getStatusStyle(selectedReport.status)}`}>
                                            {selectedReport.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendation Section */}
                                {(selectedReport.recommendation || selectedReport.notes) && (
                                    <div className="bg-gray-50 dark:bg-white/[0.02] rounded-3xl p-6 border border-gray-100 dark:border-white/[0.05] space-y-4">
                                        {selectedReport.recommendation && (
                                            <div>
                                                <h3 className="text-xs uppercase font-black text-blue-600 tracking-widest mb-2 flex items-center gap-2">
                                                    <FiCheckCircle /> Inspector's Recommendation
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300 italic">"{selectedReport.recommendation}"</p>
                                            </div>
                                        )}
                                        {selectedReport.notes && (
                                            <div>
                                                <h3 className="text-xs uppercase font-black text-gray-400 tracking-widest mb-2 flex items-center gap-2">
                                                    <FiInfo /> Additional Notes
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedReport.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Ratings Grid */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Detailed Ratings</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {ratingFields.map((field) => {
                                            const score = selectedReport[field.key as keyof MicroKitchenInspection] as number;
                                            const media = selectedReport[field.media as keyof MicroKitchenInspection] as string;
                                            return (
                                                <div key={field.key} className="flex flex-col p-5 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] rounded-3xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all group">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{field.label}</span>
                                                        <span className={`text-lg font-black ${score >= 8 ? "text-green-500" : score >= 5 ? "text-amber-500" : "text-red-500"}`}>
                                                            {score ?? "N/A"}<span className="text-[10px] text-gray-400 font-normal ml-0.5">/10</span>
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-700 ${
                                                                score >= 8 ? "bg-green-500" : score >= 5 ? "bg-amber-500" : "bg-red-500"
                                                            }`}
                                                            style={{ width: `${(score ?? 0) * 10}%` }}
                                                        />
                                                    </div>

                                                    {/* Media View */}
                                                    {media ? (
                                                        <a 
                                                            href={media} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                                        >
                                                            <FiImage /> View Evidence
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Media Provided</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[60vh] flex items-center justify-center text-gray-400 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-white/[0.05]">
                            <div className="text-center">
                                <FiInfo className="size-10 mx-auto mb-4 opacity-20" />
                                <p>Select a report from the list to view its details.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InspectionReportPage;
