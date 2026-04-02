import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiCalendar, FiCreditCard, FiSearch, FiTrendingUp, FiShoppingBag, FiEye, FiMapPin, FiHash, FiTruck, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getOrderPaymentHistory } from "./api";
import { getApprovedMicroKitchens, MicroKitchenProfile } from "../../PatientSide/ListOfMicroKitchen/api";
import { useDebounce } from "../../../hooks/useDebounce";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";

const NonPatientPaymentHistoryPage: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({ total_orders: 0, total_amount: 0 });
    const [loading, setLoading] = useState(true);
    const [kitchens, setKitchens] = useState<MicroKitchenProfile[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    // Filter states
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [period, setPeriod] = useState("this_month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedKitchen, setSelectedKitchen] = useState("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                search: debouncedSearch,
                period,
                start_date: startDate,
                end_date: endDate,
                micro_kitchen: selectedKitchen === "all" ? "" : selectedKitchen,
                page: currentPage,
                limit: pageSize,
            };
            
            const data = await getOrderPaymentHistory(params);
            
            setTransactions(data.results);
            setTotalItems(data.count);
            setStats({
                total_orders: data.total_orders,
                total_amount: data.total_amount
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to refresh order data");
        } finally {
            setLoading(false);
        }
    };

    const fetchKitchenList = async () => {
        try {
            const data = await getApprovedMicroKitchens();
            setKitchens(data.results || []);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchKitchenList();
    }, []);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch, period, startDate, endDate, selectedKitchen, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, period, startDate, endDate, selectedKitchen]);

    const getStatusStyles = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'paid' || lowerStatus === 'success') {
            return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20";
        }
        if (lowerStatus === 'pending') {
            return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500/20";
        }
        if (lowerStatus === 'cancelled' || lowerStatus === 'failed') {
            return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20";
        }
        return "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-500/20";
    };

    const getStatusIcon = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'paid') return <FiCheckCircle className="size-4" />;
        if (lowerStatus === 'pending') return <FiClock className="size-4" />;
        return <FiAlertCircle className="size-4" />;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Order History" description="View your past meal orders and payments" />
            <PageBreadcrumb pageTitle="Order Payments" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-32">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">Order History</h1>
                        <p className="text-gray-500 mt-1 font-medium italic">Monitor your meal transactions and automated spending insights.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none flex items-center gap-6 min-w-[240px]">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                <FiShoppingBag size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stats.total_orders}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none flex items-center gap-6 min-w-[280px]">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                                <FiTrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spending</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">₹{Number(stats.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-gray-400 ml-1 tracking-widest">Search</label>
                        <div className="relative group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Order ID or address..."
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                         <label className="text-[10px] uppercase font-black text-gray-400 ml-1 tracking-widest">Kitchen</label>
                         <Select 
                            value={selectedKitchen}
                            onChange={setSelectedKitchen}
                            options={[
                                { value: "all", label: "All Kitchens" },
                                ...kitchens.map(k => ({ value: k.id.toString(), label: k.brand_name || "Unknown Kitchen" }))
                            ]}
                            className="!rounded-2xl"
                         />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-gray-400 ml-1 tracking-widest">Time Period</label>
                        <Select 
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { value: "all", label: "Lifetime" },
                                { value: "today", label: "Today" },
                                { value: "this_week", label: "This Week" },
                                { value: "this_month", label: "This Month" },
                                { value: "last_month", label: "Last Month" },
                                { value: "this_quarter", label: "This Quarter" },
                                { value: "this_year", label: "This Year" },
                                { value: "custom_range", label: "Custom Range" },
                            ]}
                            className="!rounded-2xl"
                        />
                    </div>

                    {period === "custom_range" && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex gap-3">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 ml-1 tracking-widest">From</label>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm outline-none text-sm font-bold"
                                />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-gray-400 ml-1 tracking-widest">To</label>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm outline-none text-sm font-bold"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-[60px] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-6"></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Fetching order logs...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[60px] p-24 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-10">
                            <FiDollarSign size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Orders Yet</h3>
                        <p className="text-gray-400 mt-2 font-medium">When you place orders, their payment status will appear here.</p>
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
                                        
                                        <div className="flex items-start gap-6 flex-1">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20">
                                                <FiCreditCard size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">{tx.type}</span>
                                                   <span className="text-xs font-black text-gray-300 dark:text-gray-600">ID: {tx.id}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{tx.details}</h3>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                                                    <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><FiCalendar className="text-emerald-500" /> {new Date(tx.date).toLocaleDateString()}</p>
                                                    <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500" /> Order: {tx.reference}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center md:items-end flex-row md:flex-col justify-between md:justify-center gap-8">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">₹{Number(tx.amount).toFixed(2)}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total inclusive GST</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => setSelectedOrder(tx.originalData)}
                                                    className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all flex items-center justify-center shadow-inner"
                                                    title="View Full Details"
                                                >
                                                    <FiEye size={20} />
                                                </button>
                                                <div className={`px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyles(tx.status)}`}>
                                                    {getStatusIcon(tx.status)}
                                                    {tx.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Pagination */}
                            {totalItems > pageSize && (
                                <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        Showing <span className="text-gray-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                                        <span className="text-gray-900 dark:text-white">{Math.min(currentPage * pageSize, totalItems)}</span> of {totalItems} entries
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setCurrentPage(prev => prev - 1)} 
                                            disabled={currentPage === 1 || loading}
                                            className="!rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest"
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {[...Array(Math.ceil(totalItems / pageSize))].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                                                        currentPage === i + 1 
                                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                                        : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setCurrentPage(prev => prev + 1)} 
                                            disabled={currentPage >= Math.ceil(totalItems / pageSize) || loading}
                                            className="!rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 md:p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest">Order Details</span>
                                            <span className="text-xs font-bold text-gray-400">#{selectedOrder.id}</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Transaction Log</h2>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedOrder(null)}
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 text-gray-400 hover:text-rose-500 transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-400">
                                                <FiCalendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordered On</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-400">
                                                <FiHash size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                                                <p className={`text-sm font-black uppercase tracking-tight ${selectedOrder.status === 'delivered' ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedOrder.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-400">
                                                <FiMapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Micro-Kitchen</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.kitchen_details?.brand_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-400">
                                                <FiTruck size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Type</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{selectedOrder.order_type}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b border-gray-100 dark:border-white/5 pb-2">Item Breakdown</h3>
                                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-3xl p-6 space-y-4 max-h-[200px] overflow-y-auto no-scrollbar">
                                        {selectedOrder.items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] font-black">
                                                        {item.quantity}x
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.food_details?.name}</p>
                                                </div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">₹{item.subtotal}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-[30px] p-8 text-white flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Final Settlement</p>
                                        <p className="text-3xl font-black tracking-tighter">₹{selectedOrder.final_amount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold opacity-60">Subtotal: ₹{selectedOrder.total_amount}</p>
                                        <p className="text-[10px] font-bold opacity-60">Delivery: ₹{selectedOrder.delivery_charge}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NonPatientPaymentHistoryPage;
