import { FiTruck } from "react-icons/fi";

export type OrderBillLike = {
  total_amount?: number | string | null;
  delivery_charge?: number | string | null;
  delivery_distance_km?: number | string | null;
  final_amount?: number | string | null;
  delivery_slab_details?: { min_km?: string; max_km?: string; charge?: string } | null;
};

function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Food subtotal, delivery line (distance / slab), and final total for an order. */
export function OrderDeliverySummary({
  order,
  className = "",
  liveDistanceKm,
  liveDistanceLabel = "Straight-line distance (customer ↔ kitchen)",
  geoNote,
}: {
  order: OrderBillLike;
  className?: string;
  /** Haversine km from current profile / order party coordinates (for display vs. checkout snapshot). */
  liveDistanceKm?: number | null;
  liveDistanceLabel?: string;
  geoNote?: string | null;
}) {
  const subtotal = num(order.total_amount);
  const delivery = num(order.delivery_charge);
  let final =
    order.final_amount !== null && order.final_amount !== undefined && order.final_amount !== ""
      ? num(order.final_amount)
      : subtotal + delivery;
  // Legacy rows where final_amount was stored as 0 incorrectly
  if (subtotal > 0 && final <= 0) {
    final = subtotal + delivery;
  }
  const dist = order.delivery_distance_km;
  const distNum = dist !== null && dist !== undefined && dist !== "" ? num(dist) : null;
  const slab = order.delivery_slab_details;

  return (
    <div
      className={`rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.03] p-4 space-y-2 ${className}`}
    >
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <FiTruck className="text-indigo-500" size={12} /> Bill breakdown
      </p>
      {geoNote ? (
        <p className="text-[10px] text-amber-700 dark:text-amber-400/90 font-medium leading-snug">{geoNote}</p>
      ) : null}
      {liveDistanceKm != null && Number.isFinite(liveDistanceKm) && (
        <p className="text-[10px] text-gray-600 dark:text-gray-300">
          {liveDistanceLabel}:{" "}
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{liveDistanceKm.toFixed(2)} km</span>
          <span className="text-gray-400 dark:text-gray-500 font-normal"> (great-circle)</span>
        </p>
      )}
      <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
        <span>Food subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      {distNum !== null && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          Distance at checkout: <span className="font-mono font-bold">{distNum.toFixed(2)} km</span>
        </p>
      )}
      {slab && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          Slab: {slab.min_km}–{slab.max_km} km → ₹{slab.charge}
        </p>
      )}
      <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300">
        <span>Delivery charge</span>
        <span>₹{delivery.toFixed(2)}</span>
      </div>
      <div className="pt-2 border-t border-gray-200 dark:border-white/10 flex justify-between text-base font-black text-gray-900 dark:text-white">
        <span>Total</span>
        <span className="text-indigo-600 dark:text-indigo-400">₹{final.toFixed(2)}</span>
      </div>
    </div>
  );
}
