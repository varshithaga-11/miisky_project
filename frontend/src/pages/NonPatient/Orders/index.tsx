import React, { useEffect, useState } from "react";
import { getMyOrders, Order } from "../orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiClock, FiMapPin, FiCheckCircle, FiLoader, FiCalendar, FiBox } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'delivered': return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
            case 'cancelled': return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-500/20";
            case 'placed': return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-500/20";
            default: return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-500/20";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="My Orders" description="Track your micro-kitchen meal orders" />
            <PageBreadcrumb pageTitle="Order History" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-32">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">Your Culinary Journey</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Track the real-time status of your personalized meal bookings.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-[60px] shadow-sm border border-gray-100 dark:border-white/5">
                        <FiLoader className="animate-spin text-indigo-500 mb-6" size={48} />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Retrieving your order history...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[60px] p-24 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-10">
                            <FiPackage size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Orders Placed Yet</h3>
                        <p className="text-gray-400 mt-2 font-medium">Your historical meal bookings will appear here once you place an order.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <AnimatePresence>
                            {orders.map((order, idx) => (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-[50px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/40 dark:shadow-none hover:shadow-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300"
                                >
                                    <div className="p-10 flex flex-col lg:flex-row justify-between gap-10">
                                        <div className="flex-1 space-y-8">
                                            {/* Order Identity */}
                                            <div className="flex items-center gap-6 pb-6 border-b dark:border-white/5">
                                                <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center text-indigo-500 shadow-inner">
                                                    <FiBox size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Order Ref: #{order.id}</p>
                                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{order.kitchen_details?.brand_name || "Premium Kitchen"}</h3>
                                                </div>
                                                <div className={`ml-auto px-6 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                                    {order.status}
                                                </div>
                                            </div>

                                            {/* Order Details Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                <div className="bg-gray-50/50 dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-50 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FiCalendar /> Order Date</p>
                                                    <p className="text-xs font-black text-gray-900 dark:text-white">{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <div className="bg-gray-100 shadow-inner dark:bg-white/[0.03] p-5 rounded-3xl">
                                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FiCheckCircle /> Total amount</p>
                                                    <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">₹{order.total_amount}</p>
                                                </div>
                                                <div className="col-span-2 bg-gray-50/50 dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-50 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FiMapPin /> Delivery Location</p>
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{order.delivery_address}</p>
                                                </div>
                                            </div>

                                            {/* Order Items Gallery */}
                                            <div className="flex flex-wrap gap-4 pt-4">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-gray-700/50 p-3 pr-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                                                            {item.food_details?.image ? (
                                                                <img src={item.food_details.image} alt={item.food_details.name} className="w-full h-full object-cover rounded-xl" />
                                                            ) : <FiBox className="w-full h-full p-2 text-gray-200" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{item.food_details?.name}</p>
                                                            <p className="text-[9px] font-bold text-gray-400">× {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tracking Visualizer Sidebar Placeholder */}
                                        <div className="lg:w-80 bg-gray-50 shadow-inner flex flex-col justify-center items-center dark:bg-gray-900/50 p-10 rounded-[40px] border border-gray-50 dark:border-white/5">
                                            <FiClock className="size-10 text-indigo-100 mb-4" />
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center mb-1">Status Update</p>
                                            <p className="text-xs font-black text-gray-400 text-center uppercase">Kitchen is {order.status}</p>
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

export default OrdersPage;
