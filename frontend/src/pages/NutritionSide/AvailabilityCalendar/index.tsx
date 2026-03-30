import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { getMyAvailability, createAvailabilitySlot, deleteAvailabilitySlot, clearPastSlots, AvailabilitySlot } from "./api";
import { toast } from "react-toastify";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker2 from "../../../components/form/date-picker2";
import TimePicker from "../../../components/form/timepicker";

const AvailabilityCalendar: React.FC = () => {
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        try {
            setLoading(true);
            const data = await getMyAvailability();
            setSlots(data);
        } catch (error) {
            toast.error("Failed to load availability slots");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !startTime || !endTime) {
            toast.warning("Please fill all fields");
            return;
        }

        if (startTime >= endTime) {
            toast.warning("Start time must be before end time");
            return;
        }

        try {
            setIsSaving(true);
            await createAvailabilitySlot({
                date: selectedDate,
                start_time: startTime,
                end_time: endTime
            });
            toast.success("Slot added successfully!");
            loadAvailability();
        } catch (error: any) {
            toast.error(error.message || "Failed to add slot");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSlot = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try {
            await deleteAvailabilitySlot(id);
            toast.success("Slot deleted");
            setSlots(slots.filter(s => s.id !== id));
        } catch (error) {
            toast.error("Failed to delete slot");
        }
    };

    const handleClearPast = async () => {
        if (!window.confirm("Are you sure you want to delete ALL unbooked slots from previous dates? This will not affect booked sessions.")) return;
        try {
            const res = await clearPastSlots();
            toast.success(res.message || "Past unused slots cleared");
            loadAvailability();
        } catch (error) {
            toast.error("Failed to clear past slots");
        }
    };

    // Group slots by date
    const groupedSlots = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {} as Record<string, AvailabilitySlot[]>);

    const sortedDates = Object.keys(groupedSlots).sort();

    const formatTo12Hr = (time24: string) => {
        if (!time24) return "";
        const [h, m] = time24.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 lg:p-8">
            <PageMeta title="Availability Calendar | Miisky Health" description="Manage your consultation schedule" />
            
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
                            <div className="p-2 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
                                <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                            Availability Calendar
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                            Set your consultation time slots for patients to book.
                        </p>
                    </div>
                    {sortedDates.length > 0 && (
                        <button 
                            onClick={handleClearPast}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Past Unused Slots
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Slot Form Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-sky-500" />
                                Add New Slot
                            </h2>
                            
                            <form onSubmit={handleAddSlot} className="space-y-6">
                                <DatePicker2
                                    id="available-date"
                                    label="Select Date"
                                    minDate={new Date().toISOString().split("T")[0]}
                                    value={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <TimePicker
                                        id="start-time"
                                        label="Start Time"
                                        timeFormat="12"
                                        defaultTime={startTime}
                                        onChange={(dates) => {
                                            if (dates.length > 0) {
                                                const h = dates[0].getHours().toString().padStart(2, '0');
                                                const m = dates[0].getMinutes().toString().padStart(2, '0');
                                                setStartTime(`${h}:${m}`);
                                            }
                                        }}
                                    />
                                    <TimePicker
                                        id="end-time"
                                        label="End Time"
                                        timeFormat="12"
                                        defaultTime={endTime}
                                        onChange={(dates) => {
                                            if (dates.length > 0) {
                                                const h = dates[0].getHours().toString().padStart(2, '0');
                                                const m = dates[0].getMinutes().toString().padStart(2, '0');
                                                setEndTime(`${h}:${m}`);
                                            }
                                        }}
                                    />
                                </div>

                                <button 
                                    disabled={isSaving}
                                    className="w-full py-4 bg-gray-900 border border-gray-900 dark:bg-white dark:text-gray-950 font-bold rounded-2xl hover:bg-gray-800 text-white transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? "Saving..." : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Confirm Availability
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Slots Display Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 4].map(i => (
                                    <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[2rem]"></div>
                                ))}
                            </div>
                        ) : sortedDates.length === 0 ? (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800 p-20 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <CalendarIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Availability Slots</h3>
                                <p className="mt-2 text-gray-500 max-w-xs">Start setting your available time slots using the form on the left.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {sortedDates.map(date => (
                                    <div key={date} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 dark:bg-gray-950 px-4">
                                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </h3>
                                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {groupedSlots[date].sort((a, b) => a.start_time.localeCompare(b.start_time)).map(slot => (
                                                <div 
                                                    key={slot.id}
                                                    className={`group relative overflow-hidden bg-white dark:bg-gray-900 p-6 rounded-[2rem] border transition-all duration-300 ${
                                                        slot.is_booked 
                                                        ? "border-sky-100 dark:border-sky-900/30 bg-sky-50/10" 
                                                        : "border-gray-100 dark:border-gray-800 hover:border-sky-500 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                                                slot.is_booked ? "bg-sky-500/10 text-sky-500" : "bg-gray-50 dark:bg-gray-800 text-gray-400"
                                                            }`}>
                                                                <Clock className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <div className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                                                                    {formatTo12Hr(slot.start_time)} - {formatTo12Hr(slot.end_time)}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {slot.is_booked ? (
                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider rounded-lg">
                                                                            <CheckCircle2 className="w-3 h-3" /> Booked
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-wider rounded-lg text-[10px]">
                                                                            Available
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {!slot.is_booked && (
                                                            <button 
                                                                onClick={() => handleDeleteSlot(slot.id)}
                                                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityCalendar;
