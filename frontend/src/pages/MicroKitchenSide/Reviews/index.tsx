import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMicroKitchenRatings, MicroKitchenRating } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiStar, FiMessageSquare, FiUser, FiCalendar, FiHome } from "react-icons/fi";
import Select from "../../../components/form/Select";

const ReviewsPage: React.FC = () => {
  const [ratings, setRatings] = useState<MicroKitchenRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const data = await getMicroKitchenRatings();
      setRatings(Array.isArray(data) ? data : (data as { results?: MicroKitchenRating[] }).results || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load kitchen reviews");
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  // Apply Filter
  const filteredRatings = ratings.filter((r) => {
    if (userTypeFilter === "patient") return !r.order;
    if (userTypeFilter === "non_patient") return !!r.order;
    return true;
  });

  // Group by kitchen
  const byKitchen = filteredRatings.reduce<Record<number, MicroKitchenRating[]>>((acc, r) => {
    const id = r.micro_kitchen;
    if (!acc[id]) acc[id] = [];
    acc[id].push(r);
    return acc;
  }, {});

  const kitchenGroups = Object.entries(byKitchen).map(([kid, list]) => ({
    kitchenId: parseInt(kid),
    kitchenName: list[0]?.kitchen_details?.brand_name || `Kitchen #${kid}`,
    ratings: list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    avgRating:
      list.reduce((s, r) => s + r.rating, 0) / list.length,
  }));

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Kitchen Reviews" description="Patient ratings for suggested micro kitchens" />
      <PageBreadcrumb pageTitle="Kitchen Reviews" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Kitchen Feedback
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">
              See what users are saying about the kitchens you recommended.
            </p>
          </div>

          <div className="flex items-center gap-3 w-72">
            <Select
              value={userTypeFilter}
              onChange={setUserTypeFilter}
              options={[
                { value: "all", label: "All Feedback" },
                { value: "patient", label: "General Patient Ratings" },
                { value: "non_patient", label: "Non-Patient (Orders)" },
              ]}
              placeholder="Filter by type"
              className="w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-[40px] h-48 animate-pulse shadow-sm border border-gray-100 dark:border-white/5"
              />
            ))}
          </div>
        ) : ratings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
            <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-8">
              <FiMessageSquare size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              No Reviews Yet
            </h3>
            <p className="text-gray-400 mt-2 font-medium">
              Ratings will appear here when patients rate the kitchens you suggested.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {kitchenGroups.map((group) => (
              <div
                key={group.kitchenId}
                className="bg-white dark:bg-gray-800 rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5"
              >
                <div className="p-8 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20">
                      <FiHome className="text-indigo-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        {group.kitchenName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex p-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              size={14}
                              className={
                                s <= Math.round(group.avgRating)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-gray-200 dark:text-gray-600"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                          {group.avgRating.toFixed(1)} Rating
                        </span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                          {group.ratings.length} verified review{group.ratings.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {group.ratings.map((r) => (
                    <div key={r.id} className="p-8 flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FiUser className="text-gray-500" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {r.user_details?.first_name} {r.user_details?.last_name}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FiStar
                                key={s}
                                size={14}
                                className={
                                  s <= r.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-200 dark:text-gray-600"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            <FiCalendar size={10} className="inline mr-1" />
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                          {r.order ? (
                            <span className="ml-auto px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-500 uppercase">
                              Non-Patient (Order #{r.order})
                            </span>
                          ) : (
                            <span className="ml-auto px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700 text-[10px] font-black text-gray-400 uppercase">
                              General Patient Recommendation
                            </span>
                          )}
                        </div>
                        {r.review && (
                          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm font-medium italic leading-relaxed">
                            "{r.review}"
                          </p>
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
  );
};

export default ReviewsPage;
