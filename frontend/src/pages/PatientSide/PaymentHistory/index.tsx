import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiTag, FiCalendar, FiExternalLink, FiDownload, FiCreditCard } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getPaymentHistory, Transaction } from "./api";

const PaymentHistoryPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getPaymentHistory();
            setTransactions(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getStatusStyles = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('verified') || lowerStatus === 'paid' || lowerStatus === 'success') {
            return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20";
        }
        if (lowerStatus.includes('pending')) {
            return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500/20";
        }
        if (lowerStatus.includes('failed') || lowerStatus.includes('rejected') || lowerStatus === 'cancelled') {
            return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20";
        }
        return "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-500/20";
    };

    const getStatusIcon = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('verified') || lowerStatus === 'paid') return <FiCheckCircle className="size-4" />;
        if (lowerStatus.includes('pending')) return <FiClock className="size-4" />;
        return <FiAlertCircle className="size-4" />;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Payment History" description="View your past transactions and receipts" />
            <PageBreadcrumb pageTitle="Transaction History" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-32">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">Billing & Payments</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Monitor your financial interactions within the platform.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-[60px] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-6"></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Fetching transaction logs...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[60px] p-24 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-10">
                            <FiDollarSign size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Transactions Yet</h3>
                        <p className="text-gray-400 mt-2 font-medium">Your subscription payments and meal orders will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {transactions.map((tx, idx) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-[35px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none hover:shadow-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300"
                                >
                                    <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-10">
                                        
                                        {/* Icon & Details */}
                                        <div className="flex items-start gap-6 flex-1">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                                tx.type === "Plan Purchase" ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20"
                                            }`}>
                                                {tx.type === "Plan Purchase" ? <FiTag size={24} /> : <FiCreditCard size={24} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">{tx.type}</span>
                                                   <span className="text-xs font-black text-gray-300 dark:text-gray-600">ID: {tx.id}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{tx.details}</h3>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                                                    <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><FiCalendar className="text-indigo-400" /> {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><FiCheckCircle className="text-indigo-400" /> Ref: {tx.reference}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount & Status */}
                                        <div className="flex items-center md:items-end flex-row md:flex-col justify-between md:justify-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">₹{Number(tx.amount).toFixed(2)}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total inclusive GST</p>
                                            </div>
                                            <div className={`px-5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyles(tx.status)}`}>
                                                {getStatusIcon(tx.status)}
                                                {tx.status}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 md:border-l dark:border-white/5 md:pl-10">
                                            {tx.screenshot ? (
                                                <a 
                                                    href={tx.screenshot} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center gap-2 grow min-w-[100px]"
                                                >
                                                    <FiExternalLink size={20} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Receipt</span>
                                                </a>
                                            ) : (
                                                <button 
                                                    onClick={() => toast.info("Receipt not available for this transaction")}
                                                    className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.01] text-gray-300 cursor-not-allowed flex flex-col items-center gap-2 grow min-w-[100px]"
                                                >
                                                    <FiDownload size={20} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">N/A</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistoryPage;
