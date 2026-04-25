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
  FiPackage,
  FiPieChart,
  FiMapPin,
  FiClock,
} from "react-icons/fi";
import { FilterBar } from "../../../components/common";
import {
  getMicroKitchenDeliveryProfilesNoPagination,
  getMicroKitchenDeliveryTeamNoPagination,
  getMicroKitchenPatients,
  getMicroKitchenPatientsNoPagination,
  getMicroKitchenInspectionsNoPagination,
  getMicroKitchenReviewsPaginated,
  getMicroKitchenReviewsNoPagination,
  getMicroKitchenOrdersPaginated,
  getMicroKitchenOrdersNoPagination,
  getMicroKitchenFoodsPaginated,
  getMicroKitchenAvailableFoodsNoPagination,
  getMicroKitchenDailyMealsNoPagination,
  getMicroKitchenDeliverySlabs,
  getMicroKitchenGlobalAssignmentsNoPagination,
  getKitchenSupportTickets,
  getMicroKitchenMealDeliveryAssignmentsPaginated,
  getMicroKitchenMealDeliveryAssignmentsNoPagination,
  getMicroKitchenPayouts,
  getMicroKitchenPayoutsNoPagination,
  getMicroKitchenAllottedPlanPayouts,
  getMicroKitchenPlannedLeavesPaginated,
  getMicroKitchenPlannedLeavesNoPagination,
  getMicroKitchenDeliveryRatings,
  getMicroKitchenDeliveryFeedbackPaginated,
  getMicroKitchenOrderPaymentSnapshots,
  getMicroKitchenExecutionList,
  getMicroKitchenDetail,
  MicroKitchenProfile,
  MicroKitchenProfileSummary,
} from "./api";
import { AdminAllottedPlanPayoutsPanel } from "../shared/AdminAllottedPlanPayoutsPanel";
import {
  DisplayKitchenInfo,
  DisplayKitchenPatients,
  DisplayKitchenInspections,
  DisplayKitchenReviews,
  DisplayKitchenOrders,
  DisplayKitchenFoods,
  DisplayKitchenDailyPrep,
  DisplayKitchenDeliverySlabs,
  DisplayKitchenDeliveryProfiles,
  DisplayKitchenDeliveryTeam,
  DisplayKitchenDailyReassignments,
  DisplayKitchenGlobalAssignments,
  DisplayKitchenPlannedLeaves,
  DisplayKitchenTickets,
  DisplayKitchenPayouts,
  DisplayKitchenDeliveryRatings,
  DisplayOrderPaymentSnapshots,
  DisplayKitchenExecution,
} from "./MicroKitchenDataViews";

export type KitchenDataView =
  | "info"
  | "patients"
  | "prep"
  | "inspections"
  | "reviews"
  | "orders"
  | "delivery"
  | "global_assignments"
  | "daily_reassignments"
  | "delivery_team"
  | "planned_leaves"
  | "delivery_profiles"
  | "payouts"
  | "allotted_plan_payouts"
  | "delivery_ratings"
  | "foods"
  | "tickets"
  | "execution"
  | "order_payments";

const VIEW_TITLES: Record<KitchenDataView, string> = {
  info: "Kitchen Information & Questionnaire",
  patients: "Allotted Patients & Slots",
  prep: "Today's Daily Prep Schedule",
  inspections: "Compliance & Inspections",
  reviews: "Patient Reviews",
  orders: "Micro Kitchen Orders",
  delivery: "Delivery charges & distance slabs",
  global_assignments: "Global Delivery Assignments",
  daily_reassignments: "Daily Delivery Reassignments",
  delivery_team: "Delivery Team Members",
  planned_leaves: "Team Planned Leave",
  delivery_profiles: "Delivery Profiles",
  payouts: "Partner Payouts & Transfers",
  allotted_plan_payouts: "Allotted diet plan payouts",
  delivery_ratings: "Staff Delivery Ratings",
  foods: "Food Available (Menu)",
  tickets: "Kitchen Support Tickets",
  execution: "Kitchen Daily Execution List",
  order_payments: "Customer Order Payment Split",
};

