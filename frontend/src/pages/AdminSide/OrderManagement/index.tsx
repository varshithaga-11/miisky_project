import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiEye, FiDownload } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { getAllOrders, getMicroKitchens, getOrderById, OrderListDatePeriod } from "./api";
import OrderDetailModal from "./OrderDetailModal";

const fmtRs = (s: string | undefined) => {
  const n = Number(s);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toFixed(2)}`;
};

const PERIOD_OPTIONS: { value: OrderListDatePeriod; label: string }[] = [
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

interface OrderRow {
  id: number;
  order_id: string;
  patient_name: string;
  kitchen_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const OrderManagementPage: React.FC = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [kitchens, setKitchens] = useState<{ id: number; brand_name: string }[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [billingMonth, setBillingMonth] = useState("");
  const [period, setPeriod] = useState<OrderListDatePeriod>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [orderSummary, setOrderSummary] = useState<{
    total_orders?: number;
    total_amount?: string;
    total_kitchen_amount?: string;
    total_platform_amount?: string;
  }>({});

  const dateFilterOptions = useMemo(() => {
    if (billingMonth.trim()) return { billing_month: billingMonth.trim() };
    if (period === "custom_range") {
      return { period, start_date: customStart, end_date: customEnd };
    }
    if (period !== "all") return { period };
    return undefined;
  }, [billingMonth, period, customStart, customEnd]);

  useEffect(() => {
    const fetchKitchens = async () => {
      try {
        const res = await getMicroKitchens();
        setKitchens(res.results || []);
      } catch (err) {
        console.error("Failed to load kitchens", err);
      }
    };
    fetchKitchens();
  }, []);

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
      case 'active': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
      case 'pending': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
      case 'completed': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
    }
  };

  const handleViewDetails = async (id: number) => {
    setModalLoading(true);
    try {
      const data = await getOrderById(id);
      setSelectedOrder(data);
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
      // Fetch with a high limit to export all matching records based on current filters
      const res = await getAllOrders(1, 10000, searchTerm, selectedKitchen, dateFilterOptions);
      const allRows = res.results || [];
      
      if (allRows.length === 0) {
        return;
      }

      const headers = ["Order ID", "Patient Name", "Kitchen", "Amount", "Status", "Date"];
      const csvRows = allRows.map((r: any) => [
        `"${r.order_id || `#ORD-${r.id}`}"`,
        `"${r.patient_name}"`,
        `"${r.kitchen_name || "—"}"`,
        r.amount,
        `"${r.status}"`,
        `"${new Date(r.created_at).toLocaleString()}"`
      ].join(","));

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `miisky_orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Orders Management" description="Oversight of all patient and non-patient orders" />
      <PageBreadcrumb pageTitle="Orders Management" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm transition-all duration-300">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search Order ID, Patient, Kitchen..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                />
                <FiSearch className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              </div>

              <div className="flex-1 max-w-xs">
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">
                    Total Orders: {orderSummary.total_orders ?? totalItems}
                  </span>
                  <span>
                    Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm dark:text-gray-400 whitespace-nowrap font-medium">Show:</Label>
                  <Select
                    value={String(pageSize)}
                    onChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "10", label: "10" },
                      { value: "25", label: "25" },
                      { value: "50", label: "50" },
                    ]}
                    className="w-24 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  disabled={loading || rows.length === 0}
                  className="flex items-center gap-2 rounded-xl py-2.5 px-4 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  <FiDownload /> Export
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/40 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Calendar month</Label>
              <input
                type="month"
                value={billingMonth}
                onChange={(e) => {
                  setBillingMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">If set, overrides period (filters by order date).</p>
            </div>
            <div className="md:col-span-1 lg:col-span-2">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Period</Label>
              <Select
                value={period}
                onChange={(val) => {
                  setPeriod(val as OrderListDatePeriod);
                  setCurrentPage(1);
                }}
                options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="mt-1 w-full"
              />
            </div>
            {period === "custom_range" && (
              <div className="flex flex-wrap items-end gap-2 md:col-span-2 lg:col-span-2">
                <div>
                  <Label className="text-xs text-gray-500">From</Label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => {
                      setCustomStart(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">To</Label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => {
                      setCustomEnd(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mt-1 rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50">
              <p className="text-[10px] font-semibold uppercase text-gray-500">Orders (filter)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{orderSummary.total_orders ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <p className="text-[10px] font-semibold uppercase text-emerald-800 dark:text-emerald-300">Total amount</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">{fmtRs(orderSummary.total_amount)}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-950/30">
              <p className="text-[10px] font-semibold uppercase text-blue-800 dark:text-blue-300">Platform</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{fmtRs(orderSummary.total_platform_amount)}</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50/80 px-3 py-2 dark:border-orange-900/40 dark:bg-orange-950/30">
              <p className="text-[10px] font-semibold uppercase text-orange-800 dark:text-orange-300">Kitchen</p>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{fmtRs(orderSummary.total_kitchen_amount)}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Order Details</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Kitchen</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                          <span>Loading orders...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <span className="text-4xl">📦</span>
                          <span>No orders found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, index) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors">
                        <TableCell className="px-6 py-5">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900 dark:text-white">{r.order_id || `#ORD-${r.id}`}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{r.patient_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.kitchen_name || "—"}</span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">₹{r.amount}</span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(r.status)}`}>
                            {r.status || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-right">
                          <button 
                            onClick={() => handleViewDetails(r.id)}
                            className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-bold opacity-80 hover:opacity-100 transition-all"
                          >
                            <FiEye className="w-4 h-4" /> Details
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
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Page <span className="text-gray-900 dark:text-white font-bold">{currentPage}</span> of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl px-4 py-2 shadow-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl px-4 py-2 shadow-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <OrderDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
      />
    </>
  );
};

export default OrderManagementPage;
