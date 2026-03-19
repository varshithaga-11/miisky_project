import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyPatients, getPatientReports, saveNutritionistReview, getPatientReviews, MappedPatientResponse, PatientHealthReport, NutritionistReview } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiUsers, FiFileText, FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiInfo } from "react-icons/fi";

const UploadedDocumentsByPatientPage: React.FC = () => {
    const [patients, setPatients] = useState<MappedPatientResponse[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<MappedPatientResponse | null>(null);
    const [reports, setReports] = useState<PatientHealthReport[]>([]);
    const [reviews, setReviews] = useState<NutritionistReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState("");
    const [selectedReports, setSelectedReports] = useState<number[]>([]);

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const data = await getMyPatients();
                setPatients(data);
                if (data.length > 0) {
                    setSelectedPatient(data[0]);
                }
            } catch (error) {
                toast.error("Failed to load patients");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            const fetchPatientData = async () => {
                setReports([]);
                setReviews([]);
                setSelectedReports([]);
                try {
                    const [reportsData, reviewsData] = await Promise.all([
                        getPatientReports(selectedPatient.user.id),
                        getPatientReviews(selectedPatient.user.id)
                    ]);
                    setReports(reportsData);
                    setReviews(reviewsData);
                } catch (error) {
                    toast.error("Failed to load patient data");
                }
            };
            fetchPatientData();
        }
    }, [selectedPatient]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;
        if (!comments.trim()) {
            toast.warning("Please enter your comments");
            return;
        }

        try {
            const newReview = await saveNutritionistReview({
                user: selectedPatient.user.id,
                comments: comments,
                reports: selectedReports
            });
            toast.success("Review submitted successfully");
            setReviews([newReview, ...reviews]);
            setComments("");
            setSelectedReports([]);
        } catch (error) {
            toast.error("Failed to submit review");
        }
    };

    const toggleReportSelection = (id: number) => {
        setSelectedReports(prev => 
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
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
                            <div className="mb-8">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiUsers className="text-blue-500" /> My Patients
                                </h1>
                                <p className="text-gray-500 mt-1 font-medium text-xs">Select a patient to review reports.</p>
                            </div>

                            <div className="space-y-4">
                                {loading && <div className="animate-pulse space-y-4">
                                    {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-2xl"></div>)}
                                </div>}
                                
                                {patients.map((mapping) => (
                                    <button
                                        key={mapping.user.id}
                                        onClick={() => setSelectedPatient(mapping)}
                                        className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left ${selectedPatient?.user.id === mapping.user.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-gray-50 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}
                                    >
                                        <div className={`p-2 rounded-xl ${selectedPatient?.user.id === mapping.user.id ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                                            <FiUsers size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm line-clamp-1">{mapping.user.first_name} {mapping.user.last_name}</p>
                                            <p className={`text-[10px] font-bold ${selectedPatient?.user.id === mapping.user.id ? 'text-blue-100' : 'text-gray-400 uppercase tracking-tighter mt-1'}`}>Joined: {new Date(mapping.assigned_on).toLocaleDateString()}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-3 space-y-8">
                        {selectedPatient ? (
                            <>
                                {/* Patient Header Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white dark:bg-gray-800 rounded-[32px] border border-transparent dark:border-white/[0.05]">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{selectedPatient.user.first_name} {selectedPatient.user.last_name}</h2>
                                        <p className="text-gray-500 font-medium">Record Folder • {selectedPatient.user.email}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Reports</p>
                                            <p className="text-2xl font-black text-blue-900 dark:text-blue-400">{reports.length}</p>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-2xl text-center">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Reviews Given</p>
                                            <p className="text-2xl font-black text-green-900 dark:text-green-400">{reviews.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Column 1: Reports Library */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                                <FiFileText className="text-blue-500" /> Patient Library
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {reports.length === 0 ? (
                                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
                                                    <FiInfo className="size-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                                    <p className="text-gray-500">No documents uploaded yet.</p>
                                                </div>
                                            ) : (
                                                reports.map(report => (
                                                    <div 
                                                        key={report.id} 
                                                        onClick={() => toggleReportSelection(report.id)}
                                                        className={`bg-white dark:bg-gray-800 p-5 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group ${selectedReports.includes(report.id) ? 'border-blue-500 bg-blue-50/30' : 'border-transparent dark:border-white/[0.05] hover:border-blue-500/30 shadow-sm'}`}
                                                    >
                                                        <div className={`p-3 rounded-2xl ${selectedReports.includes(report.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                                            <FiFileText size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{report.title}</h4>
                                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mt-0.5">{report.report_type?.replace('_', ' ')} • {new Date(report.uploaded_on).toLocaleDateString()}</p>
                                                        </div>
                                                        <a 
                                                            href={report.report_file} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-3 bg-gray-50 dark:bg-gray-900/50 text-gray-400 hover:text-blue-500 rounded-xl transition-all"
                                                        >
                                                            <FiInfo size={18} />
                                                        </a>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 2: Review Form & History */}
                                    <div className="space-y-8">
                                        {/* Review Form */}
                                        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05]">
                                            <div className="mb-6 flex items-center justify-between">
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Professional Review</h3>
                                                <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-amber-500 animate-pulse"></div>
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{selectedReports.length} Reports Selected</span>
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

                                        {/* Past Reviews List */}
                                        <div className="space-y-6">
                                            <h3 className="px-2 text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <FiClock /> Previous Comments
                                            </h3>
                                            
                                            <div className="space-y-4">
                                                {reviews.length === 0 ? (
                                                    <div className="text-center py-10 opacity-50 italic text-gray-400 text-sm">No previous reviews recorded.</div>
                                                ) : (
                                                    reviews.map(review => (
                                                        <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-transparent dark:border-white/[0.05] shadow-sm relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <FiMessageSquare className="text-indigo-400" />
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 tracking-widest mb-3 uppercase">
                                                                <FiCheckCircle size={10} /> {new Date(review.created_on).toLocaleDateString()} at {new Date(review.created_on).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed italic line-clamp-4">"{review.comments}"</p>
                                                            {review.reports.length > 0 && (
                                                                <div className="mt-4 flex flex-wrap gap-2">
                                                                    <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-[8px] font-black text-gray-400 rounded-lg tracking-widest uppercase"> Linked to {review.reports.length} Documents</span>
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
                                    <h2 className="text-2xl font-black text-gray-400">Select a Patient Profile</h2>
                                    <p className="text-gray-400 font-medium">Click on a patient to start clinical review.</p>
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
