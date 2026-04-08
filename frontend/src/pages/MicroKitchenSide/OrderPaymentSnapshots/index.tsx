import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { FiSearch, FiDollarSign } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import {
  getMicroKitchenOrderPaymentSnapshots,
  OrderPaymentSnapshotRow,
} from "./api";

const fmtMoney = (s: string | undefined) => {
  const n = Number(s);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toFixed(2)}`;
};

const OrderPaymentSnapshotsPage: React.FC = () => {
  const [rows, setRows] = useState<OrderPaymentSnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [summaryKitchen, setSummaryKitchen] = useState<string | undefined>();
  const [summaryPlatform, setSummaryPlatform] = useState<string | undefined>();
  const [summaryOrders, setSummaryOrders] = useState<number | undefined>();

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, searchInput ? 400 : 0);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMicroKitchenOrderPaymentSnapshots(page, pageSize, debouncedSearch);
        if (cancelled) return;
        setRows(data.results ?? []);
        setTotalPages(data.total_pages ?? 1);
        setTotalCount(data.count ?? 0);
        setSummaryKitchen(data.total_kitchen_amount);
        setSummaryPlatform(data.total_platform_amount);
        setSummaryOrders(data.total_orders);
      } catch {
        if (!cancelled) {
          toast.error("Failed to load order payments");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Order payments" description="Frozen platform vs kitchen split per customer order" />
      <PageBreadcrumb pageTitle="Order payments" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Separate order payments
          </h1>
          <p className="text-gray-500 mt-1 font-medium max-w-2xl">
            Each row is a frozen snapshot when the order was placed: food subtotal split between platform and your
            kitchen. Delivery charge is shown for reference only (pass-through, not split).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Orders (filtered)</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-1">
              <FiDollarSign className="text-emerald-500" />
              {summaryOrders ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Your share (kitchen)</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {fmtMoney(summaryKitchen)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Platform share</p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
              {fmtMoney(summaryPlatform)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[240px]">
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">
              Search order ID or customer name
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Order # or name…"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Per page</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-sm"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell isHeader>#</TableCell>
                  <TableCell isHeader>Order</TableCell>
                  <TableCell isHeader>Customer</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Food subtotal</TableCell>
                  <TableCell isHeader>Delivery</TableCell>
                  <TableCell isHeader>Grand total</TableCell>
                  <TableCell isHeader>Kitchen</TableCell>
                  <TableCell isHeader>Platform</TableCell>
                  <TableCell isHeader>Date</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-gray-500 py-12">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-gray-500 py-12">
                      No payment snapshots yet. Snapshots appear when customer orders are placed (and commission config
                      exists).
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-gray-500">{(page - 1) * pageSize + i + 1}</TableCell>
                      <TableCell className="font-mono font-bold">#{r.order_id}</TableCell>
                      <TableCell>{r.customer_display || "—"}</TableCell>
                      <TableCell className="capitalize">{r.order_type?.replace("_", " ") ?? "—"}</TableCell>
                      <TableCell className="capitalize">{r.order_status ?? "—"}</TableCell>
                      <TableCell>{fmtMoney(r.food_subtotal)}</TableCell>
                      <TableCell>{fmtMoney(r.delivery_charge)}</TableCell>
                      <TableCell className="font-semibold">{fmtMoney(r.grand_total)}</TableCell>
                      <TableCell className="text-emerald-700 dark:text-emerald-400">
                        {fmtMoney(r.kitchen_amount)}{" "}
                        <span className="text-gray-400 text-xs">({r.kitchen_percent}%)</span>
                      </TableCell>
                      <TableCell>
                        {fmtMoney(r.platform_amount)}{" "}
                        <span className="text-gray-400 text-xs">({r.platform_percent}%)</span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {r.order_created_at
                          ? new Date(r.order_created_at).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPaymentSnapshotsPage;
