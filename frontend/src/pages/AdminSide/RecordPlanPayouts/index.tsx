import { Fragment, useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { toast } from "react-toastify";
import { Modal } from "../../../components/ui/modal";
import {
  createPayoutTransaction,
  fetchPayoutPatientDetails,
  fetchPayoutPatientSummaries,
  PayableTrackerRow,
  PatientPayoutSummaryRow,
  PatientTrackersRow,
} from "./api";

const METHODS: { value: string; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];


export default function RecordPlanPayoutsPage() {
  const [patientPage, setPatientPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientData, setPatientData] = useState<{ results: PatientPayoutSummaryRow[]; totalPages: number }>({
    results: [],
    totalPages: 1,
  });
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [expandedPatients, setExpandedPatients] = useState<number[]>([]);
  const [patientDetailsById, setPatientDetailsById] = useState<Record<number, PatientTrackersRow>>({});
  const [loadingDetailById, setLoadingDetailById] = useState<Record<number, boolean>>({});


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

  // New state to hold multiple trackers for the selected patient in the modal
  const [modalTrackers, setModalTrackers] = useState<PayableTrackerRow[]>([]);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await fetchPayoutPatientSummaries(patientPage, 10, searchTerm);
      setPatientData({ results: res.results || [], totalPages: res.total_pages || 1 });
    } catch {
      toast.error("Failed to load patient payout data");
      setPatientData({ results: [], totalPages: 1 });
    } finally {
      setLoadingPatients(false);
    }
  }, [patientPage, searchTerm]);


  useEffect(() => {
    loadPatients();
  }, [loadPatients]);


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
      await loadPatients();
      setPatientDetailsById({});
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
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              placeholder="Search patient, plan, nutritionist, kitchen..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPatientPage(1);
                setExpandedPatients([]);
                setPatientDetailsById({});
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
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          {loadingPatients ? (
            <p className="text-sm text-gray-500 py-6">Loading patients…</p>
          ) : patientData.results.length === 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400 py-6">
              No patients have open payable lines right now.
            </p>
          ) : (
            <>
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
                        Payable Lines
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                        Plan Total
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
                {patientData.results.map((patient) => {
                  const isExpanded = expandedPatients.includes(patient.id);
                  const toggleExpand = async () => {
                    const willExpand = !isExpanded;
                    setExpandedPatients((prev) =>
                      willExpand ? [...prev, patient.id] : prev.filter((id) => id !== patient.id)
                    );
                    if (willExpand && !patientDetailsById[patient.id]) {
                      setLoadingDetailById((prev) => ({ ...prev, [patient.id]: true }));
                      try {
                        const detail = await fetchPayoutPatientDetails(patient.id, searchTerm);
                        if (detail) {
                          setPatientDetailsById((prev) => ({ ...prev, [patient.id]: detail }));
                        }
                      } catch {
                        toast.error("Failed to load payout lines for this patient");
                      } finally {
                        setLoadingDetailById((prev) => ({ ...prev, [patient.id]: false }));
                      }
                    }
                  };
                  const patientDetail = patientDetailsById[patient.id];
                  const trackers = patientDetail?.trackers ?? [];
                  const isLoadingDetail = loadingDetailById[patient.id];

                  return (
                    <Fragment key={patient.id}>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <TableCell className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                          {patient.patient_name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-700 dark:text-gray-300">
                          {patient.plan_title || "No Plan"}
                        </TableCell>
                        <TableCell className="px-5 py-4">{patient.payable_lines}</TableCell>
                        <TableCell className="px-5 py-4 font-medium">
                          ₹{parseFloat(patient.plan_total_amount || "0").toFixed(2)}
                        </TableCell>
                        <TableCell className="px-5 py-4 font-medium">
                          ₹{parseFloat(patient.total_remaining || "0").toFixed(2)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={toggleExpand}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-brand-600 ${isExpanded ? "rotate-180 text-brand-600 border-brand-200" : ""}`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="px-5 py-4 bg-gray-50/60 dark:bg-gray-900/20">
                          {isLoadingDetail ? (
                            <p className="text-sm text-gray-500">Loading payout lines...</p>
                          ) : (
                            <>
                          {/* Platform Fee Notice */}
                          {trackers.some(t => t.payout_type === 'platform') && (
                            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Internal Platform Retention</p>
                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    Miisky Admin Share: <span className="text-gray-900 dark:text-white">₹{parseFloat(trackers.find(t => t.payout_type === 'platform')?.total_amount || "0").toFixed(2)}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="px-3 py-1 rounded-full bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/20">
                                <p className="text-[9px] font-bold text-brand-700 uppercase tracking-tight">System Managed</p>
                              </div>
                            </div>
                          )}

                          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trackers.filter(t => t.payout_type !== 'platform').map((t) => (
                              <div
                                key={t.id}
                                className="relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:ring-1 hover:ring-brand-200 dark:hover:ring-brand-900 transition-all"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider mb-2 ${t.payout_type === 'nutritionist'
                                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'
                                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30'
                                      }`}>
                                      {t.payout_type?.replace('_', ' ')}
                                    </span>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                      {t.recipient_label}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 font-medium">#{t.id} • {t.shared_percentage}% Share</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Remaining Owed</span>
                                    <span className="text-base font-black text-gray-900 dark:text-white">₹{parseFloat(String(t.remaining_amount)).toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-t border-gray-50 dark:border-gray-800 pt-4 mb-4">
                                  <div className="col-span-2">
                                    <span className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Service Period</span>
                                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                                      {t.period_from} — {t.period_to}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium truncate block mt-1">{t.plan_title}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Total / Paid</span>
                                    <span className="text-[11px] font-medium text-gray-500">
                                      ₹{parseFloat(t.total_amount).toFixed(2)} / <span className="text-green-600 font-bold">₹{parseFloat(t.paid_amount).toFixed(2)}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => openPayout(t, trackers)}
                                    className="flex-1 shadow-sm h-9 text-[10px] uppercase font-black tracking-widest"
                                  >
                                    Add Payout
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                            </>
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
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={patientPage >= patientData.totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setPatientPage((p) => p + 1)}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
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
              <div className="mb-4">
                <Label htmlFor="tracker_select" className="text-brand-700 dark:text-brand-400">Target Payout Role *</Label>
                <select
                  id="tracker_select"
                  className="w-full mt-1 rounded-xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm font-bold text-brand-900 dark:text-brand-100 outline-none focus:ring-2 focus:ring-brand-500"
                  value={selectedTracker.id}
                  onChange={(e) => {
                    const tid = parseInt(e.target.value);
                    const found = modalTrackers.find(t => t.id === tid);
                    if (found) {
                      setSelectedTracker(found);
                      setAmountPaid(String(found.remaining_amount));
                    }
                  }}
                >
                  {modalTrackers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.payout_type === 'nutritionist' ? 'Nutritionist' : 'Micro Kitchen'}: {t.recipient_label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-y-4 pt-2">
                <div>
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Patient</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {selectedTracker.patient_name || '--'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Service Period</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">
                    {selectedTracker.period_from} — {selectedTracker.period_to}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Currently Paid</span>
                  <span className="text-sm font-black text-green-600">₹{parseFloat(selectedTracker.paid_amount).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-black text-brand-400 mb-0.5">Remaining Owed</span>
                  <span className="text-xl font-black tracking-tighter text-brand-600">₹{parseFloat(String(selectedTracker.remaining_amount)).toFixed(2)}</span>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
