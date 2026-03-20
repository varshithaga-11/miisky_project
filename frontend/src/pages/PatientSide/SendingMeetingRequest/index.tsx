import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyActivePlan, createMeetingRequest, getMyMeetingRequests, MeetingRequest } from "./api";
import { toast, ToastContainer } from "react-toastify";
import { FiVideo, FiClock, FiCalendar, FiSend, FiCheckCircle, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import DateTimePicker from "../../../components/form/datetimepicker";

const SendingMeetingRequest: React.FC = () => {
    const [activePlan, setActivePlan] = useState<any>(null);
    const [myRequests, setMyRequests] = useState<MeetingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [preferredDate, setPreferredDate] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const plan = await getMyActivePlan();
            setActivePlan(plan);
            const reqs = await getMyMeetingRequests();
            setMyRequests(reqs.sort((a, b) => b.id - a.id));
        } catch (err) {
            toast.error("Failed to load your nutrition status");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activePlan) {
            toast.error("You need an active plan to request a meeting");
            return;
        }
        if (!preferredDate || !preferredTime || !reason) {
            toast.warning("Please fill in all scheduling details");
            return;
        }

        setSubmitting(true);
        try {
            await createMeetingRequest({
                nutritionist: activePlan.nutritionist,
                user_diet_plan: activePlan.id,
                preferred_date: preferredDate,
                preferred_time: preferredTime,
                reason: reason
            });
            toast.success("Meeting request sent to your nutritionist! 📅");
            // Clear form
            setPreferredDate("");
            setPreferredTime("");
            setReason("");
            // Reload list
            const reqs = await getMyMeetingRequests();
            setMyRequests(reqs.sort((a, b) => b.id - a.id));
        } catch (err) {
            toast.error("Failed to send request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20';
            case 'completed': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20';
            case 'cancelled': return 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800';
            default: return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20';
        }
    };

    return (
        <>
            <PageMeta title="Request a Meeting | Miisky Health" description="Schedule a video call with your nutritionist" />
            <PageBreadcrumb pageTitle="Nutritionist Consultation" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    {/* Header Card */}
                    <div className="bg-indigo-600 rounded-[50px] p-10 lg:p-20 text-white shadow-2xl relative overflow-hidden transition-all hover:scale-[1.01]">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse"></div>
                        <div className="z-10 relative">
                            <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                                Expert <br/> Guidance
                            </h1>
                            <p className="text-indigo-100 text-lg font-medium max-w-xl opacity-90 leading-relaxed">
                                Need adjustments to your diet or have health questions? Request a personalized sync with your nutritionist. 🗣️
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                        
                        {/* Request Form */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-xl border border-transparent dark:border-white/[0.05]">
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4">
                                    <div className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                        <FiCalendar />
                                    </div>
                                    New Meeting Request
                                </h3>

                                {!activePlan && !loading && (
                                    <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl mb-8 flex items-start gap-4">
                                        <FiInfo className="text-rose-600 mt-1 shrink-0" />
                                        <p className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                                            No active nutrition plan found. Please purchase or activate a plan to schedule meetings.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 ml-2">Preferred Meeting Request (Date & Time)</label>
                                            <DateTimePicker
                                                id="meeting-datetime"
                                                placeholder="Select date and time"
                                                minDate="today"
                                                className="h-16 rounded-[30px] p-6 bg-gray-50 dark:bg-gray-800 border-none text-sm font-bold focus:ring-4 focus:ring-indigo-500/10"
                                                onChange={(selectedDates) => {
                                                    if (Array.isArray(selectedDates) && selectedDates.length > 0) {
                                                        const date = selectedDates[0] as Date;
                                                        const yyyy = date.getFullYear();
                                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                                        const dd = String(date.getDate()).padStart(2, '0');
                                                        setPreferredDate(`${yyyy}-${mm}-${dd}`);
                                                        
                                                        const hh = String(date.getHours()).padStart(2, '0');
                                                        const min = String(date.getMinutes()).padStart(2, '0');
                                                        setPreferredTime(`${hh}:${min}`);
                                                    } else if (selectedDates instanceof Date) {
                                                        const date = selectedDates;
                                                        const yyyy = date.getFullYear();
                                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                                        const dd = String(date.getDate()).padStart(2, '0');
                                                        setPreferredDate(`${yyyy}-${mm}-${dd}`);
                                                        
                                                        const hh = String(date.getHours()).padStart(2, '0');
                                                        const min = String(date.getMinutes()).padStart(2, '0');
                                                        setPreferredTime(`${hh}:${min}`);
                                                    }
                                                }}
                                                defaultDate={preferredDate && preferredTime ? `${preferredDate}T${preferredTime}` : undefined}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 ml-2">Main Topic / Reason</label>
                                        <textarea 
                                            rows={5}
                                            required
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Example: I'd like to adjust my carb intake or discuss my allergies..."
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={submitting || !activePlan}
                                        className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Sending Request...' : 'Submit Scheduling Request'} <FiSend />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Request History */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                                <div className="size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                    <FiCheckCircle />
                                </div>
                                Your Requests
                            </h3>

                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="size-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing history...</p>
                                </div>
                            ) : myRequests.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 p-16 rounded-[40px] text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                                    <div className="size-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <FiClock size={32} />
                                    </div>
                                    <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Queue is Empty</h4>
                                    <p className="text-gray-400 text-sm font-medium">Any requests you make will appear here with live status updates.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {myRequests.map((req, idx) => (
                                            <motion.div 
                                                key={req.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-sm border border-transparent dark:border-white/[0.05] relative group"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(req.status)}`}>
                                                            {req.status}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            ID #{req.id}
                                                        </span>
                                                    </div>
                                                    {req.meeting_link && req.status === 'approved' && (
                                                        <a 
                                                            href={req.meeting_link} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-black uppercase tracking-widest text-[10px] bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2.5 rounded-2xl transition-all"
                                                        >
                                                            <FiVideo size={14} /> Join Now
                                                        </a>
                                                    )}
                                                </div>

                                                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3 leading-tight italic">
                                                    "{req.reason}"
                                                </h4>

                                                <div className="flex flex-wrap gap-8 mt-6 pt-6 border-t border-gray-50 dark:border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <FiCalendar className="text-indigo-500" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Date Requested</span>
                                                            <span className="text-xs font-black uppercase tracking-tight">{req.preferred_date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <FiClock className="text-indigo-500" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Time Requested</span>
                                                            <span className="text-xs font-black uppercase tracking-tight">{req.preferred_time}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {req.nutritionist_notes && (
                                                    <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-4 border-indigo-500">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Nutritionist Note</p>
                                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic mb-2">"{req.nutritionist_notes}"</p>
                                                        {req.scheduled_datetime && (
                                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                                                                Scheduled: {new Date(req.scheduled_datetime).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SendingMeetingRequest;
