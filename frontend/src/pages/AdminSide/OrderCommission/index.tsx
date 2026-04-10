import { FormEvent, useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import {
  createOrderCommissionConfig,
  getOrderCommissionConfigs,
  getOrderPaymentSnapshots,
  OrderCommissionConfig,
  OrderPaymentSnapshot,
  updateOrderCommissionConfig,
} from "./api";

const toNumber = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

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

  const loadSnapshots = async (page = 1) => {
    setSnapshotLoading(true);
    try {
      const data = await getOrderPaymentSnapshots(page, 10, "");
      setSnapshots(data.results || []);
      setSnapshotTotalPages(data.total_pages || 1);
      setSnapshotPage(page);
    } catch {
      setSnapshots([]);
    } finally {
      setSnapshotLoading(false);
    }
  };

  useEffect(() => {
    void loadConfigs();
    void loadSnapshots(1);
  }, []);

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
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Order Payment Snapshots</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Frozen split per order at creation time. Past orders remain unchanged even if config changes later.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>#</TableCell>
                    <TableCell isHeader>Order</TableCell>
                    <TableCell isHeader>Food Subtotal</TableCell>
                    <TableCell isHeader>Delivery</TableCell>
                    <TableCell isHeader>Grand Total</TableCell>
                    <TableCell isHeader>Platform</TableCell>
                    <TableCell isHeader>Kitchen</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshotLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        Loading snapshots...
                      </TableCell>
                    </TableRow>
                  ) : snapshots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        No snapshots found
                      </TableCell>
                    </TableRow>
                  ) : (
                    snapshots.map((row, idx) => (
                      <TableRow key={row.id}>
                        <TableCell>{(snapshotPage - 1) * 10 + idx + 1}</TableCell>
                        <TableCell>#{row.order}</TableCell>
                        <TableCell>Rs {row.food_subtotal}</TableCell>
                        <TableCell>Rs {row.delivery_charge}</TableCell>
                        <TableCell>Rs {row.grand_total}</TableCell>
                        <TableCell>
                          Rs {row.platform_amount} ({row.platform_percent}%)
                        </TableCell>
                        <TableCell>
                          Rs {row.kitchen_amount} ({row.kitchen_percent}%)
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {snapshotTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => void loadSnapshots(Math.max(1, snapshotPage - 1))}
                disabled={snapshotPage === 1 || snapshotLoading}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {snapshotPage} / {snapshotTotalPages}
              </span>
              <button
                type="button"
                onClick={() => void loadSnapshots(Math.min(snapshotTotalPages, snapshotPage + 1))}
                disabled={snapshotPage >= snapshotTotalPages || snapshotLoading}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
