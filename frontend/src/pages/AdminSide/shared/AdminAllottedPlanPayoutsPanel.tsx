import { Fragment, useCallback, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { Modal } from "../../../components/ui/modal";
import { toast } from "react-toastify";
import {
  PayableTrackerRow,
  createPayoutTransaction,
} from "../RecordPlanPayouts/api";

const METHODS: { value: string; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export type AllottedPlanPayoutPatientRow = {
  id: number;
  patient_name: string;
  email?: string | null;
  mobile?: string | null;
  assigned_on?: string | null;
  plan_title: string | null;
  payable_lines: number;
  total_remaining: string;
  total_paid: string;
  plan_share_total: string;
  trackers: (PayableTrackerRow & {
    nutritionist_reassignments?: { from: string; to: string; reason: string; date: string }[];
    kitchen_reassignments?: { from: string; to: string; reason: string; date: string }[];
  })[];
};

type Props = {
  loadRows: (search: string) => Promise<AllottedPlanPayoutPatientRow[]>;
  partnerRoleLabel: string;
};

export function AdminAllottedPlanPayoutsPanel({ loadRows, partnerRoleLabel }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<AllottedPlanPayoutPatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatients, setExpandedPatients] = useState<number[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<PayableTrackerRow | null>(null);
  const [modalTrackers, setModalTrackers] = useState<PayableTrackerRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [payoutDate, setPayoutDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadRows(searchTerm);
      setRows(data || []);
    } catch {
      toast.error("Failed to load allotted plan payouts");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [loadRows, searchTerm]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openPayout = (tracker: PayableTrackerRow, allTrackers?: PayableTrackerRow[]) => {
    setSelectedTracker(tracker);
    setModalTrackers(allTrackers || [tracker]);
    setAmountPaid(String(tracker.remaining_amount));
    setIsModalOpen(true);
  };

  const closePayout = () => {
    setIsModalOpen(false);
    setSelectedTracker(null);
    setModalTrackers([]);
    setAmountPaid("");
    setReference("");
    setNote("");
    setScreenshot(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTracker || !amountPaid || !paymentMethod) {
      toast.warning("Incomplete form.");
      return;
    }
    setSubmitting(true);
    try {
      await createPayoutTransaction({
        tracker: selectedTracker.id,
        amount_paid: amountPaid,
        payout_date: payoutDate || undefined,
        payment_method: paymentMethod,
        transaction_reference: reference.trim() || undefined,
        note: note.trim() || undefined,
        payment_screenshot: screenshot,
      });
      toast.success("Payout recorded.");
      closePayout();
      await refresh();
      setExpandedPatients([]);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
      const msg =
        (typeof data?.detail === "string" && data.detail) ||
        (typeof data?.amount_paid === "string" && data.amount_paid) ||
        (Array.isArray(data?.amount_paid) && String(data.amount_paid[0])) ||
        "Could not record payout";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Allotted patients only. Each row shows this {partnerRoleLabel}&apos;s diet-plan revenue share (from verified plan
        payments): amount received so far and balance still owed. Use{" "}
        <strong>Record payout</strong> to log a transfer (same as Record plan payouts).
      </p>

      <div className="relative max-w-md mb-4">
        <input
          type="text"
          value={searchTerm}
          placeholder="Filter by patient name or email..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setExpandedPatients([]);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <svg
          className="absolute left-3 top-2.5 text-gray-400"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-6">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-amber-700 dark:text-amber-400 py-6">
          No allotted patients match, or no diet-plan payout rows yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Patient
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Plan
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Open lines
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Share total
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Paid
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Outstanding
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400 text-right">
                  Details
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((patient) => {
                const isExpanded = expandedPatients.includes(patient.id);
                const trackers = patient.trackers ?? [];
                const toggleExpand = () => {
                  setExpandedPatients((prev) =>
                    isExpanded ? prev.filter((id) => id !== patient.id) : [...prev, patient.id]
                  );
                };

                return (
                  <Fragment key={patient.id}>
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <TableCell className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                        {patient.patient_name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {patient.plan_title || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4">{patient.payable_lines}</TableCell>
                      <TableCell className="px-5 py-4 font-medium">
                        ₹{parseFloat(patient.plan_share_total || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-medium text-green-700 dark:text-green-400">
                        ₹{parseFloat(patient.total_paid || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-medium">
                        ₹{parseFloat(patient.total_remaining || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={toggleExpand}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-brand-600 ${isExpanded ? "rotate-180 text-brand-600 border-brand-200" : ""}`}
                          aria-expanded={isExpanded}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="px-5 py-4 bg-gray-50/60 dark:bg-gray-900/20">
                          {trackers.length === 0 ? (
                            <p className="text-sm text-gray-500">No payout trackers for this patient yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              {trackers.map((t) => (
                                <div
                                  key={t.id}
                                  className="relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm"
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <span
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider mb-2 ${
                                          t.payout_type === "nutritionist"
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                                            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30"
                                        }`}
                                      >
                                        {t.payout_type?.replace("_", " ")}
                                      </span>
                                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                        {t.recipient_label}
                                      </h4>
                                      <p className="text-[10px] text-gray-500 font-medium">
                                        #{t.id} • {t.shared_percentage}% share
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                                        Remaining
                                      </span>
                                      <span className="text-base font-black text-gray-900 dark:text-white">
                                        ₹{parseFloat(String(t.remaining_amount)).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 border-t border-gray-50 dark:border-gray-800 pt-4 mb-4">
                                    <div className="col-span-2">
                                      <span className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                                        Service period
                                      </span>
                                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                                        {t.period_from} — {t.period_to}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-medium truncate block mt-1">
                                        {t.plan_title}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                                        Total / paid
                                      </span>
                                      <span className="text-[11px] font-medium text-gray-500">
                                        ₹{parseFloat(t.total_amount).toFixed(2)} /{" "}
                                        <span className="text-green-600 font-bold">
                                          ₹{parseFloat(t.paid_amount).toFixed(2)}
                                        </span>
                                      </span>
                                    </div>
                                  </div>

                                  {"nutritionist_reassignments" in t &&
                                    t.nutritionist_reassignments &&
                                    t.nutritionist_reassignments.length > 0 && (
                                      <div className="mb-3 text-[10px] text-gray-500 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
                                        <span className="font-bold text-gray-600 dark:text-gray-400">
                                          Nutrition reassignments:{" "}
                                        </span>
                                        {t.nutritionist_reassignments.map((nr, i) => (
                                          <span key={i} className="block mt-1">
                                            {nr.from} → {nr.to} ({nr.reason})
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                  {"kitchen_reassignments" in t &&
                                    t.kitchen_reassignments &&
                                    t.kitchen_reassignments.length > 0 && (
                                      <div className="mb-3 text-[10px] text-gray-500 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
                                        <span className="font-bold text-gray-600 dark:text-gray-400">
                                          Kitchen reassignments:{" "}
                                        </span>
                                        {t.kitchen_reassignments.map((kr, i) => (
                                          <span key={i} className="block mt-1">
                                            {kr.from} → {kr.to} ({kr.reason})
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                  <Button
                                    size="sm"
                                    onClick={() => openPayout(t, trackers)}
                                    disabled={parseFloat(String(t.remaining_amount)) <= 0}
                                    className="flex-1 shadow-sm h-9 text-[10px] uppercase font-black tracking-widest"
                                  >
                                    Record payout
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closePayout} className="max-w-xl p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record payout</h2>
          <p className="text-sm text-gray-500 mt-1">Log a payment transfer to this partner.</p>
        </div>

        <div className="p-6">
          {selectedTracker && (
            <div className="bg-brand-50 rounded-2xl p-5 mb-6 text-sm text-brand-900 border border-brand-100 dark:bg-brand-900/10 dark:text-brand-300 dark:border-brand-800/30">
              <div className="mb-4">
                <Label htmlFor="tracker_select" className="text-brand-700 dark:text-brand-400">
                  Payout line *
                </Label>
                <select
                  id="tracker_select"
                  className="w-full mt-1 rounded-xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm font-bold text-brand-900 dark:text-brand-100 outline-none focus:ring-2 focus:ring-brand-500"
                  value={selectedTracker.id}
                  onChange={(e) => {
                    const tid = parseInt(e.target.value, 10);
                    const found = modalTrackers.find((x) => x.id === tid);
                    if (found) {
                      setSelectedTracker(found);
                      setAmountPaid(String(found.remaining_amount));
                    }
                  }}
                >
                  {modalTrackers.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.payout_type === "nutritionist" ? "Nutritionist" : "Micro kitchen"}: {x.recipient_label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-y-4 pt-2">
                <div>
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Patient</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {selectedTracker.patient_name || "—"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Service period</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">
                    {selectedTracker.period_from} — {selectedTracker.period_to}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Paid so far</span>
                  <span className="text-sm font-black text-green-600">
                    ₹{parseFloat(selectedTracker.paid_amount).toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Remaining</span>
                  <span className="text-xl font-black tracking-tighter text-brand-600">
                    ₹{parseFloat(String(selectedTracker.remaining_amount)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount_paid">Amount sent (₹) *</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter amount"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_method">Method *</Label>
                <select
                  id="payment_method"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm ring-brand-500 focus:border-brand-500 focus:ring-1 transition-all outline-none"
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
                <Label htmlFor="reference">Reference (UTR / ID)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Transaction ID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Internal note</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </div>

            <div>
              <Label htmlFor="screenshot">Receipt screenshot</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-2xl hover:border-brand-400 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upload receipt image (optional)</p>
                </div>
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                />
              </div>
              {screenshot && (
                <p className="mt-2 text-xs font-bold text-brand-600">Selected: {screenshot.name}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={closePayout} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[140px]">
                {submitting ? "Processing…" : "Confirm payout"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
