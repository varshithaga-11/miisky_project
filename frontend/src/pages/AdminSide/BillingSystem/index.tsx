import React, { useEffect, useState } from "react";
import { 
  FiDollarSign, FiCalendar, FiArrowRight, FiCheckCircle, 
  FiClock, FiPlus, FiFilter, FiActivity, FiCreditCard, 
  FiFileText, FiShield, FiTrendingUp, FiUser
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { getWalletCredits, getInvoices, settleInvoice, PlanWalletCredit, BillingCycleInvoice } from "./api";
import { useParams, useSearchParams } from "react-router-dom";

const BillingSystem: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const [credits, setCredits] = useState<PlanWalletCredit[]>([]);
  const [invoices, setInvoices] = useState<BillingCycleInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"invoices" | "credits">("invoices");

  const fetchData = async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const [c, i] = await Promise.all([
        getWalletCredits(Number(planId)),
        getInvoices(Number(planId))
      ]);
      setCredits(c);
      setInvoices(i);
    } catch (err) {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [planId]);

  const handleSettle = async (id: number) => {
    try {
      await settleInvoice(id);
      toast.success("Invoice settlement triggered");
      fetchData();
    } catch (err) {
      toast.error("Settlement failed");
    }
  };

  if (!planId) {
    return (
      <div className="p-8 text-center bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl">
        <FiActivity className="mx-auto mb-4 text-indigo-500" size={48} />
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Plan Selected</h2>
        <p className="text-gray-500 dark:text-gray-400">Please select a diet plan from the overview to manage its billing.</p>
      </div>
    );
  }

  const totalPaid = credits
    .filter(c => c.status === "captured")
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const totalBilled = invoices
    .reduce((acc, curr) => acc + parseFloat(curr.grand_total), 0);

  const totalApplied = invoices
    .reduce((acc, curr) => acc + parseFloat(curr.deposit_applied), 0);

  const availableBalance = totalPaid - totalApplied;

  const totalUnpaid = invoices
    .filter(i => !i.is_paid)
    .reduce((acc, curr) => acc + parseFloat(curr.amount_due), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ToastContainer position="bottom-right" className="z-[99999]" />
      <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                  <FiDollarSign size={24} />
                </div>
                Financial Overview
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Patient billing and wallet summary for Plan #{planId}</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-2 rounded-2xl border border-gray-100 dark:border-white/5">
              <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">Active Plan</p>
              </div>
              <div className="px-4 py-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Currency</p>
                <p className="text-sm font-black text-gray-700 dark:text-gray-300">INR (₹)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FiFileText size={14} className="text-blue-500" /> Total Invoiced
              </p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white">₹{totalBilled.toLocaleString()}</h4>
              <div className="h-1 w-12 bg-blue-500 rounded-full mt-2"></div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FiCheckCircle size={14} className="text-emerald-500" /> Total Paid (Wallet)
              </p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white">₹{totalPaid.toLocaleString()}</h4>
              <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2"></div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FiActivity size={14} className="text-indigo-500" /> Wallet Applied
              </p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white">₹{totalApplied.toLocaleString()}</h4>
              <div className="h-1 w-12 bg-indigo-500 rounded-full mt-2"></div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FiClock size={14} className="text-rose-500" /> Total Outstanding
              </p>
              <h4 className="text-2xl font-black text-rose-500">₹{totalUnpaid.toLocaleString()}</h4>
              <div className="h-1 w-12 bg-rose-500 rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <FiShield size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
            <h3 className="text-3xl font-black mb-4">₹{availableBalance.toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-indigo-100 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <FiTrendingUp size={12} /> Wallet Funds
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-xl group hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
              <FiClock size={24} />
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Outstanding Due</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">₹{totalUnpaid.toLocaleString()}</h3>
          <p className="text-rose-500 text-[10px] font-bold mt-2">To be settled</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-xl group hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <FiFileText size={24} />
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Total Billed</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">₹{totalBilled.toLocaleString()}</h3>
          <p className="text-blue-500 text-[10px] font-bold mt-2">All-time invoices</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-xl group hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
              <FiCheckCircle size={24} />
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Total Paid</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">₹{totalPaid.toLocaleString()}</h3>
          <p className="text-emerald-500 text-[10px] font-bold mt-2">Confirmed credits</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-white/5 p-2 gap-2 bg-gray-50/50 dark:bg-white/5">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex-1 py-4 px-6 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === "invoices" ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            <FiFileText size={18} /> INVOICES
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`flex-1 py-4 px-6 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === "credits" ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            <FiCreditCard size={18} /> WALLET CREDITS
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === "invoices" ? (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <p className="text-center py-10 text-gray-400 italic font-medium">No invoices generated yet for this cycle.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-2">Period</th>
                        <th className="px-6 py-2">Grand Total</th>
                        <th className="px-6 py-2">Applied</th>
                        <th className="px-6 py-2">Balance Due</th>
                        <th className="px-6 py-2">Status</th>
                        <th className="px-6 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group">
                          <td className="px-6 py-5 rounded-l-3xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                                <FiCalendar size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900 dark:text-white">
                                  {new Date(inv.period_from).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">To {new Date(inv.period_to).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{inv.grand_total}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-emerald-500">₹{inv.deposit_applied}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-sm font-black ${parseFloat(inv.amount_due) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              ₹{inv.amount_due}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              inv.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                              inv.status === 'partially_paid' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                              'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
                            }`}>
                              {inv.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-5 rounded-r-3xl text-right">
                            {inv.status !== 'paid' && (
                              <button 
                                onClick={() => handleSettle(inv.id)}
                                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                title="Settle with Wallet"
                              >
                                <FiArrowRight size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Transaction History</h4>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest">
                  <FiPlus size={16} /> New Credit
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {credits.length === 0 ? (
                  <p className="text-center py-10 text-gray-400 italic font-medium">No wallet transactions found.</p>
                ) : (
                  credits.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          c.status === 'captured' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                        }`}>
                          <FiDollarSign size={22} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{c.credit_type}</p>
                          <p className="text-xs text-gray-400 font-bold">{new Date(c.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900 dark:text-white">₹{c.amount}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          c.status === 'captured' ? 'text-emerald-500' : 'text-gray-400'
                        }`}>{c.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingSystem;
