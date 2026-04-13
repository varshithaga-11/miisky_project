import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker2 from "../../../components/form/date-picker2";
import { toast, ToastContainer } from "react-toastify";
import {
    fetchMyUnavailability,
    createUnavailability,
    cancelUnavailability,
    fetchMyDietPlans,
    type PatientUnavailabilityItem,
    type UserDietPlanRow,
} from "./api";
import { fetchMealTypesForPatient, type MealTypeOption } from "./mealTypeApi";

const PatientUnavailabilityPage: React.FC = () => {
    const [rows, setRows] = useState<PatientUnavailabilityItem[]>([]);
    const [plans, setPlans] = useState<UserDietPlanRow[]>([]);
    const [mealTypes, setMealTypes] = useState<MealTypeOption[]>([]);
    const [mealTypesLoading, setMealTypesLoading] = useState(false);
    const [mealTypesLoaded, setMealTypesLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [userDietPlanId, setUserDietPlanId] = useState<number | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [scope, setScope] = useState<"all" | "meal_type">("all");
    const [mealTypeIds, setMealTypeIds] = useState<number[]>([]);
    const [reason, setReason] = useState("");
    const [patientComments, setPatientComments] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const [list, pls] = await Promise.all([fetchMyUnavailability(), fetchMyDietPlans()]);
            setRows(list.sort((a, b) => b.id - a.id));
            setPlans(pls);
        } catch {
            toast.error("Could not load your requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const activePlan = useMemo(
        () => plans.find((p) => p.status === "active") ?? null,
        [plans]
    );

    /** Default the request dropdown to the active plan when nothing selected yet. */
    useEffect(() => {
        if (!activePlan) return;
        setUserDietPlanId((prev) => (prev === "" ? activePlan.id : prev));
    }, [activePlan]);

    useEffect(() => {
        if (scope !== "meal_type" || mealTypesLoaded) return;
        const loadTypes = async () => {
            setMealTypesLoading(true);
            try {
                const list = await fetchMealTypesForPatient();
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
        if (scope === "meal_type" && mealTypeIds.length === 0) {
            toast.warning("Select at least one meal type.");
            return;
        }
        setSubmitting(true);
        try {
            await createUnavailability({
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
            void load();
        } catch {
            toast.error("Could not submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    const onCancel = async (id: number) => {
        try {
            await cancelUnavailability(id);
            toast.info("Request cancelled.");
            void load();
        } catch {
            toast.error("Could not cancel.");
        }
    };

    return (
        <>
            <PageMeta title="Away / meal skip | Miisky" description="Tell us when you cannot take meals" />
            <PageBreadcrumb pageTitle="Away / meal skip requests" />
            <ToastContainer position="top-right" />

            <div className="grid gap-8 lg:grid-cols-2">
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
                        !loading && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
                                You don&apos;t have an <strong>active</strong> diet plan right now. Choose any plan from the
                                list below if you still need to submit an unavailability request.
                            </div>
                        )
                    )}

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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DatePicker2
                            id="patient-unavailability-from"
                            label="From"
                            value={fromDate}
                            placeholder="Start date"
                            maxDate={toDate || undefined}
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
                            minDate={fromDate || undefined}
                            onChange={setToDate}
                        />
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

                    {scope === "meal_type" && (
                        <div>
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

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? "Submitting…" : "Submit request"}
                    </button>
                </form>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-5">
                    <h2 className="text-lg font-semibold mb-4">Your requests</h2>
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading…</p>
                    ) : rows.length === 0 ? (
                        <p className="text-sm text-gray-500">No requests yet.</p>
                    ) : (
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
                    )}
                </div>
            </div>
        </>
    );
};

export default PatientUnavailabilityPage;
