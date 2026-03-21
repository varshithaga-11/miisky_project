import React, { useEffect, useState } from "react";
import { getMyOrders, updateOrderStatus, Order } from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiLoader, FiMapPin, FiUser, FiCalendar, FiDollarSign } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const SeparateOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getMyOrders();
            setOrders(Array.isArray(data) ? data : data?.results ?? []);
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

    const filteredOrders = orders.filter((o) => {
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (typeFilter !== "all" && o.order_type !== typeFilter) return false;
        return true;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "cancelled":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "placed":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "accepted":
                return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
            case "preparing":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "ready":
                return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
            case "picked_up":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    const getImageUrl = (path: string | undefined | null) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Customer Orders" description="View all orders from users for your kitchen" />
            <PageBreadcrumb pageTitle="Customer Orders" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Orders from Users</h1>
                    <p className="text-gray-500 mt-1 font-medium">All orders placed by customers for your micro kitchen.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="placed">Placed</option>
                            <option value="accepted">Accepted</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Order Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                        >
                            <option value="all">All Types</option>
                            <option value="patient">Patient</option>
                            <option value="non_patient">Non Patient</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[40px]">
                        <FiLoader className="animate-spin text-indigo-500 mb-4" size={40} />
                        <p className="text-gray-400 font-bold text-sm">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-[30px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-6">
                            <FiPackage size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">No Orders Found</h3>
                        <p className="text-gray-400 mt-2">
                            {orders.length === 0
                                ? "No orders have been placed for your kitchen yet."
                                : "No orders match the selected filters."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {filteredOrders.map((order, idx) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-xl"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        {/* Order info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Order #{order.id}</h3>
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${getStatusStyles(order.status)}`}
                                                >
                                                    {order.status}
                                                </span>
                                                <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold">
                                                    {order.order_type?.replace("_", " ")}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-6">
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="text-gray-400" size={16} />
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        {order.user_details?.first_name} {order.user_details?.last_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Mobile:</span>
                                                    <span className="text-sm font-bold">{order.user_details?.mobile || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiCalendar className="text-gray-400" size={14} />
                                                    <span className="text-xs text-gray-500">
                                                        {order.created_at
                                                            ? new Date(order.created_at).toLocaleString()
                                                            : "—"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiDollarSign className="text-emerald-500" size={16} />
                                                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                                        ₹{Number(order.total_amount)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                                <FiMapPin className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address}</p>
                                            </div>
                                        </div>

                                        {/* Status actions */}
                                        <div className="flex flex-wrap gap-2">
                                            {["accepted", "preparing", "ready", "delivered"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(order.id!, status)}
                                                    disabled={updating === order.id || order.status === "cancelled"}
                                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                                                        order.status === status
                                                            ? "bg-indigo-600 text-white"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600"
                                                    } disabled:opacity-50`}
                                                >
                                                    {updating === order.id ? <FiLoader className="animate-spin inline" size={12} /> : status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order items */}
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Items</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {order.items?.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50"
                                                >
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0">
                                                        {item.food_details?.image ? (
                                                            <img
                                                                src={getImageUrl(item.food_details.image)}
                                                                alt={item.food_details.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <FiPackage size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{item.food_details?.name || "Item"}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.price)}</p>
                                                        <p className="text-sm font-black text-indigo-600">₹{Number(item.subtotal)}</p>
                                                    </div>
                                                </div>
                                            ))}
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

export default SeparateOrdersPage;
