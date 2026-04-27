import { FiChevronDown, FiChevronUp, FiEye, FiPackage, FiUser } from "react-icons/fi";
import { useState, useEffect } from "react";
import { EmptyState } from "../PatientOverview/PatientDataViews";
import { fetchOrderDetailsAdmin } from "./adminOrderApi";

function money(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? `₹${n.toFixed(2)}` : String(v);
}

function fmtKm(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toFixed(2)} km` : String(v);
}

type OrderRow = Record<string, unknown> & {
  id?: number;
  status?: string;
  order_type?: string;
  created_at?: string;
  user_name?: string;
  delivery_address?: string | null;
  total_amount?: unknown;
  delivery_charge?: unknown;
  delivery_distance_km?: unknown;
  final_amount?: unknown;
  delivery_slab_details?: { min_km?: string; max_km?: string; charge?: string } | null;
  user_details?: { first_name?: string; last_name?: string; mobile?: string | null } | null;
  kitchen_details?: { brand_name?: string | null } | null;
  delivery_person_details?: { id?: number; first_name?: string; last_name?: string; mobile?: string | null } | null;
  items?: Array<{
    id?: number;
    quantity?: number;
    price?: unknown;
    subtotal?: unknown;
    food_details?: { name?: string | null } | null;
  }>;
};

export type AdminOrderListProps = {
  items: unknown[];
  /** When true, hide the “Customer” block (e.g. kitchen’s own order list). */
  hideCustomer?: boolean;
  /** When true, hide the “Kitchen” block (e.g. patient’s orders — show kitchen per order). */
  hideKitchen?: boolean;
  /** Custom detail fetcher (fallback to default admin fetcher) */
  detailFetcher?: (id: number) => Promise<any>;
};

export function AdminOrderList({ items, hideCustomer, hideKitchen, detailFetcher }: AdminOrderListProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderRow>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (openId !== null && !orderDetails[openId] && !loadingDetails[openId]) {
      setLoadingDetails((prev) => ({ ...prev, [openId]: true }));
      const fetcher = detailFetcher || fetchOrderDetailsAdmin;
      fetcher(openId)
        .then((data) => {
          setOrderDetails((prev) => ({ ...prev, [openId]: data }));
        })
        .catch((err) => {
          console.error("Failed to fetch order details", err);
        })
        .finally(() => {
          setLoadingDetails((prev) => ({ ...prev, [openId]: false }));
        });
    }
  }, [openId, orderDetails, loadingDetails, detailFetcher]);

  if (!items?.length) {
    return <EmptyState message="No orders found." />;
  }

  const list = items as OrderRow[];

  return (
    <div className="space-y-4">
      {list.map((summary) => {
        const id = summary.id ?? 0;
        const expanded = openId === id;
        const o = orderDetails[id] ? { ...summary, ...orderDetails[id] } : summary;
        const isLoading = loadingDetails[id];

        const ud = o.user_details;
        const kd = o.kitchen_details;
        const subtotal = Number(o.total_amount);
        const delivery = Number(o.delivery_charge);
        let finalAmt = Number(o.final_amount);
        if (Number.isFinite(subtotal) && subtotal > 0 && (!Number.isFinite(finalAmt) || finalAmt <= 0)) {
          finalAmt = subtotal + (Number.isFinite(delivery) ? delivery : 0);
        }

        return (
          <div
            key={id}
            className="rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white/70 dark:bg-gray-800/40 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenId(expanded ? null : id)}
              className="w-full text-left p-4 flex flex-wrap items-start justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors"
            >
              <div className="flex-1 min-w-[200px] space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">Order #{id}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      o.status === "delivered"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : o.status === "cancelled"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    }`}
                  >
                    {o.status ?? "—"}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{o.order_type ?? "—"}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {o.created_at ? new Date(o.created_at).toLocaleString() : "—"}
                </div>
                {!hideCustomer && (o.user_name || ud) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <FiUser className="text-indigo-500 shrink-0" />
                    <span className="font-medium">
                      {o.user_name || [ud?.first_name, ud?.last_name].filter(Boolean).join(" ") || "Customer"}
                    </span>
                    {ud?.mobile ? <span className="text-gray-400">· {ud.mobile}</span> : null}
                  </div>
                )}
                {!hideKitchen && kd?.brand_name && (
                  <div className="text-[11px] text-gray-500">Kitchen: {kd.brand_name}</div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                  <FiEye size={14} />
                  <span>View Details</span>
                </div>
                {expanded ? (
                  <FiChevronUp className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                ) : (
                  <FiChevronDown className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                )}
                
              </div>
            </button>

            {expanded && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-white/[0.06] space-y-3">
                {isLoading ? (
                  <div className="py-4 text-center text-xs text-indigo-500 font-bold uppercase animate-pulse">
                    Loading details...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">Delivery address</span>
                          <p className="text-gray-700 dark:text-gray-200 text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                            {o.delivery_address?.trim() || "—"}
                          </p>
                        </div>
                        {o.delivery_person_details && (
                          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">Assigned Delivery</span>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                                <FiUser size={14} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                  {[o.delivery_person_details.first_name, o.delivery_person_details.last_name].filter(Boolean).join(" ") || "Delivery Person"}
                                </p>
                                {o.delivery_person_details.mobile && (
                                  <p className="text-[10px] text-gray-500 font-medium">{o.delivery_person_details.mobile}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">Logistics & Charges</span>
                        <div className="space-y-2.5 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Straight-line distance</span>
                            <span className="font-black text-gray-900 dark:text-gray-100 tabular-nums">
                              {fmtKm(o.delivery_distance_km)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Food subtotal</span>
                            <span className="font-bold text-gray-900 dark:text-white tabular-nums">{money(o.total_amount)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Delivery charge</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{money(o.delivery_charge)}</span>
                          </div>
                          {o.delivery_slab_details && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5 flex flex-col gap-1">
                              <span className="text-[9px] font-black text-gray-400 uppercase">Slab Applied</span>
                              <div className="flex justify-between items-center text-[10px] font-bold text-indigo-500/80">
                                <span>{o.delivery_slab_details.min_km} – {o.delivery_slab_details.max_km} km</span>
                                <span>{money(o.delivery_slab_details.charge)}</span>
                              </div>
                            </div>
                          )}
                          <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase">Final Amount</span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{money(finalAmt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {o.items && o.items.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-2">
                          <FiPackage /> Line items
                        </div>
                        <ul className="rounded-xl bg-gray-50 dark:bg-gray-900/50 divide-y divide-gray-100 dark:divide-white/[0.06]">
                          {o.items.map((it) => (
                            <li
                              key={it.id ?? `${it.food_details?.name}-${it.quantity}`}
                              className="px-3 py-2 flex justify-between gap-2 text-xs"
                            >
                              <span className="text-gray-800 dark:text-gray-100 font-medium">
                                {it.food_details?.name ?? "Item"} × {it.quantity ?? 0}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300 shrink-0">{money(it.subtotal)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
