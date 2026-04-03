import React, { useCallback, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiX,
  FiInfo,
  FiUsers,
  FiClipboard,
  FiStar,
  FiShoppingCart,
  FiMenu,
  FiTruck,
  FiDollarSign,
} from "react-icons/fi";
import {
  getMicroKitchenPatientsNoPagination,
  getMicroKitchenInspectionsNoPagination,
  getMicroKitchenReviewsPaginated,
  getMicroKitchenOrdersPaginated,
  getMicroKitchenFoodsPaginated,
  getMicroKitchenDailyMealsNoPagination,
  getMicroKitchenDeliverySlabs,
  getKitchenSupportTickets,
  MicroKitchenProfile,
} from "./api";
import {
  DisplayKitchenInfo,
  DisplayKitchenPatients,
  DisplayKitchenInspections,
  DisplayKitchenReviews,
  DisplayKitchenOrders,
  DisplayKitchenFoods,
  DisplayKitchenDailyPrep,
  DisplayKitchenDeliverySlabs,
  DisplayKitchenTickets,
} from "./MicroKitchenDataViews";

export type KitchenDataView =
  | "info"
  | "patients"
  | "prep"
  | "inspections"
  | "reviews"
  | "orders"
  | "delivery"
  | "foods"
  | "tickets";

const VIEW_TITLES: Record<KitchenDataView, string> = {
  info: "Kitchen Information & Questionnaire",
  patients: "Allotted Patients & Slots",
  prep: "Today's Daily Prep Schedule",
  inspections: "Compliance & Inspections",
  reviews: "Patient Reviews",
  orders: "Micro Kitchen Orders",
  delivery: "Delivery charges & distance slabs",
  foods: "Food Available (Menu)",
  tickets: "Kitchen Support Tickets",
};

const MENU_ITEMS: { key: KitchenDataView; description: string; icon: any }[] = [
  { key: "info", description: "Kitchen basics, owner info, GPS, questionnaire", icon: <FiInfo /> },
  { key: "patients", description: "Currently allotted patients and meal slots", icon: <FiUsers /> },
  { key: "prep", description: "Today's dispatch, packaging and prep logistics", icon: <FiTruck /> },
  { key: "inspections", description: "Detailed inspection reports and compliance", icon: <FiClipboard /> },
  { key: "reviews", description: "Ratings and feedback from patients", icon: <FiStar /> },
  { key: "orders", description: "Orders with address, distance, delivery & line items", icon: <FiShoppingCart /> },
  { key: "delivery", description: "Distance slabs and charge amounts for this kitchen", icon: <FiDollarSign /> },
  { key: "foods", description: "Menu items currently provided by the kitchen", icon: <FiMenu /> },
  { key: "tickets", description: "Technical and operational support requests", icon: <FiClipboard /> },
];

type Props = {
  kitchen: MicroKitchenProfile;
  open: boolean;
  onClose: () => void;
};

