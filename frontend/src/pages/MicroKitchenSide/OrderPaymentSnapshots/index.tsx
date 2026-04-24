import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getMicroKitchenOrderPaymentSnapshots,
  OrderPaymentSnapshotRow,
} from "./api";
import { FilterBar } from "../../../components/common";
import { fetchSupplyChainUsers, SupplyChainUser } from "../DeliveryManagement/api";
import { FiSearch, FiDollarSign, FiFilter, FiTruck } from "react-icons/fi";

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

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [period, setPeriod] = useState("all");
  const [deliveryPerson, setDeliveryPerson] = useState("all");
  const [orderType, setOrderType] = useState("all");
  const [teamUsers, setTeamUsers] = useState<SupplyChainUser[]>([]);

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

  const loadTeam = async () => {
    if (teamUsers.length > 0) return;
    try {
      const users = await fetchSupplyChainUsers();
      setTeamUsers(users);
    } catch (e) {
      console.error("Failed to load team users", e);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMicroKitchenOrderPaymentSnapshots(
          page, 
          pageSize, 
          debouncedSearch,
          period,
          startDate,
          endDate,
          deliveryPerson,
          orderType
        );
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
  }, [page, pageSize, debouncedSearch, period, startDate, endDate, deliveryPerson, orderType]);

  return (
    <>
      <PageMeta title="Order payments" description="Frozen platform vs kitchen split per customer order" />
      <PageBreadcrumb pageTitle="Order payments" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-10">

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

        <div className="mb-6 space-y-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Search Order ID / Customer</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-sm"
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => {setOrderType(e.target.value); setPage(1);}}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-sm"
              >
                <option value="all">All Types</option>
                <option value="patient">Patient</option>
                <option value="non_patient">Non-Patient</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Logistics Partner</label>
              <select
                value={deliveryPerson}
                onFocus={loadTeam}
                onChange={(e) => {setDeliveryPerson(e.target.value); setPage(1);}}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-sm"
              >
                <option value="all">All Partners</option>
                {teamUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium">
              <label className="text-gray-500 dark:text-gray-400">Per page:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-sm"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FilterBar
            startDate={startDate}
            endDate={endDate}
            activePeriod={period}
            onPeriodChange={(p) => {setPeriod(p); setPage(1);}}
            onFilterChange={(s, e, p) => {
              setStartDate(s);
              setEndDate(e);
              setPeriod(p);
              setPage(1);
            }}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Order</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Customer</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Type</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Food subtotal</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Delivery</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Grand total</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Kitchen</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Platform</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Date</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-gray-400 italic">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, i) => (
                    <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <TableCell className="px-5 py-4 text-gray-500">{(page - 1) * pageSize + i + 1}</TableCell>
                      <TableCell className="px-5 py-4 font-mono font-medium">#{r.order_id}</TableCell>
                      <TableCell className="px-5 py-4">{r.customer_display || "—"}</TableCell>
                      <TableCell className="px-5 py-4 capitalize">{r.order_type?.replace("_", " ") ?? "—"}</TableCell>
                      <TableCell className="px-5 py-4 capitalize">{r.order_status ?? "—"}</TableCell>
                      <TableCell className="px-5 py-4">{fmtMoney(r.food_subtotal)}</TableCell>
                      <TableCell className="px-5 py-4">{fmtMoney(r.delivery_charge)}</TableCell>
                      <TableCell className="px-5 py-4 font-semibold">{fmtMoney(r.grand_total)}</TableCell>
                      <TableCell className="px-5 py-4 text-emerald-700 dark:text-emerald-400 font-medium">
                        {fmtMoney(r.kitchen_amount)}{" "}
                        <span className="text-gray-400 text-xs">({r.kitchen_percent}%)</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 font-medium">
                        {fmtMoney(r.platform_amount)}{" "}
                        <span className="text-gray-400 text-xs">({r.platform_percent}%)</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 px-2">
            <p className="text-sm text-gray-500">
              Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium disabled:opacity-40 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
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
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium disabled:opacity-40 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderPaymentSnapshotsPage;
