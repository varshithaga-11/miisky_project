import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMicroKitchenRatings, MicroKitchenRating } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiStar, FiMessageSquare, FiUser, FiCalendar, FiHome, FiSearch } from "react-icons/fi";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { useDebounce } from "../../../hooks/useDebounce";

const ReviewsPage: React.FC = () => {
  const [ratings, setRatings] = useState<MicroKitchenRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const data = await getMicroKitchenRatings({
        search: debouncedSearch,
        order_type: userTypeFilter,
        page: currentPage,
        limit: pageSize,
      });
      setRatings(data.results || []);
      setTotalItems(data.count || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load kitchen reviews");
      setRatings([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [debouncedSearch, userTypeFilter, currentPage]);

  useEffect(() => {
     setCurrentPage(1);
  }, [debouncedSearch, userTypeFilter]);

  // Group by kitchen
  const byKitchen = ratings.reduce<Record<number, MicroKitchenRating[]>>((acc, r) => {
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

          <div className="flex flex-wrap items-end gap-6 w-full lg:w-auto">
            <div className="flex-1 lg:w-80 min-w-[300px]">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Search feedback or customer</label>
              <div className="relative group/search">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Review contents, Order ID, or Customer name..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-sm font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>
            </div>
            
            <div className="w-64">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Category</label>
              <Select
                value={userTypeFilter}
                onChange={setUserTypeFilter}
                options={[
                  { value: "all", label: "All Feedback" },
                  { value: "patient", label: "Patient Only" },
                  { value: "non_patient", label: "Direct Orders Only" },
                ]}
                placeholder="Filter by type"
                className="w-full !rounded-2xl"
              />
            </div>
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
                          {r.order_type === "non_patient" ? (
                            <span className="ml-auto px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-500 uppercase">
                              Non-Patient (Order #{r.order})
                            </span>
                          ) : r.order_type === "patient" ? (
                            <span className="ml-auto px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[10px] font-black text-blue-500 uppercase">
                              Patient Order (Order #{r.order})
                            </span>
                          ) : (
                            <span className="ml-auto px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700 text-[10px] font-black text-gray-400 uppercase">
                              General Recommendation
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

            {/* Pagination Controls */}
            {totalItems > pageSize && (
                <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 dark:border-white/5">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       Showing <span className="text-gray-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                       <span className="text-gray-900 dark:text-white">{Math.min(currentPage * pageSize, totalItems)}</span> of {totalItems} entries
                   </p>
                   <div className="flex items-center gap-2">
                       <Button 
                           variant="outline" 
                           onClick={() => setCurrentPage(prev => prev - 1)} 
                           disabled={currentPage === 1 || loading}
                           className="!rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest"
                       >
                           Previous
                       </Button>
                       <div className="flex items-center gap-1">
                           {[...Array(Math.ceil(totalItems / pageSize))].map((_, i) => (
                               <button
                                   key={i}
                                   onClick={() => setCurrentPage(i + 1)}
                                   className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                                       currentPage === i + 1 
                                       ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                       : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                   }`}
                               >
                                   {i + 1}
                               </button>
                           ))}
                       </div>
                       <Button 
                           variant="outline" 
                           onClick={() => setCurrentPage(prev => prev + 1)} 
                           disabled={currentPage >= Math.ceil(totalItems / pageSize) || loading}
                           className="!rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest"
                       >
                           Next
                       </Button>
                   </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
