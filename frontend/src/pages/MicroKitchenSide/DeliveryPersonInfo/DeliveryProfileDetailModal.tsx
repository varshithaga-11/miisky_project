import React, { useCallback, useEffect, useState } from "react";
import { createApiUrl } from "../../../access/access";
import {
  FiX,
  FiArrowLeft,
  FiUser,
  FiTruck,
  FiDollarSign,
  FiShoppingCart,
  FiCalendar,
  FiStar,
  FiAlertTriangle,
  FiFileText,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import {
  type KitchenDeliveryProfile,
  fetchDeliveryPersonOrders,
  fetchDeliveryPersonPayments,
  fetchDeliveryPersonLeaves,
  fetchDeliveryPersonReviews,
  fetchDeliveryPersonIssues,
  fetchDeliveryPersonMealAssignments,
  fetchDeliveryPersonGlobalAssignments,
  type DietPlanDeliveryAssignment,
  type DeliveryPersonOrder,
  type DeliveryPersonPayment,
  type DeliveryPersonLeave,
  type DeliveryPersonReview,
  type DeliveryPersonMealAssignment,
} from "./api";

// ─── helpers ──────────────────────────────────────────────────────────────────

const mediaUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

const fmtDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

const personName = (row: KitchenDeliveryProfile) => {
  if (!row.user_details) return "Delivery staff";
  const n = `${row.user_details.first_name || ""} ${row.user_details.last_name || ""}`.trim();
  return n || row.user_details.username || "Delivery staff";
};

// ─── Sub-views ────────────────────────────────────────────────────────────────

type ViewKey =
  | "profile"
  | "global_assignments"
  | "orders"
  | "payments"
  | "meal_assignments"
  | "reassignments"
  | "leaves"
  | "reviews"
  | "issues";

const VIEW_TITLES: Record<ViewKey, string> = {
  profile: "Delivery Profile & KYC",
  global_assignments: "Global Patient Assignments",
  orders: "Orders",
  payments: "Payment of User Meals",
  meal_assignments: "Meal Delivery Assignments",
  reassignments: "Reassignment History",
  leaves: "Planned Leaves",
  reviews: "Ratings & Reviews",
  issues: "Issues Reported",
};

const MENU_ITEMS: {
  key: ViewKey;
  label: string;
  description: string;
  icon: React.ReactElement;
  color: string;
}[] = [
  {
    key: "profile",
    label: "Delivery Profile & KYC",
    description: "Vehicle, documents, bank and availability",
    icon: <FiUser />,
    color: "blue",
  },
  {
    key: "global_assignments",
    label: "Global Patient Assignments",
    description: "Regular patients and primary slots mapped to this person",
    icon: <FiCheckCircle />,
    color: "emerald",
  },
  {
    key: "orders",
    label: "Orders",
    description: "Kitchen orders assigned to this delivery person",
    icon: <FiShoppingCart />,
    color: "violet",
  },
  {
    key: "payments",
    label: "Payment of User Meals",
    description: "Order payment snapshots linked to this delivery person",
    icon: <FiDollarSign />,
    color: "emerald",
  },
  {
    key: "meal_assignments",
    label: "Meal Delivery Assignments",
    description: "Daily meal-level delivery task assignments",
    icon: <FiTruck />,
    color: "indigo",
  },
  {
    key: "leaves",
    label: "Planned Leaves",
    description: "Leave records for this delivery staff member",
    icon: <FiCalendar />,
    color: "amber",
  },
  {
    key: "reassignments",
    label: "Reassignment History",
    description: "Detailed logs of reassigned plans and meals with reasons",
    icon: <FiAlertTriangle />,
    color: "rose",
  },
  {
    key: "reviews",
    label: "Ratings & Reviews",
    description: "Delivery feedback and ratings from customers",
    icon: <FiStar />,
    color: "yellow",
  },
  {
    key: "issues",
    label: "Issues Reported",
    description: "Delivery issues or complaints submitted by customers",
    icon: <FiAlertTriangle />,
    color: "rose",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/40 hover:border-blue-400",
  violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800/40 hover:border-violet-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40 hover:border-emerald-400",
  indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/40 hover:border-indigo-400",
  amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40 hover:border-amber-400",
  yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800/40 hover:border-yellow-400",
  rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/40 hover:border-rose-400",
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="py-14 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-gray-400 text-sm">
      {msg}
    </div>
  );
}

// ─── LoadMore button ──────────────────────────────────────────────────────────
function LoadMoreBtn({
  hasMore,
  loading,
  onLoad,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoad: () => void;
}) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center pt-4">
      <button
        type="button"
        disabled={loading}
        onClick={onLoad}
        className="px-8 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all"
      >
        {loading ? "Loading…" : "Load More"}
      </button>
    </div>
  );
}

