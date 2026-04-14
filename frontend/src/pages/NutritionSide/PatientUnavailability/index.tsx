import React, { useCallback, useEffect, useState, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import {
    fetchPatientUnavailability,
    approveUnavailability,
    rejectUnavailability,
    fetchImpact,
    fetchMyPatients,
    type PatientUnavailabilityItem,
} from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import SearchableSelect from "../../../components/form/SearchableSelect";

const statusBadge = (s: string) => {
    const base = "inline-flex px-2 py-0.5 rounded-full text-xs font-medium";
    switch (s) {
        case "pending":
            return `${base} bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200`;
        case "approved":
            return `${base} bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200`;
        case "rejected":
            return `${base} bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200`;
        case "cancelled":
            return `${base} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300`;
        default:
            return `${base} bg-gray-100 text-gray-700`;
    }
};

const PatientUnavailabilityPage: React.FC = () => {
    const [items, setItems] = useState<PatientUnavailabilityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("pending");
    const [notes, setNotes] = useState("");
    const [activeId, setActiveId] = useState<number | null>(null);
    const [impactOpen, setImpactOpen] = useState<number | null>(null);
    const [impactLoading, setImpactLoading] = useState(false);
    const [impactData, setImpactData] = useState<Awaited<ReturnType<typeof fetchImpact>> | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState<number | "">("");
    const [patients, setPatients] = useState<any[]>([]);

    const fetchingPatientsRef = useRef(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPatientUnavailability({
                page: currentPage,
                limit: pageSize,
                search: searchTerm,
                status: statusFilter || undefined,
                user: selectedPatientId || undefined,
            });
            setItems(data.results);
            setTotalItems(data.count);
            setTotalPages(data.total_pages);
        } catch {
            toast.error("Could not load unavailability requests.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, statusFilter, selectedPatientId]);

    const loadPatients = async () => {
        if (patients.length > 0 || fetchingPatientsRef.current) return;
        fetchingPatientsRef.current = true;
        try {
            const data = await fetchMyPatients();
            setPatients(data);
        } catch (err) {
            console.error("Error fetching patients:", err);
        } finally {
            fetchingPatientsRef.current = false;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== searchInput) {
                setSearchTerm(searchInput);
                setCurrentPage(1);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput, searchTerm]);


    useEffect(() => {
        void load();
    }, [load]);

    const onApprove = async (id: number) => {
        try {
            const res = await approveUnavailability(id, { review_notes: notes || undefined });
            toast.success(
                `Approved. ${typeof res.skipped_meals_count === "number" ? `${res.skipped_meals_count} meal(s) marked skipped.` : ""}`
            );
            setActiveId(null);
            setNotes("");
            void load();
        } catch {
            toast.error("Approve failed.");
        }
    };

    const onReject = async (id: number) => {
        try {
            await rejectUnavailability(id, { review_notes: notes || undefined });
            toast.info("Request rejected.");
            setActiveId(null);
            setNotes("");
            void load();
        } catch {
            toast.error("Reject failed.");
        }
    };

    const openImpact = async (id: number) => {
        setImpactOpen(id);
        setImpactLoading(true);
        setImpactData(null);
        try {
            const data = await fetchImpact(id);
            setImpactData(data);
        } catch {
            toast.error("Could not load impact preview.");
            setImpactOpen(null);
        } finally {
            setImpactLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Patient unavailability | Miisky" description="Review patient away / skip-meal requests" />
            <PageBreadcrumb pageTitle="Patient unavailability" />
            <ToastContainer position="top-right" autoClose={3200} />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reason, status or name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                        <div className="w-full sm:w-64">
                            <SearchableSelect
                                options={[
                                    { value: "", label: "All Patients" },
                                    ...patients.map((p) => ({
                                        value: p.user.id,
                                        label: `${p.user.first_name} ${p.user.last_name}`.trim() || p.user.username,
                                    })),
                                ]}
                                value={selectedPatientId}
                                onChange={(val) => {
                                    setSelectedPatientId(val as number | "");
                                    setCurrentPage(1);
                                }}
                                onFocus={loadPatients}
                                placeholder="Filter by Patient"
                            />
                        </div>

                        <div className="w-full sm:w-48">
                            <Select
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: "", label: "All Status" },
                                    { value: "pending", label: "Pending" },
                                    { value: "approved", label: "Approved" },
                                    { value: "rejected", label: "Rejected" },
                                    { value: "cancelled", label: "Cancelled" },
                                ]}
                                placeholder="Filter by Status"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
                            <Select
                                value={String(pageSize)}
                                onChange={(val) => {
                                    setPageSize(Number(val));
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: "5", label: "5" },
                                    { value: "10", label: "10" },
                                    { value: "25", label: "25" },
                                    { value: "50", label: "50" },
                                ]}
                                className="w-20"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">entries</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                        {searchTerm && ` (filtered from search)`}
                    </div>
                </div>
            </div>


            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patient</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Dates</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Scope</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Reason</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patient comments</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Meals (range)</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Loading…
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((row, index) => (
                                    <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                                            {row.user_details
                                                ? `${row.user_details.first_name} ${row.user_details.last_name}`.trim()
                                                : `User #${row.user}`}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                            {row.from_date} → {row.to_date}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-gray-400">
                                            {row.scope === "all"
                                                ? "All meals"
                                                : row.meal_types_details?.length
                                                  ? row.meal_types_details.map((m) => m.name).join(", ")
                                                  : "—"}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-gray-400 max-w-xs truncate" title={row.reason ?? ""}>
                                            {row.reason || "—"}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-gray-400 max-w-xs truncate" title={row.patient_comments ?? ""}>
                                            {row.patient_comments || "—"}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <span className={statusBadge(row.status)}>{row.status}</span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-gray-400">
                                            {row.skip_meal_count ?? "—"}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => void openImpact(row.id)}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Impact
                                                </button>
                                                {row.status === "pending" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveId(activeId === row.id ? null : row.id)}
                                                        className="text-xs text-emerald-600 hover:underline"
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </div>
                                            {activeId === row.id && row.status === "pending" && (
                                                <div className="mt-2 space-y-2 rounded-lg border border-gray-100 dark:border-gray-700 p-2">
                                                    <textarea
                                                        placeholder="Optional review notes"
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-xs"
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => void onApprove(row.id)}
                                                            className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => void onReject(row.id)}
                                                            className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>


            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        currentPage === pageNum
                                            ? "bg-blue-600 text-white border border-blue-600"
                                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </div>
                </div>
            )}

            {impactOpen !== null && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-4 shadow-xl dark:bg-gray-900">
                        <div className="mb-3 flex justify-between items-center">
                            <h3 className="font-semibold">Meals in range (preview)</h3>
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-800"
                                onClick={() => {
                                    setImpactOpen(null);
                                    setImpactData(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        {impactLoading && <p className="text-sm text-gray-500">Loading…</p>}
                        {!impactLoading && impactData && (
                            <>
                                {(impactData.request.reason || impactData.request.patient_comments) && (
                                    <div className="mb-3 space-y-1 rounded-lg border border-gray-100 dark:border-gray-800 p-2 text-sm">
                                        {impactData.request.reason ? (
                                            <p>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Reason: </span>
                                                {impactData.request.reason}
                                            </p>
                                        ) : null}
                                        {impactData.request.patient_comments ? (
                                            <p>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    Patient comments:{" "}
                                                </span>
                                                {impactData.request.patient_comments}
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Total meal rows: <strong>{impactData.total_meals}</strong>
                                </p>
                                <ul className="space-y-1 text-sm">
                                    {impactData.impact_rows.map((r, i) => (
                                        <li key={i} className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-1">
                                            <span>{r.meal_date}</span>
                                            <span>{r.meal_type_name ?? "—"}</span>
                                            <span className="text-gray-500">×{r.meal_count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PatientUnavailabilityPage;