const MENU_ITEMS: { key: KitchenDataView; description: string; icon: any }[] = [
  { key: "info", description: "Kitchen basics, owner info, GPS, questionnaire", icon: <FiInfo /> },
  { key: "patients", description: "Currently allotted patients and meal slots", icon: <FiUsers /> },
  { key: "prep", description: "Today's dispatch, packaging and prep logistics", icon: <FiTruck /> },
  { key: "inspections", description: "Detailed inspection reports and compliance", icon: <FiClipboard /> },
  { key: "reviews", description: "Ratings and feedback from patients", icon: <FiStar /> },
  { key: "orders", description: "Orders with address, distance, delivery & line items", icon: <FiShoppingCart /> },
  { key: "delivery", description: "Distance slabs and charge amounts for this kitchen", icon: <FiDollarSign /> },
  { key: "global_assignments", description: "Default delivery person allotment and per-slot coverage", icon: <FiTruck /> },
  { key: "daily_reassignments", description: "Meal-level delivery reassignment rows for this kitchen", icon: <FiTruck /> },
  { key: "delivery_team", description: "Delivery users attached to the kitchen team", icon: <FiUsers /> },
  { key: "planned_leaves", description: "Leave records for delivery staff linked to this kitchen", icon: <FiClipboard /> },
  { key: "delivery_profiles", description: "KYC and vehicle details of linked delivery staff", icon: <FiMapPin /> },
  { key: "payouts", description: "Earnings & patient billing trackers", icon: <FiPackage /> },
  { key: "allotted_plan_payouts", description: "Kitchen share from verified plan payments (allotted patients)", icon: <FiPieChart /> },
  { key: "delivery_ratings", description: "Delivery feedback and ratings for orders from this kitchen", icon: <FiStar /> },
  { key: "foods", description: "Menu items currently provided by the kitchen", icon: <FiMenu /> },
  { key: "tickets", description: "Technical and operational support requests", icon: <FiClipboard /> },
  { key: "execution", description: "Real-time status of today's kitchen operations", icon: <FiClock /> },
  { key: "order_payments", description: "Per-order freeze snapshot of platform vs kitchen split", icon: <FiDollarSign /> },
];

type Props = {
  kitchen: MicroKitchenProfileSummary;
  open: boolean;
  onClose: () => void;
};

