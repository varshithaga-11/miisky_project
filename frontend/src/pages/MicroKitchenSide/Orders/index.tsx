import React, { useEffect, useState } from "react";
import { getMyOrders, updateOrderStatus, Order } from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiLoader, FiMapPin, FiTruck, FiBox, FiPhone, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../components/ui/button/Button";

const KitchenOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

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

    const handleStatusUpdate = async (orderId: number, status: string) => {
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, status);
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'delivered': return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
            case 'cancelled': return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-500/20";
            case 'placed': return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-500/20";
            case 'preparing': return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-500/20";
            case 'ready': return "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Order Management" description="Manage incoming meal orders" />
            <PageBreadcrumb pageTitle="Order Pipeline" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-32">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">Incoming Order Management</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Monitor and update real-time status as meals move through the kitchen and out for delivery.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800 rounded-[60px] shadow-sm">
                        <FiLoader className="animate-spin text-indigo-500 mb-6" size={48} />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Synchronizing with kitchen data...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[60px] p-24 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-10">
                            <FiPackage size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">No Active Orders</h3>
                        <p className="text-gray-400 mt-2 font-medium">New orders will appear here automatically as they are placed by patients and customers.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <AnimatePresence>
                            {orders.map((order) => (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-gray-800 rounded-[50px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl shadow-gray-200/40 dark:shadow-none hover:shadow-indigo-500/10 transition-all duration-300"
                                >
                                    <div className="p-10">
                                        {/* Order Status Ribbon and Customer Details */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b dark:border-white/5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 shadow-inner">
                                                    <FiPackage size={28} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Order Ref: #{order.id}</h3>
                                                        <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>{order.status}</span>
                                                    </div>
                                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                        <FiPhone className="text-gray-300" /> Customer Mobile: {order.user_details?.mobile || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {['accepted', 'preparing', 'ready', 'delivered'].map((status) => (
                                                    <Button 
                                                        key={status}
                                                        size="sm"
                                                        variant={order.status === status ? "primary" : "outline"}
                                                        onClick={() => handleStatusUpdate(order.id, status)}
                                                        disabled={updating === order.id}
                                                        className={`rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 py-6 border-none shadow-sm hover:scale-105 transition-transform ${order.status === status ? "bg-indigo-500 text-white" : "bg-gray-50 text-gray-400 dark:bg-white/[0.03]"}`}
                                                    >
                                                        {updating === order.id && order.status === status ? <FiLoader className="animate-spin" /> : status}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
                                            {/* Order Contents */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="p-2.5 bg-gray-50 dark:bg-white/[0.03] rounded-2xl shadow-inner">
                                                        <FiBox className="text-indigo-400" />
                                                    </div>
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Dish details & Quantities</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-6 p-5 rounded-3xl bg-gray-50 shadow-inner dark:bg-white/[0.03] border border-gray-50/5 dark:border-white/5">
                                                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-sm overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                                                                {item.food_details?.image ? <img src={item.food_details.image} alt="" className="w-full h-full object-cover rounded-2xl" /> : <div className="w-full h-full bg-gray-50"></div>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h5 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">{item.food_details?.name}</h5>
                                                                <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">Quantity: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Delivery Logistics */}
                                            <div className="space-y-8 bg-gray-50 shadow-inner p-8 dark:bg-gray-900/50 rounded-[45px]">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2 uppercase">
                                                        <FiTruck className="text-indigo-500" /> Supply Chain Logic
                                                    </h4>
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10">
                                                            <FiMapPin className="text-gray-400" size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination Address</p>
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic">{order.delivery_address}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-500/10 flex items-start gap-4">
                                                    <FiInfo className="text-amber-500 flex-shrink-0 mt-1" />
                                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest leading-relaxed">
                                                        Please ensure hygiene standards are maintained during packaging. Update status to 'Ready' once dispatched to the delivery partner.
                                                    </p>
                                                </div>
                                            </div>
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

export default KitchenOrdersPage;
