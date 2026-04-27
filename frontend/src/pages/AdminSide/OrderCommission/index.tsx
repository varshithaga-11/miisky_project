import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Select from "../../../components/form/Select";
import SearchableSelect from "../../../components/form/SearchableSelect";
import Label from "../../../components/form/Label";
import DatePicker2 from "../../../components/form/date-picker2";
import { getMicroKitchens } from "../OrderManagement/api";
import {
  createOrderCommissionConfig,
  getOrderCommissionConfigs,
  getOrderPaymentSnapshots,
  OrderCommissionConfig,
  OrderPaymentSnapshot,
  SnapshotDatePeriod,
  updateOrderCommissionConfig,
} from "./api";

const toNumber = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtRs = (s: string | undefined) => {
  const n = Number(s);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toFixed(2)}`;
};

const PERIOD_OPTIONS: { value: SnapshotDatePeriod; label: string }[] = [
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

export default function OrderCommissionPage() {
  const [configs, setConfigs] = useState<OrderCommissionConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [message, setMessage] = useState("");

  const [platformPercent, setPlatformPercent] = useState("20.00");
  const [kitchenPercent, setKitchenPercent] = useState("80.00");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [snapshots, setSnapshots] = useState<OrderPaymentSnapshot[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotPage, setSnapshotPage] = useState(1);
  const [snapshotTotalPages, setSnapshotTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [period, setPeriod] = useState<SnapshotDatePeriod>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [snapshotSummary, setSnapshotSummary] = useState<{
    total_orders?: number;
    total_food_subtotal?: string;
    total_delivery_charge?: string;
    total_grand_total?: string;
    total_amount?: string;
    total_platform_amount?: string;
    total_kitchen_amount?: string;
  }>({});

  const activeConfig = useMemo(
    () => configs.find((c) => c.is_active) ?? configs[0] ?? null,
    [configs]
  );

  const totalPercent = useMemo(
    () => toNumber(platformPercent) + toNumber(kitchenPercent),
    [platformPercent, kitchenPercent]
  );

  const loadConfigs = async () => {
    setLoadingConfig(true);
    try {
      const data = await getOrderCommissionConfigs();
      setConfigs(data || []);
    } catch {
      setMessage("Failed to load commission config.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadKitchens = async () => {
    try {
      const res = await getMicroKitchens();
      setKitchens(res.results || []);
    } catch (err) {
      console.error("Failed to load kitchens", err);
    }
  };

  const snapshotDateOptions = useMemo(() => {
    if (period === "custom_range") {
      return { period, start_date: customStart, end_date: customEnd, kitchen: selectedKitchen };
    }
    return { period, kitchen: selectedKitchen };
  }, [period, customStart, customEnd, selectedKitchen]);

  const loadSnapshots = useCallback(
    async (page = 1, size = pageSize, search = searchTerm) => {
      setSnapshotLoading(true);
      try {
        const data = await getOrderPaymentSnapshots(page, size, search, snapshotDateOptions);
        setSnapshots(data.results || []);
        setSnapshotTotalPages(data.total_pages || 1);
        setTotalItems(data.count || 0);
        setSnapshotPage(page);
        setSnapshotSummary({
          total_orders: data.total_orders,
          total_food_subtotal: data.total_food_subtotal,
          total_delivery_charge: data.total_delivery_charge,
          total_grand_total: data.total_grand_total,
          total_amount: data.total_amount,
          total_platform_amount: data.total_platform_amount,
          total_kitchen_amount: data.total_kitchen_amount,
        });
      } catch {
        setSnapshots([]);
        setSnapshotSummary({});
      } finally {
        setSnapshotLoading(false);
      }
    },
    [snapshotDateOptions, pageSize, searchTerm]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setSnapshotPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  useEffect(() => {
    void loadConfigs();
    void loadKitchens();
  }, []);

  useEffect(() => {
    void loadSnapshots(snapshotPage, pageSize, searchTerm);
  }, [snapshotPage, pageSize, searchTerm, loadSnapshots]);

  useEffect(() => {
    if (!activeConfig) return;
    setPlatformPercent(String(activeConfig.platform_commission_percent));
    setKitchenPercent(String(activeConfig.kitchen_commission_percent));
    setNotes(activeConfig.notes || "");
    setIsActive(Boolean(activeConfig.is_active));
  }, [activeConfig]);

  const onSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (Number(totalPercent.toFixed(2)) !== 100) {
      setMessage("Platform % + Kitchen % must be exactly 100.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platform_commission_percent: platformPercent,
        kitchen_commission_percent: kitchenPercent,
        notes: notes || null,
        is_active: isActive,
      };

      if (activeConfig?.id) {
        await updateOrderCommissionConfig(activeConfig.id, payload);
      } else {
        await createOrderCommissionConfig(payload);
      }

      setMessage("Commission config saved.");
      await loadConfigs();
    } catch {
      setMessage("Failed to save commission config.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Order Commission" description="Order commission setup and payment snapshots" />
      <PageBreadcrumb pageTitle="Order Commission" />

      <div className="space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Global Commission Config</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Zomato-style order split: platform % + kitchen % = 100. Delivery charge is pass-through.
          </p>

          <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSaveConfig}>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Platform %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={platformPercent}
                onChange={(e) => setPlatformPercent(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Kitchen %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={kitchenPercent}
                onChange={(e) => setKitchenPercent(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Optional notes for this config"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active config
              </label>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${Number(totalPercent.toFixed(2)) === 100 ? "text-green-600" : "text-red-600"}`}
                >
                  Total: {totalPercent.toFixed(2)}%
                </span>
                <Button size="sm" disabled={saving || loadingConfig} type="submit">
                  {saving ? "Saving..." : "Save config"}
                </Button>
              </div>
            </div>
          </form>

          {message && <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{message}</p>}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Order Payment Snapshots</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Frozen split per order at creation time. Past orders remain unchanged even if config changes later.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap text-sm dark:text-gray-400">Show:</Label>
                <Select
                  value={String(pageSize)}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setSnapshotPage(1);
                  }}
                  options={[
                    { value: "5", label: "5" },
                    { value: "10", label: "10" },
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                  ]}
                  className="w-20"
                />
                <span className="whitespace-nowrap text-sm text-gray-600">entries</span>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/[0.08] dark:bg-gray-900/40 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Micro-Kitchen</Label>
              <SearchableSelect
                value={selectedKitchen}
                onChange={(val) => {
                  setSelectedKitchen(val as string);
                  setSnapshotPage(1);
                }}
                options={[
                  { value: "", label: "All Micro-Kitchens" },
                  ...kitchens.map((k) => ({
                    value: String(k.id),
                    label: k.brand_name || `Kitchen #${k.id}`,
                  })),
                ]}
                className="mt-1 w-full"
                placeholder="Select Micro-Kitchen"
              />
            </div>
            <div className="md:col-span-1 lg:col-span-2">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Period (same as order reports)</Label>
              <Select
                value={period}
                onChange={(val) => {
                  setPeriod(val as SnapshotDatePeriod);
                  setSnapshotPage(1);
                }}
                options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="mt-1 w-full"
              />
            </div>
            {period === "custom_range" && (
              <div className="flex flex-wrap items-end gap-4 md:col-span-2 lg:col-span-2">
                <div className="w-full sm:w-48">
                  <DatePicker2
                    id="snapshot-custom-start"
                    label="From"
                    value={customStart}
                    placeholder="Start date"
                    maxDate={customEnd || undefined}
                    onChange={(date) => {
                      setCustomStart(date);
                      setSnapshotPage(1);
                    }}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <DatePicker2
                    id="snapshot-custom-end"
                    label="To"
                    value={customEnd}
                    placeholder="End date"
                    minDate={customStart || undefined}
                    onChange={(date) => {
                      setCustomEnd(date);
                      setSnapshotPage(1);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-white/[0.08] dark:bg-gray-900/50">
              <p className="text-[10px] font-semibold uppercase text-gray-500">Orders (filter)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{snapshotSummary.total_orders ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-white/[0.08] dark:bg-gray-900/50">
              <p className="text-[10px] font-semibold uppercase text-gray-500">Food subtotal</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{fmtRs(snapshotSummary.total_food_subtotal)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-white/[0.08] dark:bg-gray-900/50">
              <p className="text-[10px] font-semibold uppercase text-gray-500">Delivery</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{fmtRs(snapshotSummary.total_delivery_charge)}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <p className="text-[10px] font-semibold uppercase text-emerald-800 dark:text-emerald-300">Total amount</p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                {fmtRs(snapshotSummary.total_amount ?? snapshotSummary.total_grand_total)}
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-950/30">
              <p className="text-[10px] font-semibold uppercase text-blue-800 dark:text-blue-300">Platform</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{fmtRs(snapshotSummary.total_platform_amount)}</p>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50/80 px-3 py-2 dark:border-orange-900/40 dark:bg-orange-950/30">
              <p className="text-[10px] font-semibold uppercase text-orange-800 dark:text-orange-300">Kitchen</p>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{fmtRs(snapshotSummary.total_kitchen_amount)}</p>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {totalItems === 0 ? 0 : (snapshotPage - 1) * pageSize + 1} to{" "}
            {Math.min(snapshotPage * pageSize, totalItems)} of {totalItems} entries
            {searchTerm && ` (filtered from search)`}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Order</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Customer</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Food Subtotal</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Delivery</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Grand Total</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Platform</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Kitchen</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {snapshotLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                        Loading snapshots...
                      </TableCell>
                    </TableRow>
                  ) : snapshots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                        No snapshots found
                      </TableCell>
                    </TableRow>
                  ) : (
                    snapshots.map((row, idx) => (
                      <TableRow key={row.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/20">
                        <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {(snapshotPage - 1) * pageSize + idx + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm font-bold text-gray-800 dark:text-white/90">
                          #{row.order_id ?? row.order}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                          {row.customer_display || "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">Rs {row.food_subtotal}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">Rs {row.delivery_charge}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm font-bold text-gray-800 dark:text-white/90">Rs {row.grand_total}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30">
                            Rs {row.platform_amount} ({row.platform_percent}%)
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-900/30">
                            Rs {row.kitchen_amount} ({row.kitchen_percent}%)
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {snapshotTotalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSnapshotPage(Math.max(1, snapshotPage - 1))}
                  disabled={snapshotPage === 1 || snapshotLoading}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: snapshotTotalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setSnapshotPage(pageNum)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        snapshotPage === pageNum
                          ? "border border-blue-600 bg-blue-600 text-white"
                          : "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSnapshotPage(Math.min(snapshotTotalPages, snapshotPage + 1))}
                  disabled={snapshotPage === snapshotTotalPages || snapshotLoading}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {snapshotPage} of {snapshotTotalPages}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
