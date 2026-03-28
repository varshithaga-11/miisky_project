import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { getUserById, type UserRegister } from "./api";
import { fetchOrdersForUserAdmin } from "../shared/adminOrderApi";
import { AdminOrderList } from "../shared/AdminOrderList";
import { DisplayUserProfile, type UserDetailRecord } from "../PatientOverview/PatientDataViews";

type Screen = "hub" | "profile" | "orders";

type Props = {
  user: UserRegister;
  open: boolean;
  onClose: () => void;
};

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
        if (view === "profile") {
          setPayload(await getUserById(uid));
        } else if (view === "orders") {
          setPayload(await fetchOrdersForUserAdmin(uid));
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
              {screen === "hub" ? "Non-patient account" : screen === "profile" ? "Profile & contact" : "Orders & delivery"}
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
              <button
                type="button"
                onClick={() => loadView("profile")}
                className="text-left rounded-2xl border border-gray-200/90 dark:border-gray-600 p-4 hover:border-emerald-400 hover:shadow-md dark:hover:bg-gray-800/80 transition-all bg-white/80 dark:bg-gray-800/40"
              >
                <div className="font-semibold text-gray-900 dark:text-white">Profile & address</div>
                <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Full account from User Management: contact, address, map coordinates, activity.
                </div>
              </button>
              <button
                type="button"
                onClick={() => loadView("orders")}
                className="text-left rounded-2xl border border-gray-200/90 dark:border-gray-600 p-4 hover:border-emerald-400 hover:shadow-md dark:hover:bg-gray-800/80 transition-all bg-white/80 dark:bg-gray-800/40"
              >
                <div className="font-semibold text-gray-900 dark:text-white">Orders</div>
                <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  All food orders for this user: kitchen, items, delivery charge, distance, address, totals.
                </div>
              </button>
            </div>
          )}

          {screen !== "hub" && (
            <>
              {loading && <div className="py-16 text-center text-sm text-gray-500">Loading…</div>}
              {!loading && error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}
              {!loading && !error && screen === "profile" && payload && (
                <DisplayUserProfile user={payload as UserDetailRecord} />
              )}
              {!loading && !error && screen === "orders" && Array.isArray(payload) && (
                <AdminOrderList items={payload} hideCustomer />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
