import React, { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    fetchAllFoodRecommendations,
    PatientFoodRecommendation,
    deleteFoodRecommendation
} from "./api";
import { getMyPatients, MappedPatientResponse } from "../SuggestPlanToPatients/api";
import {
    FiSearch,
    FiCalendar,
    FiUser,
    FiTrash2,
    FiFilter,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiFileText
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../components/ui/button/Button";
import SearchableSelect, { Option } from "../../../components/form/SearchableSelect";
import DatePicker2 from "../../../components/form/date-picker2";

const ListOfSuggestedFoodPage: React.FC = () => {
    const [recommendations, setRecommendations] = useState<PatientFoodRecommendation[]>([]);
    const [patients, setPatients] = useState<MappedPatientResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filters
    const [selectedPatient, setSelectedPatient] = useState<number | "">("");
    const [period, setPeriod] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const patientOptions: Option<number | "">[] = useMemo(() => {
        const list: Option<number | "">[] = [
            { value: "", label: "All Patients" }
        ];
        patients.forEach(p => {
            list.push({
                value: p.user.id,
                label: p.user.first_name ? `${p.user.first_name} ${p.user.last_name}` : p.user.username,
                image: null
            });
        });
        return list;
    }, [patients]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Load Allotted Patients for filter
    useEffect(() => {
        (async () => {
            try {
                const res = await getMyPatients();
                setPatients(res || []);
            } catch (err) {
                console.error("Failed to load patients", err);
            }
        })();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchAllFoodRecommendations({
                patient: selectedPatient || undefined,
                period: period !== "all" ? period : undefined,
                start_date: period === "custom_range" ? startDate : undefined,
                end_date: period === "custom_range" ? endDate : undefined,
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: itemsPerPage,
            });
            setRecommendations(res.results || []);
            setTotalCount(res.count || 0);
            setTotalPages(res.total_pages || 1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load food suggestions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage, selectedPatient, period, startDate, endDate, debouncedSearch]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this suggestion?")) return;
        try {
            await deleteFoodRecommendation(id);
            toast.success("Suggestion deleted");
            loadData();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete suggestion");
        }
    };

    const resetFilters = () => {
        setSelectedPatient("");
        setPeriod("all");
        setStartDate("");
        setEndDate("");
        setSearch("");
        setCurrentPage(1);
    };

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
            <PageMeta title="Suggested Food List" description="View and manage food recommendations for your patients" />
            <PageBreadcrumb pageTitle="Suggested Food History" />

            <div className="space-y-6 pb-20">
                {/* Filters Header */}
                <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1 w-full space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 ml-1">
                                <FiSearch size={12} /> Search Suggestions
                            </label>
                            <input
                                type="text"
                                placeholder="Food name, notes, or comments..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>

                        <div className="w-full lg:w-72 space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 ml-1">
                                <FiUser size={12} /> Patient Filter
                            </label>
                            <SearchableSelect
                                options={patientOptions}
                                value={selectedPatient}
                                onChange={(val) => { setSelectedPatient(val); setCurrentPage(1); }}
                                placeholder="All Patients"
                            />
                        </div>

                        <div className="w-full lg:w-48 space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 ml-1">
                                <FiCalendar size={12} /> Time Period
                            </label>
                            <select
                                value={period}
                                onChange={(e) => { setPeriod(e.target.value); setCurrentPage(1); }}
                                className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-sm outline-none cursor-pointer"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="last_week">Last Week</option>
                                <option value="this_month">This Month</option>
                                <option value="custom_range">Custom Range</option>
                            </select>
                        </div>

                        {period === "custom_range" && (
                            <div className="flex gap-2 w-full lg:w-auto">
                                <div className="flex-1 space-y-1.5 min-w-[140px]">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">From</label>
                                    <DatePicker2
                                        id="startDate"
                                        value={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        placeholder="From Date"
                                        className="!h-11"
                                    />
                                </div>
                                <div className="flex-1 space-y-1.5 min-w-[140px]">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">To</label>
                                    <DatePicker2
                                        id="endDate"
                                        value={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        placeholder="To Date"
                                        className="!h-11"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={resetFilters}
                            className="h-11 px-4 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 transition-all shrink-0"
                            title="Reset Filters"
                        >
                            <FiFilter />
                        </button>
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-center px-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Found <span className="text-brand-600">{totalCount}</span> recommendations
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 dark:bg-white/[0.02]">
                                    <TableCell isHeader className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Patient</TableCell>
                                    <TableCell isHeader className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Food & Quantity</TableCell>
                                    <TableCell isHeader className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-center">Meal Time</TableCell>
                                    <TableCell isHeader className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Date</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                                                <span className="text-xs font-bold text-gray-400 uppercase">Loading...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : recommendations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-gray-400">
                                                <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                                    <FiFileText size={32} />
                                                </div>
                                                <p className="text-sm font-bold italic uppercase tracking-wider">No food suggestions found</p>
                                                <Button variant="outline" size="sm" onClick={resetFilters}>Clear Filters</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recommendations.map((rec) => (
                                        <TableRow key={rec.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                                            <TableCell className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold text-xs">
                                                        {rec.patient_details?.first_name?.[0] || rec.patient_details?.email?.[0] || "?"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {rec.patient_details?.first_name ? `${rec.patient_details.first_name} ${rec.patient_details.last_name}` : "Patient"}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-medium">{rec.patient_details?.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                                                            {rec.food_details?.name || "Deleted Food"}
                                                        </span>
                                                        {rec.quantity && (
                                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-lg text-[10px] font-black text-gray-500 uppercase">
                                                                {rec.quantity}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(rec.notes || rec.comment) && (
                                                        <p className="text-[10px] text-gray-400 mt-1 italic line-clamp-1 max-w-xs" title={rec.notes || rec.comment || ""}>
                                                            {rec.notes || rec.comment}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-center">
                                                {rec.meal_time_details ? (
                                                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-tighter">
                                                        {rec.meal_time_details.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        {rec.recommended_on ? new Date(rec.recommended_on).toLocaleDateString() : "—"}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                        <FiClock size={10} /> {rec.recommended_on ? new Date(rec.recommended_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ListOfSuggestedFoodPage;
