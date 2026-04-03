import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiX, FiUser, FiShoppingBag, FiTool, FiStar, FiCreditCard, FiClipboard } from "react-icons/fi";
import { getUserById, type UserRegister, fetchSupportTicketsForUser, fetchKitchenRatingsForUser, fetchOrderPaymentsForUser, fetchQuestionnairesForUser } from "./api";
import { fetchOrdersForUserAdmin } from "../shared/adminOrderApi";
import { AdminOrderList } from "../shared/AdminOrderList";
import { DisplayUserProfile, DisplaySupportTickets, DisplayKitchenRatings, DisplayPaymentHistory, DisplayQuestionnaire, type UserDetailRecord } from "../PatientOverview/PatientDataViews";

type Screen = "hub" | "profile" | "orders" | "tickets" | "kitchenRatings" | "orderPayments" | "questionnaire";

type Props = {
  user: UserRegister;
  open: boolean;
  onClose: () => void;
};

const MENU_ITEMS: { key: Exclude<Screen, "hub">; label: string; description: string; icon: any }[] = [
  { key: "profile", label: "Profile & address", description: "Account contact, map coordinates, activity", icon: FiUser },
  // { key: "questionnaire", label: "Health Questionnaire", description: "Onboarding intake, symptoms, conditions", icon: FiClipboard },
  { key: "orders", label: "Food Orders", description: "Full history of food orders and line items", icon: FiShoppingBag },
  { key: "tickets", label: "Support Tickets", description: "Technical issues and service desk history", icon: FiTool },
  { key: "kitchenRatings", label: "Kitchen Ratings", description: "Reviews and feedback given to kitchens", icon: FiStar },
  { key: "orderPayments", label: "Payment History", description: "Financial audit trail for all food purchases", icon: FiCreditCard },
];

export function NonPatientUserDetailModal({ user, open, onClose }: Props) {
  const [screen, setScreen] = useState<Screen>("hub");
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uid = user.id;

  useEffect(() => {
    if (!open) return;
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
  }, [open, uid]);

  const goHub = () => {
    setScreen("hub");
    setPayload(null);
    setError(null);
    setLoading(false);
  };

  const loadView = useCallback(
    async (view: Exclude<Screen, "hub">) => {
      if (uid == null) return;
      setScreen(view);
      setLoading(true);
      setError(null);
      setPayload(null);
      try {
        switch (view) {
          case "profile":
            setPayload(await getUserById(uid));
            break;
          case "questionnaire":
            setPayload(await fetchQuestionnairesForUser(uid));
            break;
          case "orders":
            const res = await fetchOrdersForUserAdmin(uid);
            setPayload(res.results);
            break;
          case "tickets":
            setPayload(await fetchSupportTicketsForUser(uid));
            break;
          case "kitchenRatings":
            setPayload(await fetchKitchenRatingsForUser(uid));
            break;
          case "orderPayments":
            setPayload(await fetchOrderPaymentsForUser(uid));
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
    [uid]
  );

  if (!open || uid == null) return null;

  const label = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 border border-emerald-100/80 dark:border-gray-700 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="np-user-modal-title"
      >
        <header className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-emerald-100/80 dark:border-gray-700 px-6 py-5 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/30">
          <div className="min-w-0">
            {screen !== "hub" && (
              <button
                type="button"
                onClick={goHub}
                className="mb-2 inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to menu
              </button>
            )}
            <h2
              id="np-user-modal-title"
              className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent truncate"
            >
              {screen === "hub"
                ? "Non-patient account"
                : MENU_ITEMS.find((m) => m.key === screen)?.label || "User detail"}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {label} · <span className="text-gray-400">ID {uid}</span> · <span className="uppercase text-[10px] font-bold">{user.role}</span>
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            onClick={onClose}
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
                  className="group text-left rounded-2xl border border-gray-200/90 dark:border-gray-600 p-5 hover:border-emerald-400 hover:shadow-lg dark:hover:bg-gray-800/80 transition-all bg-white/80 dark:bg-gray-800/40 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <item.icon size={48} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <item.icon size={18} />
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white tracking-tight">{item.label}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {screen !== "hub" && (
            <>
              {loading && <div className="py-24 text-center text-sm text-gray-500 animate-pulse">Fetching details...</div>}
              {!loading && error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-6 py-4 text-sm text-red-800 dark:text-red-400 shadow-sm">
                  <div className="font-bold mb-1">Update Failed</div>
                  {error}
                </div>
              )}
              {!loading && !error && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {screen === "profile" && !!payload && (
                    <DisplayUserProfile user={payload as UserDetailRecord} />
                  )}
                  {screen === "questionnaire" && Array.isArray(payload) && (
                    <DisplayQuestionnaire rows={payload as Record<string, unknown>[]} />
                  )}
                  {screen === "orders" && Array.isArray(payload) && (
                    <AdminOrderList items={payload} hideCustomer />
                  )}
                  {screen === "tickets" && Array.isArray(payload) && (
                    <DisplaySupportTickets items={payload} />
                  )}
                  {screen === "kitchenRatings" && Array.isArray(payload) && (
                    <DisplayKitchenRatings ratings={payload} />
                  )}
                  {screen === "orderPayments" && Array.isArray(payload) && (
                    <DisplayPaymentHistory items={payload} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
