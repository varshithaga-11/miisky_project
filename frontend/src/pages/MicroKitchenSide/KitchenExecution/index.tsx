import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { getExecutionList, getPrepList, getDeliveryList } from "./api";
import type { DailyMeal } from "../MealsBasedOnDaily/api";
import { FilterBar } from "../../../components/common";
import { FiClock, FiCheckCircle, FiUser, FiInfo } from "react-icons/fi";

type Tab = "execution" | "prep" | "delivery";

const KitchenExecutionPage: React.FC = () => {
    const [tab, setTab] = useState<Tab>("execution");
    const [rows, setRows] = useState<DailyMeal[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [period, setPeriod] = useState("all");

    const load = useCallback(async (p = 1, isLoadMore = false, sd = startDate, ed = endDate, per = period) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        
        try {
            let res: any;
            if (tab === "execution") res = await getExecutionList(p, undefined, sd, ed, per);
            else if (tab === "prep") res = await getPrepList(p, undefined, sd, ed, per);
            else res = await getDeliveryList(p, undefined, sd, ed, per);

            if (isLoadMore) {
                setRows(prev => [...prev, ...res.results]);
            } else {
                setRows(res.results);
            }
            setPage(res.current_page);
            setHasMore(res.current_page < res.total_pages);
        } catch {
            toast.error("Could not load meals.");
            if (!isLoadMore) setRows([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [tab, startDate, endDate, period]);

    useEffect(() => {
        setPage(1);
        load(1, false);
    }, [tab]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                load(page + 1, true);
            }
        }, { threshold: 0.1 });
        const el = document.getElementById("execution-sentinel");
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, page, load]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Kitchen Execution | Miisky" description="Prep and delivery lists" />
            <PageBreadcrumb pageTitle="Logistics Execution" />
            <ToastContainer position="top-right" />

            <div className="px-4 md:px-8 pb-20">
                <div className="mb-8 space-y-6">
                    <div className="flex rounded-2xl border border-gray-100 dark:border-white/5 p-1 bg-white dark:bg-gray-800 w-fit shadow-sm">
                        {(
                            [
                                ["execution", "Live Board"],
                                ["prep", "Prep Phase"],
                                ["delivery", "Dispatch"],
                            ] as const
                        ).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTab(key)}
                                className={`rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                                    tab === key
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <FilterBar 
                        startDate={startDate}
                        endDate={endDate}
                        activePeriod={period}
                        onPeriodChange={setPeriod}
                        onFilterChange={(s: string, e: string, p: string) => {
                            setStartDate(s);
                            setEndDate(e);
                            setPeriod(p);
                            load(1, false, s, e, p);
                        }}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-white/5 text-left">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient / Consumer</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Meal Type</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Food Identification</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {loading && page === 1 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="size-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <div className="size-20 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200">
                                                <FiInfo size={40} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Operational Records Found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((m) => {
                                        const st = (m as any).status || "scheduled";
                                        return (
                                            <tr key={m.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                            {m.user_details?.first_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                                                {m.user_details ? `${m.user_details.first_name} ${m.user_details.last_name}`.trim() : "—"}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Consumer ID: #{m.user_details?.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg w-fit text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                                                        {m.meal_type_details?.name ?? "—"}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{m.food_details?.name ?? "—"}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">{m.quantity} Unit(s) Assigned</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-sm border ${
                                                        st === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        st === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {st === 'delivered' ? <FiCheckCircle /> : <FiClock />}
                                                        {st}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && (
                        <div id="execution-sentinel" className="px-8 py-10 border-t border-gray-50 dark:border-white/5 flex items-center justify-center">
                            <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KitchenExecutionPage;
