import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast } from "react-toastify";
import { Modal } from "../../../components/ui/modal";
import {
  createPayoutTransaction,
  fetchPayoutPatients,
  fetchTrackerTransactions,
  PayableTrackerRow,
  PatientTrackersRow,
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
  const [patientPage, setPatientPage] = useState(1);
  const [patientData, setPatientData] = useState<{ results: PatientTrackersRow[]; totalPages: number }>({
    results: [],
    totalPages: 1,
  });
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [expandedPatients, setExpandedPatients] = useState<number[]>([]);
  const [trackerTxs, setTrackerTxs] = useState<Record<number, PayoutTransactionRow[]>>({});


  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<PayableTrackerRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [amountPaid, setAmountPaid] = useState("");
  const [payoutDate, setPayoutDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await fetchPayoutPatients(patientPage, 12);
      setPatientData({ results: res.results || [], totalPages: res.total_pages || 1 });
    } catch {
      toast.error("Failed to load patient payout data");
      setPatientData({ results: [], totalPages: 1 });
    } finally {
      setLoadingPatients(false);
    }
  }, [patientPage]);


  useEffect(() => {
    loadPatients();
  }, [loadPatients]);


  const openPayout = (tracker: PayableTrackerRow) => {
    setSelectedTracker(tracker);
    setAmountPaid(String(tracker.remaining_amount));
    setIsModalOpen(true);
  };

  const closePayout = () => {
    setIsModalOpen(false);
    setSelectedTracker(null);
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
      await loadPatients();
      
      // Re-fetch transactions for the updated tracker
      try {
        const res = await fetchTrackerTransactions(selectedTracker.id);
        setTrackerTxs((prev) => ({ ...prev, [selectedTracker.id]: res }));
      } catch {
        // ignore
      }
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
      <PageMeta
        title="Record plan payouts"
        description="Log amounts sent to nutritionists and micro kitchens for diet plan revenue shares"
      />
      <PageBreadcrumb pageTitle="Record plan payouts" />

      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Below is a list of <strong>patients</strong> who have money still owed to their assigned nutritionist or
          micro kitchen. Select a line to record what you sent.
        </p>

        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payable Patients</h2>
          {loadingPatients ? (
            <p className="text-sm text-gray-500 py-6">Loading patients…</p>
          ) : patientData.results.length === 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400 py-6">
              No patients have open payable lines right now.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {patientData.results.map((patient) => {
                  const isExpanded = expandedPatients.includes(patient.id);
                  const toggleExpand = async () => {
                    const willExpand = !isExpanded;
                    setExpandedPatients((prev) =>
                      willExpand ? [...prev, patient.id] : prev.filter((id) => id !== patient.id)
                    );

                    if (willExpand) {
                      // Fetch transactions for each tracker of this patient
                      patient.trackers.forEach(async (t) => {
                        if (!trackerTxs[t.id]) {
                          try {
                            const res = await fetchTrackerTransactions(t.id);
                            setTrackerTxs((prev) => ({ ...prev, [t.id]: res }));
                          } catch {
                            // ignore silently or toast
                          }
                        }
                      });
                    }
                  };

                  return (
                    <div
                      key={patient.id}
                      className="group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20 overflow-hidden transition-all hover:border-brand-200 dark:hover:border-brand-900"
                    >
                      <div
                        onClick={toggleExpand}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white dark:hover:bg-gray-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-brand-600 border-brand-200" : ""
                            }`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                {patient.patient_name}
                              </h3>
                              <span className="text-gray-300">|</span>
                              <span className="text-sm font-medium text-gray-500 truncate max-w-[200px] sm:max-w-none">
                                {patient.trackers[0]?.plan_title || "No Plan"}
                              </span>
                            </div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">
                              ID: {patient.id} • {patient.trackers.length} Payable Line{patient.trackers.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 bg-white/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800 pt-4">
                          {patient.trackers.map((t) => (
                            <div key={t.id} className="space-y-3">
                              <div
                                className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 shadow-sm"
                              >
                                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 flex-grow">
                                  <div className="flex flex-col min-w-[120px]">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                                      Recipient ({t.payout_type})
                                    </span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                      {t.recipient_label}
                                    </span>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                                      Share
                                    </span>
                                    <span className="text-sm font-black text-brand-600">
                                      {t.shared_percentage}%
                                    </span>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                                      Total Amount
                                    </span>
                                    <span className="text-sm font-medium text-gray-500">
                                      ₹{parseFloat(t.total_amount).toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                                      Paid
                                    </span>
                                    <span className="text-sm font-medium text-green-600">
                                      ₹{parseFloat(t.paid_amount).toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                                      Remaining
                                    </span>
                                    <span className="text-base font-black text-gray-900 dark:text-white">
                                      ₹{parseFloat(String(t.remaining_amount)).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => openPayout(t)}
                                  className="whitespace-nowrap shadow-md shadow-brand-200 dark:shadow-none"
                                >
                                  Record Payout
                                </Button>
                              </div>

                              {/* Transaction History Sub-Table - Now uses state-fetched data */}
                              {trackerTxs[t.id] && trackerTxs[t.id].length > 0 && (
                                <div className="mx-2 mb-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10 overflow-hidden">
                                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40">
                                    <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Payment History</h4>
                                  </div>
                                  <div className="p-3 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                          <th className="pb-2 font-bold px-2">Date</th>
                                          <th className="pb-2 font-bold px-2">Amount</th>
                                          <th className="pb-2 font-bold px-2">Method</th>
                                          <th className="pb-2 font-bold px-2">Reference</th>
                                          <th className="pb-2 font-bold px-2">Screenshot</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {trackerTxs[t.id].map((tx) => (
                                          <tr key={tx.id} className="text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-800/40">
                                            <td className="py-2 px-2 whitespace-nowrap">
                                              {tx.payout_date ? new Date(tx.payout_date).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="py-2 px-2 font-bold text-gray-900 dark:text-gray-100">
                                              ₹{parseFloat(tx.amount_paid).toFixed(2)}
                                            </td>
                                            <td className="py-2 px-2 capitalize">{tx.payment_method?.replace('_', ' ')}</td>
                                            <td className="py-2 px-2 font-mono text-[10px]">{tx.transaction_reference || "—"}</td>
                                            <td className="py-2 px-2">
                                              {tx.payment_screenshot_url ? (
                                                <a
                                                  href={tx.payment_screenshot_url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-brand-600 hover:underline font-bold flex items-center gap-1"
                                                >
                                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                  View
                                                </a>
                                              ) : "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {patientData.totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-8 text-sm">
                  <span className="text-gray-500">
                    Page <span className="font-bold text-gray-900 dark:text-white">{patientPage}</span> of{" "}
                    {patientData.totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={patientPage <= 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={patientPage >= patientData.totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setPatientPage((p) => p + 1)}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={closePayout} className="max-w-xl p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Payout</h2>
           <p className="text-sm text-gray-500 mt-1">Log a payment transfer to a partner.</p>
        </div>

        <div className="p-6">
          {selectedTracker && (
            <div className="bg-brand-50 rounded-2xl p-5 mb-6 text-sm text-brand-900 border border-brand-100 dark:bg-brand-900/10 dark:text-brand-300 dark:border-brand-800/30">
              <div className="grid grid-cols-2 gap-y-3">
                <div>
                   <span className="block text-[10px] uppercase font-bold text-brand-400 mb-0.5">Recipient</span>
                   <span className="font-bold underline decoration-brand-200">{selectedTracker.recipient_label}</span>
                </div>
                <div>
                   <span className="block text-[10px] uppercase font-bold text-brand-400 mb-0.5">Role</span>
                   <span className="capitalize font-medium">{selectedTracker.payout_type}</span>
                </div>
                <div>
                   <span className="block text-[10px] uppercase font-bold text-brand-400 mb-0.5">Patient</span>
                   <span className="font-medium text-gray-700 dark:text-gray-300">{selectedTracker.patient_name}</span>
                </div>
                <div>
                   <span className="block text-[10px] uppercase font-bold text-brand-400 mb-0.5">Owed Amount</span>
                   <span className="text-lg font-black tracking-tight">₹{parseFloat(String(selectedTracker.remaining_amount)).toFixed(2)}</span>
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
                <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID" />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Internal Note</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional details..." />
            </div>

            <div>
              <Label htmlFor="screenshot">Receipt screenshot</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-2xl hover:border-brand-400 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <span className="relative cursor-pointer rounded-md font-medium text-brand-600 hover:text-brand-500">
                      Upload a file
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
                <p className="mt-2 text-xs font-bold text-brand-600 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Selected: {screenshot.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={closePayout} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[140px]">
                {submitting ? "Processing..." : "Confirm Payout"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