export function MicroKitchenDetailModal({ kitchen, open, onClose }: Props) {
  const [screen, setScreen] = useState<"hub" | KitchenDataView>("hub");
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!open) return;
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
    setPage(1);
    setHasMore(false);
  }, [open, kitchen.id]);

  const goHub = () => {
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
    setPage(1);
    setHasMore(false);
  };

  const loadView = useCallback(
    async (view: KitchenDataView, p = 1, isLoadMore = false) => {
      const id = kitchen.id;
      if (!isLoadMore) {
        setScreen(view);
        setLoading(true);
        setPayload(null);
        setPage(1);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        let res: any;
        switch (view) {
          case "info":
            setPayload(kitchen);
            break;
          case "patients":
            setPayload(await getMicroKitchenPatientsNoPagination(id));
            break;
          case "inspections":
            setPayload(await getMicroKitchenInspectionsNoPagination(id));
            break;
          case "reviews":
            res = await getMicroKitchenReviewsPaginated(id, p, 10);
            setPayload((prev: any) => isLoadMore ? [...(prev || []), ...res.results] : res.results);
            setHasMore(res.current_page < res.total_pages);
            break;
          case "orders":
            res = await getMicroKitchenOrdersPaginated(id, p, 10);
            setPayload((prev: any) => isLoadMore ? [...(prev || []), ...res.results] : res.results);
            setHasMore(res.current_page < res.total_pages);
            break;
          case "foods":
            res = await getMicroKitchenFoodsPaginated(id, p, 20);
            setPayload((prev: any) => isLoadMore ? [...(prev || []), ...res.results] : res.results);
            setHasMore(res.current_page < res.total_pages);
            break;
          case "tickets":
            res = await getKitchenSupportTickets(kitchen.user, p, 10);
            setPayload((prev: any) => isLoadMore ? [...(prev || []), ...res.results] : res.results);
            setHasMore(res.current_page < res.total_pages);
            break;
          case "delivery":
            setPayload(await getMicroKitchenDeliverySlabs(id));
            break;
          case "prep":
            const now = new Date();
            setPayload(await getMicroKitchenDailyMealsNoPagination(id, now.getMonth() + 1, now.getFullYear()));
            break;
          default:
            break;
        }
      } catch (e: any) {
        setError(e?.response?.data?.detail || e.message || "Failed to load data");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [kitchen]
  );

  const handleLoadMore = () => {
    const nextP = page + 1;
    setPage(nextP);
    loadView(screen as KitchenDataView, nextP, true);
  };

  const handlePrepMonthChange = async (m: number, y: number) => {
    setLoading(true);
    try {
      setPayload(await getMicroKitchenDailyMealsNoPagination(kitchen.id, m, y));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-blue-100 dark:border-gray-800 my-8"
        role="dialog"
        aria-modal="true"
      >
        <header className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-blue-50/50 dark:border-gray-800 px-6 py-5 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:to-blue-950/20">
          <div className="min-w-0">
            {screen !== "hub" && (
              <button
                type="button"
                onClick={goHub}
                className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
              >
                <FiArrowLeft className="w-3 h-3" />
                Back to menu
              </button>
            )}
            <h2 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate">
              {screen === "hub" ? "Kitchen detail hub" : VIEW_TITLES[screen as KitchenDataView]}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {kitchen.brand_name} · <span className="text-gray-400 font-mono text-xs">{kitchen.kitchen_code}</span>
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
            onClick={onClose}
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-blue-50/20 to-white dark:from-gray-900 dark:to-gray-950">
          {screen === "hub" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pb-10">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => loadView(item.key)}
                  className="group text-left rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:border-blue-500 transition-all bg-white dark:bg-gray-900/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-600">
                     {React.cloneElement(item.icon as React.ReactElement<any>, { size: 60 })}
                  </div>
                  <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                     {item.icon}
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">{VIEW_TITLES[item.key]}</div>
                  <div className="text-xs text-gray-500 mt-2 leading-relaxed italic">{item.description}</div>
                </button>
              ))}
            </div>
          )}

          {screen !== "hub" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {loading && !payload && (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="size-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Gathering data...</span>
                </div>
              )}
              
              {!loading && error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 px-6 py-4 text-sm text-red-600 dark:text-red-400 font-medium">
                  Oops! {error}
                </div>
              )}

              {payload && (
                <>
                  {screen === "info" && <DisplayKitchenInfo kitchen={payload} />}
                  {screen === "patients" && <DisplayKitchenPatients items={payload} kitchen={kitchen} />}
                  {screen === "inspections" && <DisplayKitchenInspections items={payload} />}
                  {screen === "reviews" && (
                    <DisplayKitchenReviews 
                      items={payload} 
                      onLoadMore={handleLoadMore} 
                      hasMore={hasMore} 
                      loadingMore={loadingMore} 
                    />
                  )}
                  {screen === "orders" && (
                    <DisplayKitchenOrders 
                      items={payload} 
                      onLoadMore={handleLoadMore} 
                      hasMore={hasMore} 
                      loadingMore={loadingMore} 
                    />
                  )}
                  {screen === "delivery" && <DisplayKitchenDeliverySlabs slabs={payload} />}
                  {screen === "foods" && (
                    <DisplayKitchenFoods 
                      items={payload} 
                      onLoadMore={handleLoadMore} 
                      hasMore={hasMore} 
                      loadingMore={loadingMore} 
                    />
                  )}
                  {screen === "prep" && <DisplayKitchenDailyPrep items={payload} onMonthChange={handlePrepMonthChange} />}
                  {screen === "tickets" && (
                    <DisplayKitchenTickets 
                      items={payload} 
                      onLoadMore={handleLoadMore} 
                      hasMore={hasMore} 
                      loadingMore={loadingMore} 
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <footer className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
           >
             Dismiss
           </button>
        </footer>
      </div>
    </div>
  );
}