// ─── Profile view (inline display) ───────────────────────────────────────────
function ProfileView({ row }: { row: KitchenDeliveryProfile }) {
  const docRow = (label: string, url: string | null | undefined) => (
    <div
      key={label}
      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0 text-sm"
    >
      <span className="text-gray-500">{label}</span>
      {url ? (
        <a
          href={mediaUrl(url)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          <FiFileText size={13} /> View
        </a>
      ) : (
        <span className="text-xs text-gray-300">Not uploaded</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Vehicle */}
      <section>
        <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
          <FiTruck /> Vehicle Details
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-2xl border border-gray-100 dark:border-white/5 p-4 bg-gray-50 dark:bg-white/[0.02]">
          {[
            ["Vehicle Type", row.vehicle_type],
            ["Other Vehicle", row.other_vehicle_name],
            ["Registration No.", row.register_number],
            ["Licence No.", row.license_number],
          ].map(([label, val]) => (
            <div key={label as string}>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{label}</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{val || "—"}</p>
            </div>
          ))}
          {row.vehicle_details && (
            <div className="col-span-2 md:col-span-3">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Vehicle Details</span>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-0.5 whitespace-pre-wrap">{row.vehicle_details}</p>
            </div>
          )}
        </div>
      </section>

      {/* Documents */}
      <section>
        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
          <FiFileText /> Documents
        </h4>
        <div className="rounded-2xl border border-gray-100 dark:border-white/5 px-4 bg-white dark:bg-white/[0.02]">
          {docRow("Licence Copy", row.license_copy)}
          {docRow("RC Copy", row.rc_copy)}
          {docRow("Insurance Copy", row.insurance_copy)}
          {docRow("PUC Image", row.puc_image)}
          {docRow("Aadhaar Image", row.aadhar_image)}
          {docRow("PAN Image", row.pan_image)}
        </div>
      </section>

      {/* Identity */}
      <section>
        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
          Identity Numbers
        </h4>
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 dark:border-white/5 p-4 bg-gray-50 dark:bg-white/[0.02]">
          {[
            ["Aadhaar Number", row.aadhar_number],
            ["PAN Number", row.pan_number],
          ].map(([label, val]) => (
            <div key={label as string}>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{label}</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">{val || "—"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bank */}
      <section>
        <h4 className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-3">
          Bank Details
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-gray-100 dark:border-white/5 p-4 bg-gray-50 dark:bg-white/[0.02]">
          {[
            ["Account Holder", row.account_holder_name],
            ["Bank Name", row.bank_name],
            ["Account No.", row.bank_account_number],
            ["IFSC Code", row.ifsc_code],
          ].map(([label, val]) => (
            <div key={label as string}>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{label}</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">{val || "—"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Availability */}
      {row.available_slots && (
        <section>
          <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
            <FiClock /> Availability / Slots
          </h4>
          <pre className="text-xs bg-gray-50 dark:bg-black/20 rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap border border-gray-100 dark:border-white/5">
            {row.available_slots}
          </pre>
        </section>
      )}

      {/* Verification */}
      <section>
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
          Verification Status
        </h4>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm">
          {row.is_verified ? (
            <>
              <FiCheckCircle className="text-emerald-500" size={16} />
              <span className="text-emerald-700 dark:text-emerald-400">
                Verified on {fmtDateTime(row.verified_on)}
                {row.verified_by_details && (
                  <> by {row.verified_by_details.first_name} {row.verified_by_details.last_name}</>
                )}
              </span>
            </>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">⏳ Pending verification</span>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Orders view ──────────────────────────────────────────────────────────────
// ─── Orders view ──────────────────────────────────────────────────────────────
function OrdersView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DeliveryPersonOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonOrders(profileId, 1, 10).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonOrders(profileId, nextPage, 10).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading orders…</div>;
  if (!items.length) return <EmptyState msg="No orders found for this delivery person." />;

  const statusColor = (s: string) =>
    s === "delivered" ? "bg-emerald-100 text-emerald-700" :
    s === "pending" ? "bg-amber-100 text-amber-700" :
    s === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-3">
      {items.map((o) => (
        <div key={o.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white dark:bg-gray-800/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 dark:text-white">Order #{o.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColor(o.status)}`}>
                  {o.status?.replace(/_/g, " ")}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 uppercase">
                  {o.order_type?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="text-xs text-gray-500">{fmtDateTime(o.created_at)}</div>
            </div>
            <div className="text-right">
              {o.grand_total && (
                <div className="text-lg font-black text-gray-900 dark:text-white">
                  ₹{parseFloat(o.grand_total).toFixed(2)}
                </div>
              )}
              {o.delivery_charge && (
                <div className="text-xs text-gray-400">Delivery: ₹{parseFloat(o.delivery_charge).toFixed(2)}</div>
              )}
              {o.micro_kitchen_brand && (
                 <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{o.micro_kitchen_brand}</div>
              )}
            </div>
          </div>
          {o.customer_display && (
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Customer:</span> {o.customer_display}
            </div>
          )}
        </div>
      ))}
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Payments view ────────────────────────────────────────────────────────────
// ─── Payments view ────────────────────────────────────────────────────────────
function PaymentsView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DeliveryPersonPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonPayments(profileId, 1, 10).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonPayments(profileId, nextPage, 10).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading payments…</div>;
  if (!items.length) return <EmptyState msg="No payment records found for this delivery person." />;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/[0.06]">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/80 text-[10px] font-black uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Grand Total</th>
              <th className="px-4 py-3 text-right">Delivery</th>
              <th className="px-4 py-3 text-right">Kitchen Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {items.map((p) => (
              <tr key={p.id} className="bg-white dark:bg-gray-900/30 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">#{p.order_id}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[180px] truncate">{p.customer_display || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-black uppercase">
                    {p.order_type?.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(p.order_created_at)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">₹{parseFloat(p.grand_total || "0").toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">₹{parseFloat(p.delivery_charge || "0").toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">₹{parseFloat(p.kitchen_amount || "0").toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Meal Assignments view ────────────────────────────────────────────────────
// ─── Meal Assignments view ────────────────────────────────────────────────────
function MealAssignmentsView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DeliveryPersonMealAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonMealAssignments(profileId, 1, 15).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonMealAssignments(profileId, nextPage, 15).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading meal assignments…</div>;
  if (!items.length) return <EmptyState msg="No meal delivery assignments found for this person." />;

  const statusColor = (s: string) =>
    s === "delivered" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
    s === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
    s === "in_transit" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white dark:bg-gray-800/30 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-base">
                  {a.patient_name || `Meal #${a.user_meal}`}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColor(a.status)}`}>
                  {a.status?.replace(/_/g, " ")}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiCalendar className="shrink-0" /> 
                  <span>Meal: <strong>{fmtDate(a.meal_date)}</strong></span>
                </div>
                {a.slot_name && (
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                    <FiClock className="shrink-0" />
                    <span>Slot: <strong>{a.slot_name}</strong> ({a.slot_start || "?"}–{a.slot_end || "?"})</span>
                  </div>
                )}
                {a.meal_type && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="shrink-0">🍽</span>
                    <span>Type: <strong>{a.meal_type}</strong></span>
                  </div>
                )}
                {a.food_name && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="shrink-0">🥗</span>
                    <span>Food: <strong>{a.food_name}</strong></span>
                  </div>
                )}
              </div>

              {a.reassignment_reason && (
                <div className="mt-2 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs shadow-sm">
                  <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1 uppercase tracking-wider text-[10px]">
                    <FiAlertTriangle size={12} /> Reassignment Reason
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 italic">"{a.reassignment_reason}"</div>
                </div>
              )}
            </div>
            
            <div className="text-right shrink-0">
               <span className="text-[10px] font-black text-gray-300 uppercase tabular-nums">ID #{a.id}</span>
            </div>
          </div>
        </div>
      ))}
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Reassignments History view ───────────────────────────────────────────────
function ReassignmentsHistoryView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DeliveryPersonMealAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonMealAssignments(profileId, 1, 15, true).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonMealAssignments(profileId, nextPage, 15, true).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading history…</div>;
  if (!items.length) return <EmptyState msg="No reassignment logs found for this person." />;

  return (
    <div className="space-y-4 pb-8">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
        <FiAlertTriangle size={14} /> Individual Meal Coverage History
      </h3>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-900/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {a.patient_name || `Meal #${a.user_meal}`}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-2">
                    <FiCalendar size={10} /> {fmtDate(a.meal_date)}
                    <span className="text-gray-300">|</span>
                    <FiClock size={10} /> {a.slot_name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Single shift reassignment</div>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-gray-800/50 text-xs border border-amber-50 dark:border-amber-900/30">
               <div className="font-bold text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Reason</div>
               <div className="italic text-gray-600 dark:text-gray-300">"{a.reassignment_reason}"</div>
            </div>
          </div>
        ))}
      </div>
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Global Assignments view ──────────────────────────────────────────────────
// ─── Global Assignments view ──────────────────────────────────────────────────
function GlobalAssignmentsView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DietPlanDeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonGlobalAssignments(profileId, 1, 10).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonGlobalAssignments(profileId, nextPage, 10).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading mappings…</div>;
  if (!items.length) return <EmptyState msg="No global patient mappings found for this delivery person." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((mapping) => (
          <div key={mapping.id} className="rounded-2xl border border-blue-100 dark:border-blue-900/30 p-5 bg-white dark:bg-gray-800/40 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
               <FiUser size={48} />
            </div>
            
            <div className="flex items-center gap-3 mb-4">
               <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FiUser size={18} />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {mapping.patient_name}
                  </h4>
               </div>
            </div>

            <div className="space-y-4">
               <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Diet Plan Mapping</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                    {mapping.diet_plan_name || "Custom Plan"}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
                    <span>{fmtDate(mapping.start_date)}</span>
                    <span>→</span>
                    <span>{fmtDate(mapping.end_date)}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800/50">
                    <span className="text-gray-500">Primary Slot</span>
                    <span className="font-bold text-gray-900 dark:text-white">{mapping.default_slot_name || "—"}</span>
                  </div>
                  {mapping.delivery_slots_details && mapping.delivery_slots_details.length > 0 && (
                     <div className="space-y-1 py-1.5">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block">Authorized Slots</span>
                        <div className="flex flex-wrap gap-1.5">
                          {mapping.delivery_slots_details.map(s => (
                            <span key={s.id} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                              {s.name}
                            </span>
                          ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Leaves view ──────────────────────────────────────────────────────────────
// ─── Leaves view ──────────────────────────────────────────────────────────────
function LeavesView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DeliveryPersonLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonLeaves(profileId, 1, 10).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonLeaves(profileId, nextPage, 10).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading leaves…</div>;
  if (!items.length) return <EmptyState msg="No planned leave records found for this delivery person." />;

  const handlingColor = (s: string | null | undefined) =>
    s === "complete" ? "bg-emerald-100 text-emerald-700" :
    s === "in_progress" ? "bg-blue-100 text-blue-700" :
    "bg-gray-100 text-gray-500";

  return (
    <div className="space-y-3">
      {items.map((lv) => (
        <div key={lv.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white dark:bg-gray-800/30 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                  {lv.leave_type?.replace(/_/g, " ")} Leave
                </span>
                {lv.kitchen_handling_status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${handlingColor(lv.kitchen_handling_status)}`}>
                    {lv.kitchen_handling_status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                📅 {fmtDate(lv.start_date)} → {fmtDate(lv.end_date)}
                {lv.leave_type === "partial" && lv.start_time && (
                  <> &nbsp;⏰ {lv.start_time} – {lv.end_time || "?"}</>
                )}
              </div>
              {lv.notes && (
                <div className="text-xs text-gray-500 italic">"{lv.notes}"</div>
              )}
            </div>
            <div className="text-xs text-gray-400 tabular-nums">#{lv.id}</div>
          </div>
        </div>
      ))}
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Reviews view ─────────────────────────────────────────────────────────────
// ─── Reviews view ─────────────────────────────────────────────────────────────
function ReviewsView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DeliveryPersonReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonReviews(profileId, 1, 10).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonReviews(profileId, nextPage, 10).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading reviews…</div>;
  if (!items.length) return <EmptyState msg="No delivery ratings or reviews found yet." />;

  const starColor = (r: number) => r >= 4 ? "text-emerald-500" : r >= 3 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] p-5 bg-white dark:bg-gray-800/30 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {r.reported_by_name || "Customer"}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{fmtDate(r.created_at)}</div>
            </div>
            {r.rating != null && (
              <div className={`flex items-center gap-1 text-xl font-black ${starColor(r.rating)}`}>
                {r.rating} <FiStar size={18} />
              </div>
            )}
          </div>
          {r.review && (
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "{r.review}"
            </p>
          )}
          {(r.order_id || r.user_meal_id) && (
            <div className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {r.order_id ? `Order #${r.order_id}` : ""}
              {r.user_meal_id ? `Meal Assignment #${r.user_meal_id}` : ""}
            </div>
          )}
        </div>
      ))}
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Issues view ──────────────────────────────────────────────────────────────
// ─── Issues view ──────────────────────────────────────────────────────────────
function IssuesView({ profileId }: { profileId: number }) {
  const [items, setItems] = useState<DeliveryPersonReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeliveryPersonIssues(profileId, 1, 10).then((res) => {
      setItems(res.results);
      setHasMore(res.current_page < res.total_pages);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profileId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchDeliveryPersonIssues(profileId, nextPage, 10).then((res) => {
      setItems(prev => [...prev, ...res.results]);
      setHasMore(res.current_page < res.total_pages);
      setPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Loading issues…</div>;
  if (!items.length) return <EmptyState msg="No delivery issues reported for this person. 🎉" />;

  return (
    <div className="space-y-3">
      {items.map((issue) => (
        <div key={issue.id} className="rounded-2xl border border-rose-100 dark:border-rose-900/30 p-5 bg-rose-50/30 dark:bg-rose-900/10 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="text-rose-500" size={14} />
                <span className="font-bold text-rose-800 dark:text-rose-300 text-sm capitalize">
                  {issue.issue_type?.replace(/_/g, " ") || "Issue"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                By: {issue.reported_by_name || "Customer"}
                &nbsp;· {fmtDate(issue.created_at)}
              </div>
            </div>
            <span className="text-[10px] font-black text-rose-400 uppercase">#{issue.id}</span>
          </div>
          {issue.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-white/50 dark:bg-white/5 rounded-xl px-3 py-2">
              "{issue.description}"
            </p>
          )}
          {(issue.order_id || issue.user_meal_id) && (
            <div className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {issue.order_id ? `Order #${issue.order_id}` : ""}
              {issue.user_meal_id ? `Meal Assignment #${issue.user_meal_id}` : ""}
            </div>
          )}
        </div>
      ))}
      <LoadMoreBtn hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

type Props = {
  profile: KitchenDeliveryProfile;
  open: boolean;
  onClose: () => void;
};

export function DeliveryProfileDetailModal({ profile, open, onClose }: Props) {
  const [screen, setScreen] = useState<"hub" | ViewKey>("hub");

  useEffect(() => {
    if (open) setScreen("hub");
  }, [open, profile.id]);

  if (!open) return null;

  const userId = profile.user_details?.id ?? profile.user ?? null;
  const name = personName(profile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-blue-100 dark:border-gray-800 my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <header className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-blue-50/50 dark:border-gray-800 px-6 py-5 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:to-blue-950/20">
          <div className="min-w-0">
            {screen !== "hub" && (
              <button
                type="button"
                onClick={() => setScreen("hub")}
                className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
              >
                <FiArrowLeft className="w-3 h-3" />
                Back to menu
              </button>
            )}
            <h2 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate">
              {screen === "hub" ? "Delivery staff detail hub" : VIEW_TITLES[screen]}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {name}
              {profile.user_details?.mobile && (
                <> · <span className="font-mono text-xs">{profile.user_details.mobile}</span></>
              )}
              {profile.is_verified && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <FiCheckCircle size={12} /> Verified
                </span>
              )}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-blue-50/20 to-white dark:from-gray-900 dark:to-gray-950">
          {screen === "hub" && (
            <div className="space-y-8 pb-10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
                  Delivery staff detail views
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Select a section to view details for <strong>{name}</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {MENU_ITEMS.map((item) => {
                    const clr = colorMap[item.color] ?? "";
                    const [bgIcon] = clr.split(" bg-");
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setScreen(item.key)}
                        className={`group text-left rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl transition-all bg-white dark:bg-gray-900/50 relative overflow-hidden hover:border-opacity-60 ${clr.includes("hover:border") ? clr.split(" hover:border")[0] : ""}`}
                        style={{}}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-current">
                          {React.cloneElement(item.icon as React.ReactElement<any>, { size: 56 })}
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                          item.color === "blue" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                          item.color === "violet" ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" :
                          item.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                          item.color === "indigo" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" :
                          item.color === "amber" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                          item.color === "yellow" ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                          "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                        }`}>
                          {item.icon}
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white text-base">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-1.5 leading-relaxed italic">{item.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {screen !== "hub" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {screen === "profile" && <ProfileView row={profile} />}
              {screen === "global_assignments" && <GlobalAssignmentsView profileId={profile.id} />}
              {screen === "orders" && <OrdersView profileId={profile.id} />}
              {screen === "payments" && <PaymentsView profileId={profile.id} />}
              {screen === "meal_assignments" && <MealAssignmentsView profileId={profile.id} />}
              {screen === "reassignments" && <ReassignmentsHistoryView profileId={profile.id} />}
              {screen === "leaves" && <LeavesView profileId={profile.id} />}
              {screen === "reviews" && <ReviewsView profileId={profile.id} />}
              {screen === "issues" && <IssuesView profileId={profile.id} />}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}


