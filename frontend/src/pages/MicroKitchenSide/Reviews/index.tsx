import React, { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMicroKitchenRatings, MicroKitchenRating } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiStar, FiMessageSquare, FiUser, FiCalendar, FiHome, FiSearch, FiInfo } from "react-icons/fi";
import Select from "../../../components/form/Select";
import { useDebounce } from "../../../hooks/useDebounce";
import { FilterBar } from "../../../components/common";

const ReviewsPage: React.FC = () => {
    const [ratings, setRatings] = useState<MicroKitchenRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [period, setPeriod] = useState("all");

    const fetchRatings = useCallback(async (p = 1, isLoadMore = false, s = debouncedSearch, t = userTypeFilter, sd = startDate, ed = endDate, per = period) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const data = await getMicroKitchenRatings({
                search: s,
                order_type: t,
                page: p,
                limit: 10,
                period: per,
                start_date: sd,
                end_date: ed
            });

            if (isLoadMore) {
                setRatings(prev => [...prev, ...(data.results || [])]);
            } else {
                setRatings(data.results || []);
            }
            setTotalItems(data.count || 0);
            setCurrentPage(data.current_page || p);
            setHasMore(data.current_page < data.total_pages);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load kitchen reviews");
            if (!isLoadMore) setRatings([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [debouncedSearch, userTypeFilter, startDate, endDate, period]);

    useEffect(() => {
        fetchRatings(1, false);
    }, [debouncedSearch, userTypeFilter, startDate, endDate, period]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                fetchRatings(currentPage + 1, true);
            }
        }, { threshold: 0.1 });
        const el = document.getElementById("reviews-sentinel");
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, currentPage, fetchRatings]);

    // Grouping by kitchen is less useful for infinite scroll if results are paginated,
    // but the original code did it. I'll maintain it for the current chunk.
    const byKitchen = ratings.reduce<Record<number, MicroKitchenRating[]>>((acc, r) => {
        const id = r.micro_kitchen;
        if (!acc[id]) acc[id] = [];
        acc[id].push(r);
        return acc;
    }, {});

    const kitchenGroups = Object.entries(byKitchen).map(([kid, list]) => ({
        kitchenId: parseInt(kid),
        kitchenName: list[0]?.kitchen_details?.brand_name || `Kitchen #${kid}`,
        ratings: list,
        avgRating: list.reduce((s, r) => s + r.rating, 0) / list.length,
    }));

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Kitchen Reviews | Miisky" description="Patient ratings for micro kitchens" />
            <PageBreadcrumb pageTitle="Consumer Feedback" />
            <ToastContainer position="top-right" />

            <div className="px-4 md:px-8 pb-20">
                <div className="flex flex-col gap-8 mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                Logistics Feedback
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium italic">
                                Monitoring consumer sentiment across recommendation streams.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-end gap-4">
                            <div className="w-full md:w-80">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Search Identifier</label>
                                <div className="relative group/search">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Review content or customer..."
                                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all italic"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-64">
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Context</label>
                                <Select
                                    value={userTypeFilter}
                                    onChange={setUserTypeFilter}
                                    options={[
                                        { value: "all", label: "Consolidated" },
                                        { value: "patient", label: "Patient Stream" },
                                        { value: "non_patient", label: "Direct Stream" },
                                    ]}
                                    className="!rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>

                    <FilterBar 
                        startDate={startDate}
                        endDate={endDate}
                        activePeriod={period}
                        onPeriodChange={setPeriod}
                        onFilterChange={(s, e, p) => {
                            setStartDate(s);
                            setEndDate(e);
                            setPeriod(p);
                        }}
                    />
                </div>

                {loading && currentPage === 1 ? (
                    <div className="space-y-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[40px] h-48 animate-pulse border border-gray-100 dark:border-white/5" />
                        ))}
                    </div>
                ) : ratings.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[50px] p-24 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none">
                        <div className="size-24 rounded-[40px] bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-200 mb-8">
                            <FiMessageSquare size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Operational Silence</h3>
                        <p className="text-gray-400 mt-2 font-medium italic uppercase tracking-widest text-[10px]">No feedback records synchronized for this window.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {kitchenGroups.map((group) => (
                            <div
                                key={group.kitchenId}
                                className="bg-white dark:bg-gray-800 rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5"
                            >
                                <div className="p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-gray-900/20">
                                    <div className="flex items-center gap-6">
                                        <div className="size-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                            <FiHome size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                                {group.kitchenName}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <FiStar
                                                            key={s}
                                                            size={14}
                                                            className={s <= Math.round(group.avgRating) ? "text-amber-500 fill-amber-500" : "text-gray-200"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    {group.avgRating.toFixed(1)} Aggregate / {group.ratings.length} Data points
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50 dark:divide-white/5">
                                    {group.ratings.map((r) => (
                                        <div key={r.id} className="p-8 flex gap-8 group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                            <div className="size-12 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <FiUser size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-4 flex-wrap mb-3">
                                                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                                        {r.user_details?.first_name} {r.user_details?.last_name}
                                                    </span>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <FiStar
                                                                key={s}
                                                                size={12}
                                                                className={s <= r.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-white/5 px-2 py-0.5 rounded-lg">
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </span>
                                                    <div className={`ml-auto px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest italic border shadow-sm ${
                                                        r.order_type === 'patient' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        r.order_type === 'non_patient' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>
                                                        {r.order_type === 'patient' ? 'Patient Segment' : r.order_type === 'non_patient' ? 'Retail Segment' : 'General'}
                                                        {r.order ? ` — Unit #${r.order}` : ''}
                                                    </div>
                                                </div>
                                                {r.review && (
                                                    <div className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent group-hover:border-indigo-100/30 transition-all">
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium italic leading-relaxed">
                                                            "{r.review}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div id="reviews-sentinel" className="py-12 flex items-center justify-center">
                                <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;
