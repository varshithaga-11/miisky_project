import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Package, ArrowLeft, Receipt, Upload, ExternalLink } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadcrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";
import {
  getSupplyChainDeliveryEarnings,
  upsertOrderDeliveryReceipt,
  DeliveryEarningRow,
} from "./api";

const fmtMoney = (s: string | undefined | null) => {
  const n = Number(s);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toFixed(2)}`;
};

export default function SupplyChainEarningsPage() {
  const [rows, setRows] = useState<DeliveryEarningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalOrders, setTotalOrders] = useState<number | undefined>();
  const [totalDeliveryEarnings, setTotalDeliveryEarnings] = useState<string | undefined>();

  const [receiptModalOrder, setReceiptModalOrder] = useState<DeliveryEarningRow | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptNotes, setReceiptNotes] = useState("");
  const [savingReceipt, setSavingReceipt] = useState(false);

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
        const data = await getSupplyChainDeliveryEarnings(page, pageSize, debouncedSearch);
        if (cancelled) return;
        setRows(data.results ?? []);
        setTotalPages(data.total_pages ?? 1);
        setTotalCount(data.count ?? 0);
        setTotalOrders(data.total_orders);
        setTotalDeliveryEarnings(data.total_delivery_earnings);
      } catch {
        if (!cancelled) {
          toast.error("Failed to load delivery earnings");
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

  const openReceiptModal = (row: DeliveryEarningRow) => {
    setReceiptModalOrder(row);
    setReceiptNotes(row.receipt?.notes ?? "");
    setReceiptFile(null);
  };

  const closeReceiptModal = () => {
    setReceiptModalOrder(null);
    setReceiptFile(null);
    setReceiptNotes("");
  };

  const submitReceipt = async () => {
    if (!receiptModalOrder) return;
    const needFile = !receiptModalOrder.receipt;
    if (needFile && !receiptFile) {
      toast.error("Please choose a receipt image");
      return;
    }
    setSavingReceipt(true);
    try {
      await upsertOrderDeliveryReceipt(receiptModalOrder.id, receiptNotes, receiptFile);
      toast.success(receiptModalOrder.receipt ? "Receipt updated" : "Receipt saved");
      closeReceiptModal();
      const data = await getSupplyChainDeliveryEarnings(page, pageSize, debouncedSearch);
      setRows(data.results ?? []);
      setTotalOrders(data.total_orders);
      setTotalDeliveryEarnings(data.total_delivery_earnings);
    } catch {
      toast.error("Could not save receipt");
    } finally {
      setSavingReceipt(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Earnings | Supply chain"
        description="Delivery charges for separate orders assigned to you"
      />
      <PageBreadcrumb pageTitle="Earnings" />
      <ToastContainer position="bottom-right" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <Link
            to="/supplychain/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/supplychain/seperate-orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-500 dark:text-slate-400"
          >
            <Package className="w-4 h-4" />
            My separate orders
          </Link>
        </div>

        <header className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <Wallet className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wide">Separate order deliveries</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery earnings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            For each <strong>delivered</strong> customer order where you are the assigned delivery person, the{" "}
            <strong>delivery charge</strong> is the pass-through amount for that trip. Upload a receipt or proof here
            for your records (optional).
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered orders (filtered)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalOrders ?? "—"}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total delivery charges (sum)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {fmtMoney(totalDeliveryEarnings)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
            Search order #, customer, or kitchen
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
            className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell isHeader>#</TableCell>
                  <TableCell isHeader>Order</TableCell>
                  <TableCell isHeader>Kitchen</TableCell>
                  <TableCell isHeader>Customer</TableCell>
                  <TableCell isHeader>Delivery charge</TableCell>
                  <TableCell isHeader>Order total</TableCell>
                  <TableCell isHeader>Receipt</TableCell>
                  <TableCell isHeader>Notes</TableCell>
                  <TableCell isHeader />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                      No delivered orders yet. Complete deliveries from{" "}
                      <Link className="text-indigo-600 underline" to="/supplychain/seperate-orders">
                        My separate orders
                      </Link>
                      .
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-gray-500">{(page - 1) * pageSize + i + 1}</TableCell>
                      <TableCell className="font-mono font-semibold">#{r.id}</TableCell>
                      <TableCell>{r.kitchen_name ?? "—"}</TableCell>
                      <TableCell>{r.customer_display || "—"}</TableCell>
                      <TableCell className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {fmtMoney(r.delivery_earning)}
                      </TableCell>
                      <TableCell>{fmtMoney(r.final_amount)}</TableCell>
                      <TableCell>
                        {r.receipt?.receipt_image_url ? (
                          <a
                            href={r.receipt.receipt_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-sm text-gray-600 dark:text-gray-400">
                        {r.receipt?.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openReceiptModal(r)}>
                          <Upload className="w-4 h-4 mr-1" />
                          {r.receipt ? "Update" : "Add"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of{" "}
              {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {receiptModalOrder && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            onClick={closeReceiptModal}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Receipt — Order #{receiptModalOrder.id}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Delivery earning for this trip:{" "}
                <strong className="text-emerald-600">{fmtMoney(receiptModalOrder.delivery_earning)}</strong>
              </p>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Receipt image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm mb-4"
              />
              {!receiptModalOrder.receipt && (
                <p className="text-xs text-amber-600 mb-2">Required on first save.</p>
              )}
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes</label>
              <textarea
                value={receiptNotes}
                onChange={(e) => setReceiptNotes(e.target.value)}
                rows={3}
                placeholder="e.g. UPI ref, cash handed to kitchen…"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={closeReceiptModal} disabled={savingReceipt}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void submitReceipt()} disabled={savingReceipt}>
                  {savingReceipt ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