export function MicroKitchenDetailModal({ kitchen, open, onClose }: Props) {
  const [screen, setScreen] = useState<"hub" | KitchenDataView>("hub");
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Filter states
  const [ordPeriod, setOrdPeriod] = useState("");
  const [ordStartDate, setOrdStartDate] = useState("");
  const [ordEndDate, setOrdEndDate] = useState("");

  const [revPeriod, setRevPeriod] = useState("");
  const [revStartDate, setRevStartDate] = useState("");
  const [revEndDate, setRevEndDate] = useState("");

  const [prepPeriod, setPrepPeriod] = useState("");
  const [prepStartDate, setPrepStartDate] = useState("");
  const [prepEndDate, setPrepEndDate] = useState("");

  const [execPeriod, setExecPeriod] = useState("");
  const [execStartDate, setExecStartDate] = useState("");
  const [execEndDate, setExecEndDate] = useState("");

  const [payPeriod, setPayPeriod] = useState("");
  const [payStartDate, setPayStartDate] = useState("");
  const [payEndDate, setPayEndDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
    setHasMore(false);
    
    // Reset filters on open if desired, or keep?
    // User usually wants fresh state on modal open
    setOrdPeriod(""); setOrdStartDate(""); setOrdEndDate("");
    setRevPeriod(""); setRevStartDate(""); setRevEndDate("");
    setPrepPeriod(""); setPrepStartDate(""); setPrepEndDate("");
    setExecPeriod(""); setExecStartDate(""); setExecEndDate("");
    setPayPeriod(""); setPayStartDate(""); setPayEndDate("");
  }, [open, kitchen.id]);

  const goHub = () => {
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
    setHasMore(false);
  };

  const loadView = useCallback(
    async (view: KitchenDataView, p = 1, isLoadMore = false, sd?: string, ed?: string, per?: string) => {
      const id = kitchen.id;
      if (view === "allotted_plan_payouts") {
        setScreen(view);
        setLoading(false);
        setPayload(null);
        setError(null);
        return;
      }
      if (!isLoadMore) {
        setScreen(view);
        setLoading(true);
        setPayload(null);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        let res: any;
        switch (view) {
          case "info":
            res = await getMicroKitchenDetail(id);
            setPayload({ results: res, page: 1, hasMore: false });
            break;
          case "patients":
            res = await getMicroKitchenPatients(id, p);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "delivery_team":
            setPayload({ results: await getMicroKitchenDeliveryTeamNoPagination(id), page: 1, hasMore: false });
            break;
          case "global_assignments":
            setPayload({ results: await getMicroKitchenGlobalAssignmentsNoPagination(id), page: 1, hasMore: false });
            break;
          case "daily_reassignments":
            res = await getMicroKitchenMealDeliveryAssignmentsPaginated(id, p, 10);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "planned_leaves":
            res = await getMicroKitchenPlannedLeavesPaginated(id, p, 10);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "delivery_profiles":
            setPayload({ results: await getMicroKitchenDeliveryProfilesNoPagination(id), page: 1, hasMore: false });
            break;
          case "inspections":
            setPayload({ results: await getMicroKitchenInspectionsNoPagination(id), page: 1, hasMore: false });
            break;
          case "reviews":
            res = await getMicroKitchenReviewsPaginated(id, p, 10, sd, ed, per);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "orders":
            res = await getMicroKitchenOrdersPaginated(id, p, 10, sd, ed, per);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "foods":
            res = await getMicroKitchenFoodsPaginated(id, p, 20);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "tickets":
            res = await getKitchenSupportTickets(kitchen.user, p, 10);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "payouts":
            res = await getMicroKitchenPayouts(id, p, 10, per, sd, ed);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "delivery_ratings":
            res = await getMicroKitchenDeliveryFeedbackPaginated(id, p, 10);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "delivery":
            setPayload({ results: await getMicroKitchenDeliverySlabs(id), page: 1, hasMore: false });
            break;
          case "prep":
            const nowPrep = new Date();
            res = await getMicroKitchenDailyMealsNoPagination(
              id,
              per,
              sd,
              ed,
              nowPrep.getMonth() + 1,
              nowPrep.getFullYear()
            );
            setPayload({ results: res, page: 1, hasMore: false });
            break;
          case "execution":
            const td = new Date().toISOString().split('T')[0];
            res = await getMicroKitchenExecutionList(id, p, 20, per, sd, ed, sd ? undefined : td);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
            break;
          case "order_payments":
            res = await getMicroKitchenOrderPaymentSnapshots(id, p, 20);
            setPayload((prev: any) => ({
              results: isLoadMore ? [...(prev?.results || []), ...res.results] : res.results,
              page: res.current_page,
              hasMore: res.current_page < res.total_pages
            }));
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

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !payload?.hasMore || !screen || screen === "hub") return;
    let sd, ed, per;
    if (screen === 'orders') { sd = ordStartDate; ed = ordEndDate; per = ordPeriod; }
    else if (screen === 'reviews') { sd = revStartDate; ed = revEndDate; per = revPeriod; }
    else if (screen === 'inspections') { return; }
    else if (screen === 'prep') { return; }
    else if (screen === 'execution') { sd = execStartDate; ed = execEndDate; per = execPeriod; }
    else if (screen === 'payouts') { sd = payStartDate; ed = payEndDate; per = payPeriod; }
    else if (screen === 'delivery_ratings') { /* No extra filters yet */ }
    else if (screen === 'daily_reassignments') { /* No extra filters */ }
    else if (screen === 'planned_leaves') { /* No extra filters */ }
    
    loadView(screen as KitchenDataView, (payload.page || 1) + 1, true, sd, ed, per);
  }, [loading, loadingMore, payload, screen, ordStartDate, ordEndDate, ordPeriod, revStartDate, revEndDate, revPeriod, prepStartDate, prepEndDate, prepPeriod, execStartDate, execEndDate, execPeriod, payStartDate, payEndDate, payPeriod, loadView]);

  useEffect(() => {
    if (!open || screen === "hub" || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) handleLoadMore();
    }, { threshold: 0.1 });
    const el = document.getElementById("mk-sentinel");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [open, screen, loading, handleLoadMore]);

  const handlePrepMonthChange = async (m: number, y: number) => {
    setLoading(true);
    try {
      const res = await getMicroKitchenDailyMealsNoPagination(kitchen.id, undefined, undefined, undefined, m, y);
      setPayload({ results: res, page: 1, hasMore: false });
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
            <div className="space-y-10 pb-10">
              <section>
                <div className="mb-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                    Admin summary views
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Open read-only summaries for the micro kitchen and its delivery management modules.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
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
              </section>
            </div>
          )}

          {screen !== "hub" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {screen === "allotted_plan_payouts" ? (
                <AdminAllottedPlanPayoutsPanel
                  partnerRoleLabel="micro kitchen"
                  loadRows={(search) => getMicroKitchenAllottedPlanPayouts(kitchen.id, search)}
                />
              ) : (
                <>
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
                      {screen === "info" && <DisplayKitchenInfo kitchen={payload?.results} />}
                      {screen === "patients" && (
                        <DisplayKitchenPatients 
                          items={payload?.results} 
                          kitchen={kitchen} 
                        />
                      )}
                      {screen === "delivery_team" && <DisplayKitchenDeliveryTeam items={payload?.results} />}
                      {screen === "global_assignments" && <DisplayKitchenGlobalAssignments items={payload?.results} />}
                      {screen === "daily_reassignments" && <DisplayKitchenDailyReassignments items={payload?.results} />}
                      {screen === "planned_leaves" && <DisplayKitchenPlannedLeaves items={payload?.results} />}
                      {screen === "delivery_profiles" && <DisplayKitchenDeliveryProfiles items={payload?.results} />}
                      {screen === "inspections" && (
                        <DisplayKitchenInspections items={payload?.results} />
                      )}
                      {screen === "reviews" && (
                        <div className="space-y-4">
                           <FilterBar 
                              startDate={revStartDate} 
                              endDate={revEndDate} 
                              activePeriod={revPeriod}
                              onPeriodChange={setRevPeriod}
                              onFilterChange={(s: string, e: string, p: string) => {
                                setRevStartDate(s); setRevEndDate(e);
                                setRevPeriod(p);
                                loadView("reviews", 1, false, s, e, p);
                              }}
                           />
                           <DisplayKitchenReviews 
                              items={payload?.results} 
                           />
                        </div>
                      )}
                      {screen === "orders" && (
                        <div className="space-y-4">
                           <FilterBar 
                              startDate={ordStartDate} 
                              endDate={ordEndDate} 
                              activePeriod={ordPeriod}
                              onPeriodChange={setOrdPeriod}
                              onFilterChange={(s, e, p) => {
                                setOrdStartDate(s); setOrdEndDate(e);
                                loadView("orders", 1, false, s, e, p);
                              }}
                           />
                           <DisplayKitchenOrders
                              items={payload?.results}
                           />
                        </div>
                      )}
                      {screen === "delivery" && <DisplayKitchenDeliverySlabs slabs={payload?.results} />}
                      {screen === "foods" && (
                        <DisplayKitchenFoods items={payload?.results} />
                      )}
                      {screen === "prep" && (
                        <DisplayKitchenDailyPrep 
                          items={payload?.results} 
                          onMonthChange={handlePrepMonthChange}
                        />
                      )}
                      {screen === "tickets" && (
                        <DisplayKitchenTickets
                          items={payload?.results}
                        />
                      )}
                      {screen === "payouts" && (
                        <div className="space-y-4">
                           <FilterBar 
                              startDate={payStartDate} 
                              endDate={payEndDate} 
                              activePeriod={payPeriod}
                              onPeriodChange={setPayPeriod}
                              onFilterChange={(s, e, p) => {
                                setPayStartDate(s); setPayEndDate(e);
                                loadView("payouts", 1, false, s, e, p);
                              }}
                           />
                           <DisplayKitchenPayouts 
                              items={payload?.results} 
                           />
                        </div>
                      )}
                      {screen === "delivery_ratings" && (
                        <DisplayKitchenDeliveryRatings 
                          items={payload?.results} 
                        />
                      )}
                      {screen === "order_payments" && (
                        <DisplayOrderPaymentSnapshots 
                           items={payload?.results} 
                        />
                      )}
                      {screen === "execution" && (
                        <div className="space-y-4">
                           <FilterBar 
                              startDate={execStartDate} 
                              endDate={execEndDate} 
                              activePeriod={execPeriod}
                              onPeriodChange={setExecPeriod}
                              onFilterChange={(s, e, p) => {
                                setExecStartDate(s); setExecEndDate(e);
                                loadView("execution", 1, false, s, e, p);
                              }}
                           />
                           <DisplayKitchenExecution 
                              items={payload?.results} 
                           />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              
              {payload?.hasMore && (
                <div id="mk-sentinel" className="h-20 flex items-center justify-center">
                   <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
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
