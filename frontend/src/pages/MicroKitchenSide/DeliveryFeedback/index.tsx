import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiLoader, FiSearch, FiStar, FiAlertTriangle, FiHash } from "react-icons/fi";
import { DeliveryFeedbackRow, fetchMicroKitchenDeliveryFeedbackList } from "./api";

const DeliveryFeedbackPage: React.FC = () => {
  const [rows, setRows] = useState<DeliveryFeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [count, setCount] = useState(0);
  const [feedbackType, setFeedbackType] = useState<"all" | "rating" | "issue">("all");
  const [targetType, setTargetType] = useState<"all" | "order" | "user_meal">("all");
  const [orderType, setOrderType] = useState<"all" | "patient" | "non_patient">("all");
  const [deliveryPersonFilter, setDeliveryPersonFilter] = useState("");
  const [deliveryPersonOptions, setDeliveryPersonOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / limit)), [count, limit]);

  useEffect(() => {
    const run = async () => {
      if (page === 1) setLoading(true);
      else setFetchingMore(true);
      try {
        const data = await fetchMicroKitchenDeliveryFeedbackList({
          page,
          limit,
          feedback_type: feedbackType,
          target_type: targetType,
          order_type: targetType === "order" ? orderType : "all",
          delivery_person: deliveryPersonFilter || undefined,
          search: search.trim() || undefined,
        });
        setRows((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
        setCount(data.count);
        setDeliveryPersonOptions(data.delivery_person_options || []);
        setHasMore(page * limit < (data.count || 0));
      } catch (e) {
        console.error(e);
        toast.error("Failed to load delivery feedback");
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    };
    run();
  }, [page, limit, feedbackType, targetType, orderType, deliveryPersonFilter, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !fetchingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById("delivery-feedback-scroll-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loading, fetchingMore]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Delivery reviews" description="View delivery ratings and issues for this kitchen" />
      <PageBreadcrumb pageTitle="Delivery reviews" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-white/5 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Delivery ratings & issues
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Review delivery feedback for orders and allotted meals of this kitchen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-white/[0.03] p-2 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setRows([]);
                    setTargetType("all");
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetType === "all" ? "bg-indigo-500 text-white" : "text-gray-500 hover:bg-white dark:hover:bg-white/[0.06]"}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setRows([]);
                    setTargetType("order");
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetType === "order" ? "bg-indigo-500 text-white" : "text-gray-500 hover:bg-white dark:hover:bg-white/[0.06]"}`}
                >
                  Orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setRows([]);
                    setTargetType("user_meal");
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetType === "user_meal" ? "bg-indigo-500 text-white" : "text-gray-500 hover:bg-white dark:hover:bg-white/[0.06]"}`}
                >
                  UserMeals
                </button>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setRows([]);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search reporter..."
                  className="pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-64"
                />
              </div>
              <select
                value={feedbackType}
                onChange={(e) => {
                  setPage(1);
                    setRows([]);
                  setFeedbackType(e.target.value as "all" | "rating" | "issue");
                }}
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All</option>
                <option value="rating">Ratings</option>
                <option value="issue">Issues</option>
              </select>
              <select
                value={deliveryPersonFilter}
                onChange={(e) => {
                  setPage(1);
                  setRows([]);
                  setDeliveryPersonFilter(e.target.value);
                }}
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">All Delivery Persons</option>
                {deliveryPersonOptions.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
              {targetType === "order" && (
                <select
                  value={orderType}
                  onChange={(e) => {
                    setPage(1);
                    setRows([]);
                    setOrderType(e.target.value as "all" | "patient" | "non_patient");
                  }}
                  className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Orders</option>
                  <option value="patient">Patient Orders</option>
                  <option value="non_patient">Non-patient Orders</option>
                </select>
              )}
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                <FiLoader className="animate-spin" />
                <span className="font-bold">Loading...</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-bold">
                No delivery feedback found.
              </div>
            ) : (
              <div className="space-y-4">
                {rows.map((r) => {
                  const reporter =
                    r.reported_by_details
                      ? `${r.reported_by_details.first_name || ""} ${r.reported_by_details.last_name || ""}`.trim() ||
                        r.reported_by_details.username
                      : "—";
                  const targetLabel = r.order
                    ? `Order #${r.order}`
                    : r.user_meal
                      ? `UserMeal #${r.user_meal}`
                      : "—";
                  const targetMeta = r.order
                    ? `${r.order_details?.order_type || "order"} • ${r.order_details?.status || "—"}`
                    : r.user_meal
                      ? `${r.user_meal_details?.meal_date || "—"} • ${r.user_meal_details?.status || "—"}`
                      : "—";
                  return (
                    <div
                      key={r.id}
                      className="rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900/20 p-5 md:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${r.feedback_type === "rating" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
                            {r.feedback_type === "rating" ? <FiStar /> : <FiAlertTriangle />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {r.feedback_type} • {new Date(r.created_at).toLocaleString()}
                            </p>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                              {reporter}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-black text-gray-500 dark:text-gray-400">
                          <FiHash />
                          <div className="text-right">
                            <div className="uppercase">{targetLabel}</div>
                            <div className="text-[10px] font-bold normal-case">{targetMeta}</div>
                          </div>
                        </div>
                      </div>

                      {r.feedback_type === "rating" ? (
                        <div className="mt-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/10 rounded-2xl p-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FiStar
                                key={s}
                                size={14}
                                className={s <= (r.rating || 0) ? "text-amber-500 fill-amber-500" : "text-gray-200"}
                              />
                            ))}
                            <span className="ml-2 text-xs font-black text-gray-900 dark:text-white">
                              {r.rating || 0}/5
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-bold text-gray-600 dark:text-gray-300 italic">
                            "{r.review || "No written review"}"
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/10 rounded-2xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1">
                            Issue type
                          </p>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase">
                            {(r.issue_type || "issue").replace(/_/g, " ")}
                          </p>
                          <p className="mt-2 text-sm font-bold text-gray-600 dark:text-gray-300 italic">
                            "{r.description || "No extra details"}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div id="delivery-feedback-scroll-sentinel" className="h-24 flex items-center justify-center mt-6">
            {fetchingMore && (
              <div className="flex items-center gap-3 text-gray-400">
                <FiLoader className="animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest">Loading more...</span>
              </div>
            )}
            {!loading && !hasMore && rows.length > 0 && (
              <p className="text-xs text-gray-400 font-bold">
                Loaded all {count} feedback entries.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryFeedbackPage;
