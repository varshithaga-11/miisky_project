import React, { useEffect, useState } from "react";
import {
  getMyOrders,
  updateOrderStatus,
  Order,
  OrderDatePeriod,
} from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import {
  FiPackage,
  FiLoader,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import { OrderDeliverySummary } from "../../../components/orders/OrderDeliverySummary";
import { coordsFromFields, distanceKmBetween } from "../../../components/orders/orderGeo";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";

/** Labels align with `get_period_range` in `backend/app/utils/date_utils.py`. */
const PERIOD_OPTIONS: { value: OrderDatePeriod; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "next_month", label: "Next month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "this_year", label: "This year" },
  { value: "custom_range", label: "Custom range" },
];

const SupplyChainSeperateOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<OrderDatePeriod>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const fetchOrders = async () => {
    if (period === "custom_range" && (!customStart || !customEnd)) {
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMyOrders(
        currentPage,
        pageSize,
        statusFilter,
        typeFilter,
        search,
        period,
        period === "custom_range" ? customStart : undefined,
        period === "custom_range" ? customEnd : undefined
      );
      setOrders(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders();
    }, search ? 500 : 0);
    return () => clearTimeout(timer);
  }, [currentPage, pageSize, statusFilter, typeFilter, search, period, customStart, customEnd]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, pageSize, search, period, customStart, customEnd]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      void fetchOrders();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "placed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "accepted":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      case "preparing":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "ready":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "picked_up":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getImageUrl = (path: string | undefined | null): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
  };

  const toggleRow = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta
        title="My delivery orders"
        description="Orders assigned to you as delivery person (paginated, with date filters)."
      />
      <PageBreadcrumb pageTitle="My delivery orders" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            My delivery orders
          </h1>
          <p className="text-gray-500 mt-1 font-medium max-w-2xl">
            Orders where you are the assigned delivery person. Filters use the same date ranges as the backend (
            <span className="font-mono text-xs">date_utils.get_period_range</span>).
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Customer name, address, order ID…"
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1 flex items-center gap-1">
              <FiCalendar size={12} /> Date range
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as OrderDatePeriod)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {period === "custom_range" && (
            <>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                />
              </div>
            </>
          )}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="picked_up">Picked Up</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Order type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
            >
              <option value="all">All Types</option>
              <option value="patient">Patient</option>
              <option value="non_patient">Non Patient</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Rows</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[40px]">
            <FiLoader className="animate-spin text-indigo-500 mb-4" size={40} />
            <p className="text-gray-400 font-bold text-sm">Loading orders…</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-900/40">
                    <TableCell isHeader className="px-6 py-4">
                      Order ID
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Customer
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Kitchen
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Type
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Amount
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Date
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 text-right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="px-6 py-16 text-center text-gray-500 font-medium">
                        No orders in this range. Try a different date filter or ask your kitchen to assign you on
                        orders.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <React.Fragment key={order.id}>
                        <TableRow
                          className={`hover:bg-gray-50/80 dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${
                            expandedOrderId === order.id ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                          }`}
                          onClick={() => toggleRow(order.id!)}
                        >
                          <TableCell className="px-6 py-4 font-black text-gray-900 dark:text-white">
                            #{order.id}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {order.user_details?.first_name} {order.user_details?.last_name}
                              </span>
                              <span className="text-xs text-gray-400">{order.user_details?.mobile}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {order.kitchen_details?.brand_name ?? "—"}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
                              {order.order_type?.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusStyles(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">
                            ₹{Number(order.final_amount ?? order.total_amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-xs text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => toggleRow(order.id!)}
                                className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 transition-all"
                              >
                                {expandedOrderId === order.id ? <FiChevronUp /> : <FiEye />}
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id!, e.target.value)}
                                disabled={
                                  updating === order.id || order.status === "cancelled" || order.status === "delivered"
                                }
                                className="text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-0 cursor-pointer disabled:opacity-50 h-8 max-w-[140px]"
                              >
                                <option value="placed">Placed</option>
                                <option value="accepted">Accepted</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </TableCell>
                        </TableRow>

                        <AnimatePresence>
                          {expandedOrderId === order.id && (
                            <TableRow className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
                              <TableCell colSpan={8} className="px-8 py-8">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                          <FiPackage size={14} className="text-indigo-500" /> Items
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {order.items?.map((item) => {
                                            const itemImageUrl = getImageUrl(item.food_details?.image);
                                            return (
                                              <div
                                                key={item.id}
                                                className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm"
                                              >
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                                                  {itemImageUrl ? (
                                                    <img
                                                      src={itemImageUrl}
                                                      className="w-full h-full object-cover"
                                                      alt=""
                                                    />
                                                  ) : null}
                                                </div>
                                                <div>
                                                  <p className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                                                    {item.food_details?.name}
                                                  </p>
                                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                    {item.quantity} × ₹{item.price}
                                                  </p>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm">
                                        <OrderDeliverySummary
                                          order={order}
                                          className="!p-0"
                                          liveDistanceKm={distanceKmBetween(
                                            coordsFromFields(order.user_details?.latitude, order.user_details?.longitude),
                                            coordsFromFields(order.kitchen_details?.latitude, order.kitchen_details?.longitude)
                                          )}
                                          liveDistanceLabel="Straight-line distance (Kitchen to customer)"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FiMapPin size={14} className="text-indigo-500" /> Delivery address
                                      </h4>
                                      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                                          {order.delivery_address}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-gray-400 font-bold">
                Showing{" "}
                <span className="text-gray-900 dark:text-white">
                  {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="text-gray-900 dark:text-white">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of <span className="text-gray-900 dark:text-white">{totalItems}</span> orders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="!rounded-xl h-10 px-4"
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-500 px-2">
                  Page {currentPage} / {Math.max(1, totalPages)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="!rounded-xl h-10 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyChainSeperateOrdersPage;
