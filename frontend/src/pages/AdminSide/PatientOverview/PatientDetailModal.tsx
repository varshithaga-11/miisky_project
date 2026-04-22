import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiX } from "react-icons/fi";
import {
  fetchUserById,
  fetchQuestionnairesForPatient,
  fetchHealthReportsForPatient,
  fetchNutritionistMappingsForPatient,
  fetchNutritionistProfileByUserId,
  fetchNutritionistReviewsForPatient,
  fetchUserDietPlansForPatient,
  fetchUserMealsForPatient,
  fetchNutritionistHistoryForPatient,
  fetchKitchenHistoryForPatient,
  fetchDietPlanPaymentsForPatient,
  fetchOrderPaymentsForUserAdmin,
  fetchMeetingsForPatient,
  fetchSupportTicketsForPatient,
  fetchNutritionistRatingsForPatient,
  fetchKitchenRatingsForPatient,
  fetchPatientDietPlansNoPaginate,
  PatientUserRow,
} from "./api";
import { fetchOrdersForUserAdmin } from "../shared/adminOrderApi";
import { AdminOrderList } from "../shared/AdminOrderList";
import {
  DisplayUserProfile,
  DisplayQuestionnaire,
  DisplayHealthReports,
  DisplayNutritionistMapping,
  DisplayNutritionistProfile,
  DisplayReviews,
  DisplayDietPlans,
  DisplayMeals,
  DisplayNutritionistHistory,
  DisplayKitchenHistory,
  DisplayPaymentHistory,
  DisplayMeetings,
  DisplaySupportTickets,
  DisplayNutritionistRatings,
  DisplayKitchenRatings,
  type UserDetailRecord,
  type HealthReportRow,
  type MappingRow,
  type ReviewRow,
  type DietPlanRow,
  type MealRow,
  type PaymentEntry,
} from "./PatientDataViews";

export type HubView = "hub";
export type DataView =
  | "profile"
  | "questionnaire"
  | "healthReports"
  | "nutritionistMapping"
  | "nutritionistHistory"
  | "kitchenHistory"
  // | "nutritionistProfile"
  // | "reviews"
  | "dietPlans"
  | "meals"
  | "orders"
  | "dietPlanPayments"
  | "orderPayments"
  | "meetings"
  | "tickets"
  | "nutritionistRatings"
  | "kitchenRatings";

const VIEW_TITLES: Record<Exclude<DataView, never>, string> = {
  profile: "User profile",
  questionnaire: "Health questionnaire",
  healthReports: "Health reports",
  nutritionistMapping: "Nutritionist assignment",
  nutritionistHistory: "Nutritionist change history",
  kitchenHistory: "Kitchen change history",
  // nutritionistProfile: "Nutritionist profile",
  // reviews: "Nutritionist reviews",
  dietPlans: "Diet plans",
  meals: "Meals & packaging",
  orders: "Food orders (delivery)",
  dietPlanPayments: "Diet plan payment history",
  orderPayments: "Order payment history",
  meetings: "Consultation & meetings",
  tickets: "Support tickets & issues",
  nutritionistRatings: "Expert feedback & ratings",
  kitchenRatings: "Kitchen feedback & ratings",
};

const MENU_ITEMS: { key: DataView; description: string }[] = [
  { key: "profile", description: "Account & contact from User Management" },
  { key: "questionnaire", description: "Lifestyle & intake questionnaire" },
  { key: "healthReports", description: "Uploaded lab reports & files" },
  { key: "nutritionistMapping", description: "Which nutritionist is currently assigned" },
  { key: "nutritionistHistory", description: "Audit trail of nutritionist reassignments" },
  { key: "kitchenHistory", description: "Audit trail of micro-kitchen reassignments" },
  // { key: "nutritionistProfile", description: "Professional profile of active nutritionist" },
  // { key: "reviews", description: "Comments on health documents" },
  { key: "dietPlans", description: "Suggested and active diet plans" },
  { key: "meals", description: "Planned meals, foods, packaging" },
  { key: "orders", description: "Food orders: kitchen, totals, delivery distance & address" },
  { key: "dietPlanPayments", description: "Financial logs for diet plan purchases" },
  { key: "orderPayments", description: "Financial logs for individual meal orders" },
  { key: "meetings", description: "History of scheduled nutritionist consultations" },
  { key: "tickets", description: "Raised support cases and technical issues" },
  { key: "nutritionistRatings", description: "Reviews given to nutritionists" },
  { key: "kitchenRatings", description: "Reviews given to micro-kitchens" },
];

type Props = {
  patient: PatientUserRow;
  open: boolean;
  onClose: () => void;
};

