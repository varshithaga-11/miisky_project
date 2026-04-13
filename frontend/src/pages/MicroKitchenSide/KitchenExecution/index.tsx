import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { getExecutionList, getPrepList, getDeliveryList } from "./api";
import type { DailyMeal } from "../MealsBasedOnDaily/api";

type Tab = "execution" | "prep" | "delivery";

function todayISO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

const KitchenExecutionPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>("execution");
    const [mealDate, setMealDate] = useState(todayISO());
    const [rows, setRows] = useState<DailyMeal[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!mealDate) return;
        setLoading(true);
        try {
            let data: DailyMeal[];
            if (tab === "execution") data = await getExecutionList(mealDate);
            else if (tab === "prep") data = await getPrepList(mealDate);
            else data = await getDeliveryList(mealDate);
            setRows(data);
        } catch {
            toast.error("Could not load meals.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [mealDate, tab]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <>
            <PageMeta title="Kitchen execution | Miisky" description="Prep and delivery lists (skipped meals hidden)" />
            <PageBreadcrumb pageTitle="Kitchen execution" />
            <ToastContainer position="top-right" />

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Skipped meals are excluded. Use the same date filters as daily prep.
            </p>

            <div className="mb-4 flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input
                        type="date"
                        value={mealDate}
                        onChange={(e) => setMealDate(e.target.value)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    />
                </div>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
                    {(
                        [
                            ["execution", "All meals"],
                            ["prep", "Prep"],
                            ["delivery", "Delivery"],
                        ] as const
                    ).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                tab === key
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500">
                            <th className="p-3 font-medium">Patient</th>
                            <th className="p-3 font-medium">Meal</th>
                            <th className="p-3 font-medium">Food</th>
                            <th className="p-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    Loading…
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No rows for this date.
                                </td>
                            </tr>
                        ) : (
                            rows.map((m) => {
                                const st = (m as DailyMeal & { status?: string }).status;
                                return (
                                    <tr key={m.id} className="border-b border-gray-50 dark:border-gray-800/80">
                                        <td className="p-3">
                                            {m.user_details
                                                ? `${m.user_details.first_name} ${m.user_details.last_name}`.trim()
                                                : "—"}
                                        </td>
                                        <td className="p-3">{m.meal_type_details?.name ?? "—"}</td>
                                        <td className="p-3">{m.food_details?.name ?? "—"}</td>
                                        <td className="p-3">{st ?? "scheduled"}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default KitchenExecutionPage;
