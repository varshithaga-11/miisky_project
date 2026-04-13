import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import {
    fetchPatientUnavailability,
    approveUnavailability,
    rejectUnavailability,
    fetchImpact,
    type PatientUnavailabilityItem,
} from "./api";

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

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPatientUnavailability({
                status: statusFilter || undefined,
            });
            setItems(data);
        } catch {
            toast.error("Could not load unavailability requests.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

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

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500 dark:text-gray-400">
                            <th className="p-3 font-medium">Patient</th>
                            <th className="p-3 font-medium">Dates</th>
                            <th className="p-3 font-medium">Scope</th>
                            <th className="p-3 font-medium">Reason</th>
                            <th className="p-3 font-medium">Patient comments</th>
                            <th className="p-3 font-medium">Status</th>
                            <th className="p-3 font-medium">Meals (range)</th>
                            <th className="p-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500">
                                    Loading…
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500">
                                    No requests found.
                                </td>
                            </tr>
                        ) : (
                            items.map((row) => (
                                <tr key={row.id} className="border-b border-gray-50 dark:border-gray-800/80">
                                    <td className="p-3">
                                        {row.user_details
                                            ? `${row.user_details.first_name} ${row.user_details.last_name}`.trim()
                                            : `User #${row.user}`}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {row.from_date} → {row.to_date}
                                    </td>
                                    <td className="p-3">
                                        {row.scope === "all"
                                            ? "All meals"
                                            : row.meal_types_details?.length
                                              ? row.meal_types_details.map((m) => m.name).join(", ")
                                              : "—"}
                                    </td>
                                    <td className="p-3 max-w-xs truncate" title={row.reason ?? ""}>
                                        {row.reason || "—"}
                                    </td>
                                    <td className="p-3 max-w-xs truncate" title={row.patient_comments ?? ""}>
                                        {row.patient_comments || "—"}
                                    </td>
                                    <td className="p-3">
                                        <span className={statusBadge(row.status)}>{row.status}</span>
                                    </td>
                                    <td className="p-3">{row.skip_meal_count ?? "—"}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void openImpact(row.id)}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Impact
                                            </button>
                                            {row.status === "pending" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveId(activeId === row.id ? null : row.id)}
                                                        className="text-xs text-emerald-600 hover:underline"
                                                    >
                                                        Review
                                                    </button>
                                                </>
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
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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