export function PatientDetailModal({ patient, open, onClose }: Props) {
  const [screen, setScreen] = useState<HubView | DataView>("hub");
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionistUserId, setNutritionistUserId] = useState<number | null>(null);
  const [mealMonth, setMealMonth] = useState(new Date().getMonth() + 1);
  const [mealYear, setMealYear] = useState(new Date().getFullYear());
  const [orderPage, setOrderPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!open) return;
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
    setNutritionistUserId(null);
  }, [open, patient.id]);

  const resetAndClose = () => {
    setScreen("hub");
    setPayload(null);
    setError(null);
    setNutritionistUserId(null);
    onClose();
  };

  const goHub = () => {
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
  };

  const loadView = useCallback(
    async (view: DataView) => {
      const id = patient.id;
      setScreen(view);
      setLoading(true);
      setError(null);
      setPayload(null);
      try {
        switch (view) {
          case "profile": {
            const u = await fetchUserById(id);
            setPayload(u);
            break;
          }
          case "questionnaire": {
            const rows = await fetchQuestionnairesForPatient(id);
            setPayload(rows);
            break;
          }
          case "healthReports": {
            setPayload(await fetchHealthReportsForPatient(id));
            break;
          }
          case "nutritionistMapping": {
            const maps = await fetchNutritionistMappingsForPatient(id);
            setPayload(maps);
            const first = Array.isArray(maps) && maps.length ? (maps[0] as MappingRow) : null;
            setNutritionistUserId(typeof first?.nutritionist === "number" ? first.nutritionist : null);
            break;
          }
          case "nutritionistHistory": {
            setPayload(await fetchNutritionistHistoryForPatient(id));
            break;
          }
          case "kitchenHistory": {
            setPayload(await fetchKitchenHistoryForPatient(id));
            break;
          }
          // case "nutritionistProfile": {
          //   let nid = nutritionistUserId;
          //   if (nid == null) {
          //     const maps = await fetchNutritionistMappingsForPatient(id);
          //     const first = Array.isArray(maps) && maps.length ? (maps[0] as MappingRow) : null;
          //     nid = typeof first?.nutritionist === "number" ? first.nutritionist : null;
          //     setNutritionistUserId(nid);
          //   }
          //   if (nid == null) {
          //     setPayload([]);
          //     setError("No nutritionist linked to this patient. Open “Nutritionist assignment” first.");
          //   } else {
          //     setNutritionistUserId(nid);
          //     setPayload(await fetchNutritionistProfileByUserId(nid));
          //   }
          //   break;
          // }
          // case "reviews":
          //   setPayload(await fetchNutritionistReviewsForPatient(id));
          //   break;
          case "dietPlans":
            setPayload(await fetchPatientDietPlansNoPaginate(id));
            break;
          case "meals":
            setPayload(await fetchUserMealsForPatient(id, mealMonth, mealYear));
            break;
          case "orders": {
            const data = await fetchOrdersForUserAdmin(id, 1, 10);
            setPayload(data.results);
            setOrderPage(1);
            setHasMoreOrders(!!data.next);
            break;
          }
          case "dietPlanPayments": {
            setPayload(await fetchDietPlanPaymentsForPatient(id));
            break;
          }
          case "orderPayments": {
            const data = await fetchOrderPaymentsForUserAdmin(id, 1, 20);
            setPayload(data.results);
            setTotalItems(data.count);
            break;
          }
          case "meetings": {
            setPayload(await fetchMeetingsForPatient(id));
            break;
          }
          case "tickets": {
            setPayload(await fetchSupportTicketsForPatient(id));
            break;
          }
          case "nutritionistRatings": {
            setPayload(await fetchNutritionistRatingsForPatient(id));
            break;
          }
          case "kitchenRatings": {
            setPayload(await fetchKitchenRatingsForPatient(id));
            break;
          }
          default:
            break;
        }
      } catch (e: unknown) {
        const msg =
          e && typeof e === "object" && "response" in e
            ? JSON.stringify((e as { response?: { data?: unknown } }).response?.data)
            : e instanceof Error
              ? e.message
              : "Failed to load";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [patient.id, nutritionistUserId, mealMonth, mealYear]
  );

  useEffect(() => {
    if (screen === "meals") {
      loadView("meals");
    }
  }, [mealMonth, mealYear, screen]);

  const loadMoreOrders = useCallback(async () => {
    if (loadingOrders || !hasMoreOrders || screen !== "orders") return;
    setLoadingOrders(true);
    try {
      const nextPage = orderPage + 1;
      const data = await fetchOrdersForUserAdmin(patient.id, nextPage, 10);
      setPayload((prev: any) => [...(Array.isArray(prev) ? prev : []), ...data.results]);
      setOrderPage(nextPage);
      setHasMoreOrders(!!data.next);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  }, [patient.id, orderPage, hasMoreOrders, loadingOrders, screen]);

  useEffect(() => {
    if (screen !== "orders" || !hasMoreOrders) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreOrders();
        }
      },
      { threshold: 0.1 }
    );
    const sen = document.getElementById("order-scroll-sentinel");
    if (sen) obs.observe(sen);
    return () => obs.disconnect();
  }, [screen, hasMoreOrders, loadMoreOrders]);

  if (!open) return null;

  const patientLabel = [patient.first_name, patient.last_name].filter(Boolean).join(" ") || patient.username;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 border border-indigo-100/80 dark:border-gray-700 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-modal-title"
      >
        <header className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-indigo-100/80 dark:border-gray-700 px-6 py-5 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/40">
          <div className="min-w-0">
            {screen !== "hub" && (
              <button
                type="button"
                onClick={goHub}
                className="mb-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to menu
              </button>
            )}
            <h2 id="patient-modal-title" className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent truncate">
              {screen === "hub" ? "Patient details" : VIEW_TITLES[screen as DataView]}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {patientLabel} · <span className="text-gray-400">ID {patient.id}</span>
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            onClick={resetAndClose}
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-950">
          {screen === "hub" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => loadView(item.key)}
                  className="text-left rounded-2xl border border-gray-200/90 dark:border-gray-600 p-4 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100/50 dark:hover:bg-gray-800/80 dark:hover:border-indigo-500/50 transition-all bg-white/80 dark:bg-gray-800/40"
                >
                  <div className="font-semibold text-gray-900 dark:text-white">{VIEW_TITLES[item.key]}</div>
                  <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">{item.description}</div>
                </button>
              ))}
            </div>
          )}

          {screen !== "hub" && (
            <>
              {loading && (
                <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
              )}
              {!loading && error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}
              {!loading && !error && screen === "profile" && payload && (
                <DisplayUserProfile user={payload as UserDetailRecord} />
              )}
              {!loading && !error && screen === "questionnaire" && Array.isArray(payload) && (
                <DisplayQuestionnaire rows={payload as Record<string, unknown>[]} />
              )}
              {!loading && !error && screen === "healthReports" && Array.isArray(payload) && (
                <DisplayHealthReports items={payload as HealthReportRow[]} />
              )}
              {!loading && !error && screen === "nutritionistMapping" && Array.isArray(payload) && (
                <DisplayNutritionistMapping items={payload as MappingRow[]} />
              )}
              {!loading && !error && screen === "nutritionistHistory" && Array.isArray(payload) && (
                <DisplayNutritionistHistory items={payload} />
              )}
              {!loading && !error && screen === "kitchenHistory" && Array.isArray(payload) && (
                <DisplayKitchenHistory items={payload} />
              )}
              {/* {!loading && !error && screen === "nutritionistProfile" && Array.isArray(payload) && (
                <DisplayNutritionistProfile items={payload as Record<string, unknown>[]} />
              )} */}
              {/* {!loading && !error && screen === "reviews" && Array.isArray(payload) && (
                <DisplayReviews items={payload as ReviewRow[]} />
              )} */}
              {!loading && !error && screen === "dietPlans" && Array.isArray(payload) && (
                <DisplayDietPlans items={payload as DietPlanRow[]} />
              )}
              {!loading && !error && screen === "meals" && Array.isArray(payload) && (
                <DisplayMeals
                  meals={payload as MealRow[]}
                  month={mealMonth}
                  year={mealYear}
                  onMonthChange={(m, y) => {
                    setMealMonth(m);
                    setMealYear(y);
                  }}
                />
              )}
               {!loading && !error && screen === "orders" && Array.isArray(payload) && (
                <div className="space-y-6">
                  <AdminOrderList items={payload} hideCustomer />
                  <div id="order-scroll-sentinel" className="h-20 flex items-center justify-center">
                    {loadingOrders && <div className="text-xs text-indigo-500 font-bold uppercase animate-pulse">Loading more orders...</div>}
                    {!hasMoreOrders && payload.length > 0 && (
                      <div className="text-[10px] text-gray-400 font-bold uppercase">End of history</div>
                    )}
                  </div>
                </div>
              )}
              {!loading && !error && (screen === "dietPlanPayments" || screen === "orderPayments") && Array.isArray(payload) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      Audit Logs {screen === "orderPayments" && totalItems > 0 && `· (Total ${totalItems})`}
                    </p>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-white/5 mx-4" />
                  </div>
                  <DisplayPaymentHistory items={payload as PaymentEntry[]} />
                </div>
              )}
              {!loading && !error && screen === "meetings" && Array.isArray(payload) && (
                <DisplayMeetings items={payload} />
              )}
              {!loading && !error && screen === "tickets" && Array.isArray(payload) && (
                <DisplaySupportTickets items={payload} />
              )}
              {!loading && !error && screen === "nutritionistRatings" && Array.isArray(payload) && (
                <DisplayNutritionistRatings ratings={payload} />
              )}
              {!loading && !error && screen === "kitchenRatings" && Array.isArray(payload) && (
                <DisplayKitchenRatings ratings={payload} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
