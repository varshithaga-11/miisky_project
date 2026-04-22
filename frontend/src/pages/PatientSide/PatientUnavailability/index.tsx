import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker2 from "../../../components/form/date-picker2";
import { toast, ToastContainer } from "react-toastify";
import {
    cancelPastUnavailabilityRequestLite,
    fetchPastUnavailabilityRequestsLite,
    type PastUnavailabilityLiteItem,
} from "./pastRequestsApi";
import {
    createNewUnavailabilityRequestLite,
    fetchMealTypesForNewRequestLite,
    fetchUserPlansForNewRequestLite,
    type MealTypeNewRequestLiteOption,
    type UserDietPlanNewRequestLiteRow,
} from "./newRequestApi";

const PatientUnavailabilityPage: React.FC = () => {
    const [rows, setRows] = useState<PastUnavailabilityLiteItem[]>([]);
    const [pastPage, setPastPage] = useState(1);
    const [pastTotalPages, setPastTotalPages] = useState(1);
    const [pastCount, setPastCount] = useState(0);
    const [plans, setPlans] = useState<UserDietPlanNewRequestLiteRow[]>([]);
    const [mealTypes, setMealTypes] = useState<MealTypeNewRequestLiteOption[]>([]);
    const [mealTypesLoading, setMealTypesLoading] = useState(false);
    const [mealTypesLoaded, setMealTypesLoaded] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [pastLoading, setPastLoading] = useState(false);
    const [pastVisible, setPastVisible] = useState(false);
    const [pastLoaded, setPastLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [userDietPlanId, setUserDietPlanId] = useState<number | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [scope, setScope] = useState<"all" | "meal_type">("all");
    const [mealTypeIds, setMealTypeIds] = useState<number[]>([]);
    const [reason, setReason] = useState("");
    const [patientComments, setPatientComments] = useState("");

    const loadPlans = async () => {
        setPlansLoading(true);
        try {
            const pls = await fetchUserPlansForNewRequestLite();
            setPlans(pls);
        } catch {
            toast.error("Could not load your plans.");
        } finally {
            setPlansLoading(false);
        }
    };

    useEffect(() => {
        void loadPlans();
    }, []);

    const loadPastRequests = async (page = 1) => {
        setPastLoading(true);
        try {
            const payload = await fetchPastUnavailabilityRequestsLite(page);
            setRows(payload.results);
            setPastPage(payload.current_page);
            setPastTotalPages(payload.total_pages);
            setPastCount(payload.count);
            setPastLoaded(true);
        } catch {
            toast.error("Could not load your requests.");
        } finally {
            setPastLoading(false);
        }
    };

    const activePlan = useMemo(
        () => plans.find((p) => p.status === "active") ?? null,
        [plans]
    );
    const selectedPlan = useMemo(
        () => plans.find((p) => p.id === Number(userDietPlanId)) ?? null,
        [plans, userDietPlanId]
    );
    const selectedPlanStart = selectedPlan?.start_date ?? undefined;
    const selectedPlanEnd = selectedPlan?.end_date ?? undefined;

    /** Default the request dropdown to the active plan when nothing selected yet. */
    useEffect(() => {
        if (!activePlan) return;
        setUserDietPlanId((prev) => (prev === "" ? activePlan.id : prev));
    }, [activePlan]);

    /** Keep selected dates inside the currently selected plan period. */
    useEffect(() => {
        if (fromDate) {
            if ((selectedPlanStart && fromDate < selectedPlanStart) || (selectedPlanEnd && fromDate > selectedPlanEnd)) {
                setFromDate("");
            }
        }
        if (toDate) {
            if ((selectedPlanStart && toDate < selectedPlanStart) || (selectedPlanEnd && toDate > selectedPlanEnd)) {
                setToDate("");
            }
        }
    }, [selectedPlanStart, selectedPlanEnd, fromDate, toDate]);

    useEffect(() => {
        if (scope !== "meal_type" || mealTypesLoaded) return;
        const loadTypes = async () => {
            setMealTypesLoading(true);
            try {
                const list = await fetchMealTypesForNewRequestLite();
                setMealTypes(list);
                setMealTypesLoaded(true);
            } catch {
                setMealTypes([]);
                toast.error("Could not load meal types.");
            } finally {
                setMealTypesLoading(false);
            }
        };
        void loadTypes();
    }, [scope, mealTypesLoaded]);

    const toggleMealType = (id: number) => {
        setMealTypeIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].sort((a, b) => a - b)
        );
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userDietPlanId || !fromDate || !toDate) {
            toast.warning("Select your plan and dates.");
            return;
        }
        if (
            (selectedPlanStart && (fromDate < selectedPlanStart || toDate < selectedPlanStart)) ||
            (selectedPlanEnd && (fromDate > selectedPlanEnd || toDate > selectedPlanEnd))
        ) {
            toast.warning("Select dates within your plan period.");
            return;
        }
        if (scope === "meal_type" && mealTypeIds.length === 0) {
            toast.warning("Select at least one meal type.");
            return;
        }
        setSubmitting(true);
        try {
            await createNewUnavailabilityRequestLite({
                user_diet_plan: Number(userDietPlanId),
                from_date: fromDate,
                to_date: toDate,
                scope,
                meal_types: scope === "meal_type" ? mealTypeIds : [],
                reason: reason.trim() || undefined,
                patient_comments: patientComments.trim() || undefined,
            });
            toast.success("Request submitted. Your nutritionist will review it.");
            setReason("");
            setPatientComments("");
            await loadPlans();
            if (pastLoaded) {
                await loadPastRequests(pastPage);
            }
        } catch {
            toast.error("Could not submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    const onCancel = async (id: number) => {
        try {
            await cancelPastUnavailabilityRequestLite(id);
            toast.info("Request cancelled.");
            await loadPastRequests(pastPage);
        } catch {
            toast.error("Could not cancel.");
        }
    };

    const onTogglePastRequests = async () => {
        const nextVisible = !pastVisible;
        setPastVisible(nextVisible);
        if (nextVisible && !pastLoaded) {
            await loadPastRequests(1);
        }
    };

    return (
        <>
            <PageMeta title="Away / meal skip | Miisky" description="Tell us when you cannot take meals" />
            <PageBreadcrumb pageTitle="Away / meal skip requests" />
            <ToastContainer position="top-right" />

            <div className="space-y-8">
                <form
                    onSubmit={onSubmit}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5 space-y-4"
                >
                    <h2 className="text-lg font-semibold">New request</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Applies to one diet plan. After approval, scheduled meals in that range are marked skipped for kitchen
                        and delivery.
                    </p>

                    {activePlan ? (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                                Current active plan
                            </p>
                            <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                                {activePlan.diet_plan_details?.title ?? `Plan #${activePlan.id}`}
                                {activePlan.diet_plan_details?.code ? (
                                    <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                                        ({activePlan.diet_plan_details.code})
                                    </span>
                                ) : null}
                            </p>
                            <dl className="mt-2 grid gap-1 text-sm text-gray-700 dark:text-gray-300">
                                {(activePlan.start_date || activePlan.end_date) && (
                                    <div className="flex flex-wrap gap-x-2">
                                        <dt className="text-gray-500 dark:text-gray-400">Plan period</dt>
                                        <dd>
                                            {activePlan.start_date ?? "—"} → {activePlan.end_date ?? "—"}
                                        </dd>
                                    </div>
                                )}
                                {activePlan.micro_kitchen_details?.brand_name && (
                                    <div className="flex flex-wrap gap-x-2">
                                        <dt className="text-gray-500 dark:text-gray-400">Kitchen</dt>
                                        <dd>{activePlan.micro_kitchen_details.brand_name}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    ) : (
                        !plansLoading && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
                                You don&apos;t have an <strong>active</strong> diet plan right now. Choose any plan from the
                                list below if you still need to submit an unavailability request.
                            </div>
                        )
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Diet plan</label>
                            <select
                                required
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                                value={userDietPlanId}
                                onChange={(e) => setUserDietPlanId(e.target.value ? Number(e.target.value) : "")}
                            >
                                <option value="">Select plan</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {(p.diet_plan_details?.title ?? `Plan #${p.id}`) +
                                            ` (${p.status})` +
                                            (p.status === "active" ? " — current" : "")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Scope</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm"
                                value={scope}
                                onChange={(e) => {
                                    const nextScope = e.target.value as "all" | "meal_type";
                                    setScope(nextScope);
                                    if (nextScope === "all") {
                                        setMealTypeIds([]);
                                    }
                                }}
                            >
                                <option value="all">All meals (full day)</option>
                                <option value="meal_type">Specific meal types only</option>
                            </select>
                        </div>

                        <DatePicker2
                            id="patient-unavailability-from"
                            label="From"
                            value={fromDate}
                            placeholder="Start date"
                            minDate={selectedPlanStart}
                            maxDate={
                                toDate
                                    ? selectedPlanEnd
                                        ? (toDate < selectedPlanEnd ? toDate : selectedPlanEnd)
                                        : toDate
                                    : selectedPlanEnd
                            }
                            onChange={(d) => {
                                setFromDate(d);
                                if (toDate && d > toDate) setToDate("");
                            }}
                        />
                        <DatePicker2
                            id="patient-unavailability-to"
                            label="To"
                            value={toDate}
                            placeholder="End date"
                            minDate={
                                fromDate
                                    ? selectedPlanStart
                                        ? (fromDate > selectedPlanStart ? fromDate : selectedPlanStart)
                                        : fromDate
                                    : selectedPlanStart
                            }
                            maxDate={selectedPlanEnd}
                            onChange={setToDate}
                        />

                        {scope === "meal_type" && (
                            <div className="md:col-span-2">
                                <span className="block text-sm font-medium mb-2">Meal types</span>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                    Check all slots that apply to this request.
                                </p>
                                {mealTypesLoading ? (
                                    <p className="text-sm text-gray-500">Loading meal types…</p>
                                ) : mealTypes.length === 0 ? (
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        No meal types available. Try again later.
                                    </p>
                                ) : (
                                    <ul className="space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-3 max-h-56 overflow-y-auto">
                                        {mealTypes.map((m) => (
                                            <li key={m.id}>
                                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                                                        checked={mealTypeIds.includes(m.id)}
                                                        onChange={() => toggleMealType(m.id)}
                                                    />
                                                    <span className="text-gray-800 dark:text-gray-200">{m.name}</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {mealTypeIds.length > 0
                                        ? `${mealTypeIds.length} selected`
                                        : "None selected"}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                            <textarea
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Travel, hospital, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Patient comments (optional)</label>
                            <textarea
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm"
                                rows={3}
                                value={patientComments}
                                onChange={(e) => setPatientComments(e.target.value)}
                                placeholder="Anything else you want your nutritionist to know."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? "Submitting…" : "Submit request"}
                    </button>
                </form>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold">Your requests</h2>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void onTogglePastRequests()}
                                disabled={pastLoading}
                                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/60 disabled:opacity-50"
                            >
                                {pastVisible ? "Hide past requests" : "Show past requests"}
                            </button>
                            {pastVisible && pastLoaded && (
                                <button
                                    type="button"
                                    onClick={() => void loadPastRequests(pastPage)}
                                    disabled={pastLoading}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/60 disabled:opacity-50"
                                >
                                    Refresh
                                </button>
                            )}
                        </div>
                    </div>
                    {!pastVisible ? (
                        <p className="text-sm text-gray-500">
                            Click <strong>Show past requests</strong> to load your request history.
                        </p>
                    ) : pastLoading ? (
                        <p className="text-sm text-gray-500">Loading…</p>
                    ) : rows.length === 0 ? (
                        <p className="text-sm text-gray-500">No requests yet.</p>
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {rows.map((r) => (
                                    <li
                                        key={r.id}
                                        className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-800 p-3 text-sm"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {r.from_date} → {r.to_date}
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                {r.scope === "all"
                                                    ? "All meals"
                                                    : r.meal_types_details?.length
                                                      ? r.meal_types_details.map((m) => m.name).join(", ")
                                                      : "Meal types"}
                                            </div>
                                            <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">{r.status}</div>
                                            {r.reason ? (
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Reason: </span>
                                                    {r.reason}
                                                </p>
                                            ) : null}
                                            {r.patient_comments ? (
                                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Your comments: </span>
                                                    {r.patient_comments}
                                                </p>
                                            ) : null}
                                        </div>
                                        {r.status === "pending" && (
                                            <button
                                                type="button"
                                                onClick={() => void onCancel(r.id)}
                                                className="text-xs text-rose-600 hover:underline"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
                                <p className="text-gray-600 dark:text-gray-300">
                                    Page {pastPage} of {pastTotalPages} ({pastCount} total)
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void loadPastRequests(pastPage - 1)}
                                        disabled={pastLoading || pastPage <= 1}
                                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/60 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void loadPastRequests(pastPage + 1)}
                                        disabled={pastLoading || pastPage >= pastTotalPages}
                                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/60 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default PatientUnavailabilityPage;
