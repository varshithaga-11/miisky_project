import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { toast } from "react-toastify";
import {
  createPayoutTransaction,
  fetchPayableTrackers,
  fetchPayoutTransactions,
  PayableTrackerRow,
  PayableTrackerType,
  PayoutTransactionRow,
} from "./api";

const METHODS: { value: string; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

function fmtDate(s: string | null) {
  if (!s) return "—";
  return s;
}

export default function RecordPlanPayoutsPage() {
  const [filterType, setFilterType] = useState<PayableTrackerType>("all");
  const [trackers, setTrackers] = useState<PayableTrackerRow[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txData, setTxData] = useState<{ rows: PayoutTransactionRow[]; totalPages: number }>({
    rows: [],
    totalPages: 1,
  });
  const [loadingTrackers, setLoadingTrackers] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [trackerId, setTrackerId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [payoutDate, setPayoutDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const loadTrackers = useCallback(async () => {
    setLoadingTrackers(true);
    try {
      const data = await fetchPayableTrackers(filterType);
      setTrackers(data);
      setTrackerId((prev) => {
        if (data.some((t) => String(t.id) === prev)) return prev;
        return data.length ? String(data[0].id) : "";
      });
    } catch {
      toast.error("Failed to load payable trackers");
      setTrackers([]);
    } finally {
      setLoadingTrackers(false);
    }
  }, [filterType]);

  const loadTx = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await fetchPayoutTransactions(txPage, 12);
      setTxData({ rows: res.results || [], totalPages: res.total_pages || 1 });
    } catch {
      toast.error("Failed to load recent payouts");
      setTxData({ rows: [], totalPages: 1 });
    } finally {
      setLoadingTx(false);
    }
  }, [txPage]);

  useEffect(() => {
    loadTrackers();
  }, [loadTrackers]);

  useEffect(() => {
    loadTx();
  }, [loadTx]);

  const selectedTracker = trackers.find((t) => String(t.id) === trackerId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerId || !amountPaid || !paymentMethod) {
      toast.warning("Choose a tracker, amount, and payment method.");
      return;
    }
    setSubmitting(true);
    try {
      await createPayoutTransaction({
        tracker: parseInt(trackerId, 10),
        amount_paid: amountPaid,
        payout_date: payoutDate || undefined,
        payment_method: paymentMethod,
        transaction_reference: reference.trim() || undefined,
        note: note.trim() || undefined,
        payment_screenshot: screenshot,
      });
      toast.success("Payout recorded.");
      setAmountPaid("");
      setReference("");
      setNote("");
      setScreenshot(null);
      await loadTrackers();
      await loadTx();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const msg =
        (typeof data?.detail === "string" && data.detail) ||
        (typeof data?.amount_paid === "string" && data.amount_paid) ||
        (Array.isArray(data?.amount_paid) && String(data.amount_paid[0])) ||
        (typeof data?.tracker === "string" && data.tracker) ||
        "Could not record payout";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Record plan payouts"
        description="Log amounts sent to nutritionists and micro kitchens for diet plan revenue shares"
      />
      <PageBreadcrumb pageTitle="Record plan payouts" />

      <div className="max-w-6xl mx-auto space-y-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select an open <strong>nutritionist</strong> or <strong>kitchen</strong> payout line (with money still
          owed), enter what you sent, and save. The recipient&apos;s tracker updates automatically; they see it on
          their Diet plan payouts page.
        </p>

        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["nutritionist", "Nutritionists"],
                ["kitchen", "Micro kitchens"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilterType(key);
                  setTrackerId("");
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  filterType === key
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loadingTrackers ? (
            <p className="text-sm text-gray-500">Loading trackers…</p>
          ) : trackers.length === 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              No payable trackers right now (nothing with a remaining balance, or none match this filter).
            </p>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <Label htmlFor="tracker">Payout line *</Label>
                <select
                  id="tracker"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={trackerId}
                  onChange={(e) => setTrackerId(e.target.value)}
                  required
                >
                  {trackers.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.payout_type}] {t.recipient_label} — {t.plan_title || "Plan"} — patient:{" "}
                      {t.patient_name || "—"} — remaining ₹{parseFloat(String(t.remaining_amount)).toFixed(2)}
                    </option>
                  ))}
                </select>
                {selectedTracker && (
                  <p className="text-xs text-gray-500">
                    Period {fmtDate(selectedTracker.period_from)} → {fmtDate(selectedTracker.period_to)} · Total ₹
                    {parseFloat(selectedTracker.total_amount).toFixed(2)} · Paid ₹
                    {parseFloat(selectedTracker.paid_amount).toFixed(2)} · Remaining ₹
                    {parseFloat(String(selectedTracker.remaining_amount)).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="amount_paid">Amount sent (₹) *</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="payout_date">Payment date</Label>
                <Input
                  id="payout_date"
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Method *</Label>
                <select
                  id="payment_method"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="reference">Reference (UTR / cheque no.)</Label>
                <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="note">Note</Label>
                <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="screenshot">Receipt screenshot</Label>
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-600"
                  onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting || trackers.length === 0}>
                  {submitting ? "Saving…" : "Record payout"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent recorded payouts</h2>
          {loadingTx ? (
            <p className="text-sm text-gray-500 py-6">Loading…</p>
          ) : txData.rows.length === 0 ? (
            <p className="text-sm text-gray-500 py-6">No transactions yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                      <TableCell isHeader>When</TableCell>
                      <TableCell isHeader>Type</TableCell>
                      <TableCell isHeader>Recipient</TableCell>
                      <TableCell isHeader>Patient / plan</TableCell>
                      <TableCell isHeader>Amount</TableCell>
                      <TableCell isHeader>Method</TableCell>
                      <TableCell isHeader>By</TableCell>
                      <TableCell isHeader>Ref</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txData.rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(r.paid_on).toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">{r.payout_type}</TableCell>
                        <TableCell className="font-medium">{r.recipient_label}</TableCell>
                        <TableCell className="text-xs">
                          <div>{r.patient_name || "—"}</div>
                          <div className="text-gray-500">{r.plan_title || "—"}</div>
                        </TableCell>
                        <TableCell>₹{parseFloat(r.amount_paid).toFixed(2)}</TableCell>
                        <TableCell className="text-xs">{r.payment_method || "—"}</TableCell>
                        <TableCell className="text-xs">{r.paid_by_display || "—"}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate">
                          {r.transaction_reference || "—"}
                          {r.payment_screenshot_url && (
                            <a
                              href={r.payment_screenshot_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-brand-600 hover:underline mt-0.5"
                            >
                              Receipt
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {txData.totalPages > 1 && (
                <div className="flex justify-end gap-2 mt-4 text-sm">
                  <button
                    type="button"
                    disabled={txPage <= 1}
                    className="px-3 py-1 rounded-lg border disabled:opacity-40"
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="py-1 text-gray-600">
                    Page {txPage} / {txData.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={txPage >= txData.totalPages}
                    className="px-3 py-1 rounded-lg border disabled:opacity-40"
                    onClick={() => setTxPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
