import { useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch, FiEye, FiDownload } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";
import { getAllOrders, getMicroKitchens, getOrderById, OrderListDatePeriod } from "./api";
import OrderDetailModal from "./OrderDetailModal";

const fmtRs = (s: string | undefined) => {
  const n = Number(s);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toFixed(2)}`;
};

const PERIOD_OPTIONS: { value: OrderListDatePeriod; label: string }[] = [
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

interface OrderRow {
  id: number;
  order_id: string;
  patient_name: string;
  kitchen_name: string;
  amount: number;
  delivery_charge: number;
  status: string;
  created_at: string;
}

const OrderManagementPage: React.FC = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [kitchens, setKitchens] = useState<{ id: number; brand_name: string }[]>([]);
  const [kitchensLoaded, setKitchensLoaded] = useState(false);
  const [kitchensLoading, setKitchensLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [period, setPeriod] = useState<OrderListDatePeriod>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [orderSummary, setOrderSummary] = useState<{
    total_orders?: number;
    total_amount?: string;
    total_delivery_charge?: string;
    total_kitchen_amount?: string;
    total_platform_amount?: string;
  }>({});

  const dateFilterOptions = useMemo(() => {
    if (period === "custom_range") {
      return { period, start_date: customStart, end_date: customEnd };
    }
    return { period };
  }, [period, customStart, customEnd]);

  const loadKitchensOnDemand = useCallback(async () => {
    if (kitchensLoaded || kitchensLoading) return;
    setKitchensLoading(true);
    try {
      const res = await getMicroKitchens();
      setKitchens(res.results || []);
      setKitchensLoaded(true);
    } catch (err) {
      console.error("Failed to load kitchens", err);
    } finally {
      setKitchensLoading(false);
    }
  }, [kitchensLoaded, kitchensLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllOrders(currentPage, pageSize, searchTerm, selectedKitchen, dateFilterOptions);
        setRows((res.results || []) as OrderRow[]);
        setTotalItems(res.count || 0);
        setTotalPages(res.total_pages || 0);
        setOrderSummary({
          total_orders: res.total_orders,
          total_amount: res.total_amount,
          total_delivery_charge: res.total_delivery_charge,
          total_kitchen_amount: res.total_kitchen_amount,
          total_platform_amount: res.total_platform_amount,
        });
      } catch (e) {
        console.error(e);
        setRows([]);
        setTotalItems(0);
        setTotalPages(0);
        setOrderSummary({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, pageSize, searchTerm, selectedKitchen, dateFilterOptions]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30";
      case "pending":
        return "bg-amber-50 text-amber-600 dark:bg-amber-900/30";
      case "completed":
        return "bg-blue-50 text-blue-600 dark:bg-blue-900/30";
      default:
        return "bg-gray-50 text-gray-600 dark:bg-gray-500/10";
    }
  };

  const handleViewDetails = async (row: OrderRow) => {
    setModalLoading(true);
    try {
      const match = (row.order_id || "").match(/\d+/g);
      const numericFromOrderId = match ? Number(match.join("")) : NaN;
      const lookupId = Number.isFinite(numericFromOrderId) && numericFromOrderId > 0 ? numericFromOrderId : row.id;
      const data = await getOrderById(lookupId);
      setSelectedOrder({
        ...data,
        order_id: row.order_id || data?.order_id,
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch order details", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders(1, 10000, searchTerm, selectedKitchen, dateFilterOptions);
      const allRows = res.results || [];

      if (allRows.length === 0) {
        return;
      }

      const headers = ["Order ID", "Patient Name", "Kitchen", "Amount", "Delivery charge", "Status", "Date"];
      const csvRows = allRows.map((r: any) =>
        [
          `"${r.order_id || `#ORD-${r.id}`}"`,
          `"${r.patient_name}"`,
          `"${r.kitchen_name || "—"}"`,
          r.amount,
          r.delivery_charge ?? 0,
          `"${r.status}"`,
          `"${new Date(r.created_at).toLocaleString()}"`,
        ].join(",")
      );

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `miisky_orders_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && rows.length === 0) {
    return <div className="text-black dark:text-white p-6">Loading orders...</div>;
  }

  return (
    <>
      <PageMeta title="Orders Management" description="Oversight of all patient and non-patient orders" />
      <PageBreadcrumb pageTitle="Orders Management" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID, Patient, Kitchen..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
            <div className="w-full sm:w-56">
              <Select
                value={selectedKitchen}
                onChange={(val) => {
                  setSelectedKitchen(val);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "", label: "All Micro-Kitchens" },
                  ...kitchens.map((k) => ({
                    value: String(k.id),
                    label: k.brand_name || `Kitchen #${k.id}`,
                  })),
                ]}
                onFocus={() => {
                  void loadKitchensOnDemand();
                }}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={period}
                onChange={(val) => {
                  setPeriod(val as OrderListDatePeriod);
                  setCurrentPage(1);
                }}
                options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 xl:ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={loading || rows.length === 0}
              className="inline-flex items-center gap-2"
            >
              <FiDownload /> Export
            </Button>
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                ]}
                className="w-20"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        {period === "custom_range" && (
          <div className="flex flex-col sm:flex-row gap-4 items-end flex-wrap">
            <div className="w-full sm:w-48">
              <DatePicker2
                id="order-mgmt-range-start"
                label="From"
                value={customStart}
                placeholder="Start date"
                maxDate={customEnd || undefined}
                onChange={(date) => {
                  setCustomStart(date);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <DatePicker2
                id="order-mgmt-range-end"
                label="To"
                value={customEnd}
                placeholder="End date"
                minDate={customStart || undefined}
                onChange={(date) => {
                  setCustomEnd(date);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            {searchTerm && ` (filtered from search)`}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Total orders (filter): <span className="font-medium text-gray-800 dark:text-white">{orderSummary.total_orders ?? totalItems}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Orders (filter)</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{orderSummary.total_orders ?? "—"}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <p className="text-[10px] font-semibold uppercase text-emerald-800 dark:text-emerald-300">Total amount</p>
          <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">{fmtRs(orderSummary.total_amount)}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-violet-200 bg-violet-50/80 px-3 py-2 dark:border-violet-900/40 dark:bg-violet-950/30">
          <p className="text-[10px] font-semibold uppercase text-violet-800 dark:text-violet-300">Delivery charges</p>
          <p className="text-lg font-bold text-violet-900 dark:text-violet-200">{fmtRs(orderSummary.total_delivery_charge)}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-950/30">
          <p className="text-[10px] font-semibold uppercase text-blue-800 dark:text-blue-300">Platform</p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{fmtRs(orderSummary.total_platform_amount)}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-orange-200 bg-orange-50/80 px-3 py-2 dark:border-orange-900/40 dark:bg-orange-950/30">
          <p className="text-[10px] font-semibold uppercase text-orange-800 dark:text-orange-300">Kitchen</p>
          <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{fmtRs(orderSummary.total_kitchen_amount)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  #
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Order details
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Kitchen
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Delivery
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, index) => (
                  <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                          {r.order_id || `#ORD-${r.id}`}
                        </span>
                        <span className="text-theme-xs text-gray-500 dark:text-gray-400">{r.patient_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium dark:bg-orange-900/30">
                        {r.kitchen_name || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      ₹{r.amount}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {fmtRs(String(r.delivery_charge ?? 0))}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                        {r.status || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(r)}
                        disabled={modalLoading}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium disabled:opacity-50"
                      >
                        <FiEye className="text-lg" /> Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      <OrderDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
    </>
  );
};

export default OrderManagementPage;
