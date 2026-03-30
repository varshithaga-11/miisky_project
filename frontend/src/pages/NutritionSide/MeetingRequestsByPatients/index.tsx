import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getNutritionistMeetings, updateMeetingStatus, MeetingRequest } from "../../../pages/PatientSide/SendingMeetingRequest/api";
import { toast, ToastContainer } from "react-toastify";
import { FiVideo, FiCheck, FiX, FiClock, FiCalendar, FiUser, FiInfo, FiExternalLink } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import DateTimePicker from "../../../components/form/datetimepicker";

const MeetingRequestsByPatients: React.FC = () => {
    const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMeeting, setActiveMeeting] = useState<MeetingRequest | null>(null);

    // Scheduling State
    const [scheduledDateTime, setScheduledDateTime] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [notes, setNotes] = useState("");

    const formatTo12Hr = (time24: string) => {
        if (!time24) return "";
        const [h, m] = time24.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        setLoading(true);
        try {
            const data = await getNutritionistMeetings();
            setMeetings(data.sort((a, b) => b.id - a.id));
        } catch (err) {
            toast.error("Failed to sync consultation requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!activeMeeting) return;
        if (!scheduledDateTime || !meetingLink) {
            toast.warning("Please provide both the meeting link and confirmed time");
            return;
        }

        // Basic URL validation to ensure it starts with http/https
        if (!meetingLink.toLowerCase().startsWith('http')) {
            toast.warning("Meeting link must be a valid URL (starting with http:// or https://)");
            return;
        }

        try {
            await updateMeetingStatus(activeMeeting.id, {
                status: 'approved',
                meeting_link: meetingLink,
                scheduled_datetime: scheduledDateTime,
                nutritionist_notes: notes
            });
            toast.success("Meeting scheduled and patient notified! 📅");
            resetAction();
            loadMeetings();
        } catch (err) {
            toast.error("Process failed. Please verify the details.");
        }
    };

    const handleReject = async () => {
        if (!activeMeeting) return;
        try {
            await updateMeetingStatus(activeMeeting.id, {
                status: 'rejected',
                nutritionist_notes: notes || "Declined based on review"
            });
            toast.info("Request declined 🛑");
            resetAction();
            loadMeetings();
        } catch (err) {
            toast.error("Process failed.");
        }
    };

    const handleComplete = async (id: number) => {
        try {
            await updateMeetingStatus(id, { status: 'completed' });
            toast.success("Session marked as completed ✅");
            loadMeetings();
        } catch (err) {
            toast.error("Update failed.");
        }
    };

    const resetAction = () => {
        setActiveMeeting(null);
        setScheduledDateTime("");
        setMeetingLink("");
        setNotes("");
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
            <PageMeta title="Patient Meetings | Miisky Health" description="Manage and schedule video consultations" />
            <PageBreadcrumb pageTitle="Meeting Requests" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-12">


                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">

                        {/* Queue List */}
                        <div className="space-y-10">
                            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                                <div className="size-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                    <FiClock />
                                </div>
                                Active Queue
                            </h3>

                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                                    <div className="size-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fetching requests...</p>
                                </div>
                            ) : meetings.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                                    <FiCheck size={48} className="mx-auto mb-6 text-gray-200" />
                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">No Requests Found</h4>
                                    <p className="text-gray-400 font-medium">Sit back and relax! There are no pending consultations at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {meetings.map((m, idx) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => m.status === 'pending' && setActiveMeeting(m)}
                                            className={`bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-sm border-2 transition-all group ${activeMeeting?.id === m.id ? 'border-emerald-500 scale-[1.02]' : 'border-transparent hover:border-emerald-100 dark:hover:border-white/5 hover:shadow-2xl'} ${m.status === 'pending' ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-emerald-500 shadow-inner group-hover:bg-white dark:group-hover:bg-gray-800">
                                                        <FiUser size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                                            {m.patient_details?.first_name} {m.patient_details?.last_name}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{m.patient_details?.email}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(m.status)}`}>
                                                    {m.status}
                                                </div>
                                            </div>

                                            <div className="mb-8">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Patient Request Reason</p>
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                                    "{m.reason || "No context provided"}"
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-8 py-6 border-t border-gray-50 dark:border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <FiCalendar className="text-emerald-500" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Date Proposed</span>
                                                        <span className="text-xs font-black uppercase tracking-tight">{m.preferred_date}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <FiClock className="text-emerald-500" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Time Proposed</span>
                                                        <span className="text-xs font-black uppercase tracking-tight">{formatTo12Hr(m.preferred_time)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {m.status === 'approved' && (
                                                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 space-y-4">
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                                        Scheduled Session
                                                        <button onClick={() => handleComplete(m.id)} className="text-indigo-600 hover:text-indigo-500 flex items-center gap-1">Mark Finished <FiCheck /></button>
                                                    </div>
                                                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <FiVideo className="text-emerald-600" />
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black uppercase tracking-tight">Meet Joined Link Ready</span>
                                                                <span className="text-[8px] font-bold text-gray-400 tracking-widest">{new Date(m.scheduled_datetime!).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <a href={m.meeting_link} target="_blank" rel="noreferrer" className="size-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-emerald-600 shadow-sm border dark:border-white/10">
                                                            <FiExternalLink />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Scheduling Panel */}
                        <div className="xl:sticky xl:top-[120px]">
                            <AnimatePresence mode="wait">
                                {activeMeeting ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-gray-900 p-10 rounded-[50px] shadow-2xl border-none ring-1 ring-emerald-100 dark:ring-white/5"
                                    >
                                        <div className="flex justify-between items-center mb-10">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Schedule Consult</h3>
                                            <button onClick={resetAction} className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
                                                <FiX size={20} />
                                            </button>
                                        </div>

                                        <div className="mb-10 text-center">
                                            <div className="size-20 rounded-[30px] bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mx-auto mb-4 font-black text-2xl">
                                                {activeMeeting.patient_details?.first_name[0]}
                                            </div>
                                            <h4 className="text-xl font-black uppercase tracking-tighter italic">{activeMeeting.patient_details?.first_name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Patient ID #{activeMeeting.patient}</p>
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-2 italic">Session DateTime</label>
                                                <DateTimePicker
                                                    id="scheduledDateTime"
                                                    placeholder="Select confirmed date & time"
                                                    onChange={(dates) => {
                                                        if (dates.length > 0) {
                                                            const d = dates[0];
                                                            const yyyy = d.getFullYear();
                                                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                                                            const dd = String(d.getDate()).padStart(2, '0');
                                                            const hh = String(d.getHours()).padStart(2, '0');
                                                            const min = String(d.getMinutes()).padStart(2, '0');
                                                            // Format as YYYY-MM-DDTHH:mm for the backend
                                                            setScheduledDateTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
                                                        }
                                                    }}
                                                    defaultDate={scheduledDateTime}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-6 text-sm font-black italic focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                                    timeFormat="12"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-2 italic">Video Link (Meet/Zoom)</label>
                                                <div className="relative">
                                                    <FiVideo className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                    <input
                                                        type="url"
                                                        value={meetingLink}
                                                        onChange={(e) => setMeetingLink(e.target.value)}
                                                        placeholder="https://meet.google.com/..."
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-6 pl-14 text-sm font-black italic focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-2 italic">Consultation Notes (Optional)</label>
                                                <textarea
                                                    rows={4}
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Discuss lab results or share prep files..."
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-6 text-sm font-black italic focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                                                ></textarea>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button
                                                    onClick={handleReject}
                                                    className="py-5 bg-rose-50 text-rose-600 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-100 transition-all active:scale-95"
                                                >
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={handleApprove}
                                                    className="py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-3"
                                                >
                                                    Confirm & Schedule
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="bg-gray-50/50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[50px] p-20 flex flex-col items-center justify-center text-center">
                                        <div className="size-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                                            <FiInfo size={32} />
                                        </div>
                                        <h4 className="text-xl font-black uppercase tracking-tighter">Action Required</h4>
                                        <p className="text-sm font-medium text-gray-400 max-w-xs mt-2 italic leading-relaxed">
                                            Select a <span className="text-amber-500">Pending</span> request from the list to start the scheduling process.
                                        </p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MeetingRequestsByPatients;
