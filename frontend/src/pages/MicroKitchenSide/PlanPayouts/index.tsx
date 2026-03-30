import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { 
  fetchMicroKitchenPayoutPatients, 
  fetchPartnerTrackerTransactions,
  PatientTrackersRow, 
  PayoutTransactionRow 
} from "./api";

function fmtDate(s: string | null) {
  if (!s) return "—";
  return s;
}

export default function MicroKitchenPlanPayoutsPage() {
  const [patientPage, setPatientPage] = useState(1);
  const [patientData, setPatientData] = useState<{ results: PatientTrackersRow[]; totalPages: number }>({
    results: [],
    totalPages: 1,
  });
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [expandedPatients, setExpandedPatients] = useState<number[]>([]);
  const [trackerTxs, setTrackerTxs] = useState<Record<number, PayoutTransactionRow[]>>({});

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await fetchMicroKitchenPayoutPatients(patientPage, 12);
      setPatientData({ results: res.results || [], totalPages: res.total_pages || 1 });
    } catch {
      setPatientData({ results: [], totalPages: 1 });
    } finally {
      setLoadingPatients(false);
    }
  }, [patientPage]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return (
    <>
      <PageMeta title="Diet plan payouts" description="Your share from verified patient diet plan payments" />
      <PageBreadcrumb pageTitle="Diet plan payouts" />

      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm border-b-4 border-b-emerald-500">
           <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
             <span className="bg-emerald-500 text-white p-2 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             </span>
             Diet Plan Payouts
           </h1>
           <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl leading-relaxed">
             Track your micro-kitchen revenue share for patient diet plans. Payouts are grouped by patient. Expand a patient to see their plans and view detailed payment history using the <span className="text-emerald-600 font-bold">eye icon</span>.
           </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden min-h-[400px]">
          <div className="bg-gray-50/50 dark:bg-gray-800/50 px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Patient List
            </h2>
          </div>

          {loadingPatients ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
               <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
               <p className="text-gray-400 font-medium">Fetching patient data...</p>
            </div>
          ) : patientData.results.length === 0 ? (
            <div className="py-24 text-center">
               <div className="bg-gray-50 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
               </div>
               <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No Payout Records</p>
               <p className="text-gray-500 mt-2">Any future diet plan payouts will appear here.</p>
            </div>
          ) : (
            <>
              <div className="p-6 space-y-3">
                {patientData.results.map((patient) => {
                  const isExpanded = expandedPatients.includes(patient.id);
                  const toggleExpand = async () => {
                    const willExpand = !isExpanded;
                    setExpandedPatients((prev) =>
                      willExpand ? [...prev, patient.id] : prev.filter((id) => id !== patient.id)
                    );

                    if (willExpand) {
                      patient.trackers.forEach(async (t) => {
                        if (!trackerTxs[t.id]) {
                          try {
                            const res = await fetchPartnerTrackerTransactions(t.id);
                            setTrackerTxs((prev) => ({ ...prev, [t.id]: res }));
                          } catch { /* ignore */ }
                        }
                      });
                    }
                  };

                  return (
                    <div key={patient.id} className={`group border transition-all duration-300 rounded-2xl overflow-hidden ${isExpanded ? "border-emerald-200 shadow-lg ring-1 ring-emerald-100" : "border-gray-100 hover:border-emerald-300 hover:shadow-md"}`}>
                      <div className={`p-5 flex items-center justify-between cursor-pointer ${isExpanded ? "bg-emerald-50/30 dark:bg-emerald-900/10" : "bg-white dark:bg-gray-900"}`} onClick={toggleExpand}>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-emerald-600 font-black text-lg">
                             {patient.patient_name.charAt(0)}
                           </div>
                           <div>
                             <h3 className="font-bold text-gray-900 dark:text-white text-lg">{patient.patient_name}</h3>
                             <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Patient ID: #{patient.id}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right flex flex-col items-end px-4 border-r border-gray-100 last:border-0">
                               <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter mb-0.5">Plans</span>
                               <span className="text-lg font-black text-gray-900 dark:text-white">{patient.trackers.length}</span>
                           </div>
                           <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? "bg-emerald-600 text-white rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"}`}>
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                           </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-gray-50/40 dark:bg-gray-900/40 border-t border-emerald-100 p-4 space-y-4">
                          {patient.trackers.map((t) => (
                            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-black uppercase rounded-md tracking-widest">
                                      {t.payout_type}
                                    </span>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{t.plan_title}</h4>
                                  </div>
                                  <p className="text-xs text-gray-400 font-medium">
                                    Period: {fmtDate(t.period_from)} to {fmtDate(t.period_to)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-8 bg-gray-50/50 dark:bg-gray-900/50 px-6 py-2 rounded-2xl border border-gray-100/50 dark:border-gray-700/50">
                                   <div className="flex flex-col">
                                     <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
                                     <span className="text-sm font-black text-gray-900 dark:text-white">₹{parseFloat(t.total_amount).toFixed(2)}</span>
                                   </div>
                                   <div className="flex flex-col">
                                     <span className="text-[10px] uppercase font-bold text-gray-400">Received</span>
                                     <span className="text-sm font-bold text-emerald-600">₹{parseFloat(t.paid_amount).toFixed(2)}</span>
                                   </div>
                                   <div className="flex flex-col">
                                     <span className="text-[10px] uppercase font-bold text-gray-400">Rem.</span>
                                     <span className="text-sm font-bold text-orange-600">₹{parseFloat(String(t.remaining_amount)).toFixed(2)}</span>
                                   </div>
                                </div>
                              </div>

                              {/* Transaction Log */}
                              <div className="bg-gray-50/30 dark:bg-gray-900/20 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                   <h5 className="text-[11px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                      Payment History
                                   </h5>
                                </div>

                                {trackerTxs[t.id] && trackerTxs[t.id].length > 0 ? (
                                  <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                                    <table className="w-full text-left text-[11px]">
                                      <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                          <th className="py-2 px-3 font-bold">Date</th>
                                          <th className="py-2 px-3 font-bold">Amount</th>
                                          <th className="py-2 px-3 font-bold">Method</th>
                                          <th className="py-2 px-3 font-bold">Ref ID</th>
                                          <th className="py-2 px-3 font-bold text-right">View</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {trackerTxs[t.id].map((tx) => (
                                          <tr key={tx.id} className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="py-2 px-3 whitespace-nowrap">{tx.payout_date || fmtDate(tx.paid_on)}</td>
                                            <td className="py-2 px-3 font-black text-gray-900 dark:text-white">₹{parseFloat(tx.amount_paid).toFixed(2)}</td>
                                            <td className="py-2 px-3 capitalize">{tx.payment_method?.replace('_', ' ')}</td>
                                            <td className="py-2 px-3 font-mono text-[10px]">{tx.transaction_reference || "—"}</td>
                                            <td className="py-2 px-3 text-right">
                                              {tx.payment_screenshot_url ? (
                                                <a href={tx.payment_screenshot_url} target="_blank" rel="noreferrer" className="w-6 h-6 inline-flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-600 hover:text-white transition-colors">
                                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                </a>
                                              ) : "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="py-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800">
                                     No payments logged yet
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {patientData.totalPages > 1 && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-2 bg-gray-50/30 dark:bg-gray-900/30">
                  {Array.from({ length: patientData.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPatientPage(p); setExpandedPatients([]); }}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${patientPage === p ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
