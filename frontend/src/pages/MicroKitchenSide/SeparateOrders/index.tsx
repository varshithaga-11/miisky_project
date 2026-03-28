import React, { useEffect, useState } from "react";
import { getMyOrders, updateOrderStatus, Order } from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiLoader, FiMapPin, FiUser, FiCalendar, FiDollarSign, FiStar, FiMessageSquare } from "react-icons/fi";
import { OrderDeliverySummary } from "../../../components/orders/OrderDeliverySummary";
import { coordsFromFields, distanceKmBetween } from "../../../components/orders/orderGeo";
import { getMyMicroKitchenProfile } from "../MicroKitchenQuestionare/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const SeparateOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [kitchenProfile, setKitchenProfile] = useState<{ latitude?: number | null; longitude?: number | null } | null>(
        null
    );
    const [kitchenProfileLoaded, setKitchenProfileLoaded] = useState(false);
    const [updating, setUpdating] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

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

    useEffect(() => {
        (async () => {
            try {
                const p = await getMyMicroKitchenProfile();
                setKitchenProfile(p ?? null);
            } catch {
                setKitchenProfile(null);
            } finally {
                setKitchenProfileLoaded(true);
            }
        })();
    }, []);

    const kitchenAccountCoords = coordsFromFields(kitchenProfile?.latitude, kitchenProfile?.longitude);
    const showKitchenCoordsBanner = kitchenProfileLoaded && !kitchenAccountCoords;

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

                {showKitchenCoordsBanner && (
                    <div className="mb-8 rounded-[28px] border border-amber-200/80 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-500/30 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <FiMapPin className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">
                                    Set your kitchen GPS for delivery charges
                                </p>
                                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
                                    Your kitchen account has no latitude/longitude. Add them under{" "}
                                    <strong>Profile</strong> (or your kitchen questionnaire flow) so customer distance and slab
                                    pricing apply at checkout.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/profile-info"
                            className="shrink-0 text-center rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5"
                        >
                            Open profile
                        </Link>
                    </div>
                )}

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
                            {filteredOrders.map((order, idx) => {
                                const userRating = order.ratings && order.ratings.length > 0 ? order.ratings[0] : null;
                                const kitchenCoords =
                                    coordsFromFields(order.kitchen_details?.latitude, order.kitchen_details?.longitude) ??
                                    kitchenAccountCoords;
                                const customerCoords = coordsFromFields(
                                    order.user_details?.latitude,
                                    order.user_details?.longitude
                                );
                                const liveKm = distanceKmBetween(customerCoords, kitchenCoords);
                                let geoNote: string | null = null;
                                if (!kitchenCoords) {
                                    geoNote = "Kitchen coordinates missing — cannot show live distance.";
                                } else if (!customerCoords) {
                                    geoNote =
                                        "Customer has no latitude/longitude on file — delivery charge at checkout may be ₹0. Ask them to update Profile for distance-based fees.";
                                }
                                return (
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
                                                            ₹{Number(order.final_amount ?? order.total_amount).toFixed(2)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">total</span>
                                                    </div>
                                                </div>

                                                <OrderDeliverySummary
                                                    order={order}
                                                    className="mt-2"
                                                    liveDistanceKm={liveKm}
                                                    liveDistanceLabel="Straight-line distance (customer ↔ your kitchen)"
                                                    geoNote={geoNote}
                                                />

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

                                        {/* Order details section */}
                                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                                            <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                                                {/* Items breakdown */}
                                                <div className="flex-1 w-full">
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <FiPackage size={14} className="text-indigo-500" /> Items Breakdown
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {order.items?.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/5"
                                                            >
                                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0 shadow-inner">
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
                                                                    <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5 leading-tight">{item.food_details?.name || "Item"}</p>
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Qty: {item.quantity} × ₹{Number(item.price)}</p>
                                                                    <p className="text-xs font-black text-indigo-600 mt-1">₹{Number(item.subtotal)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* User Rating Display */}
                                                {userRating && (
                                                    <div className="lg:w-96 w-full shrink-0">
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <FiStar size={14} className="text-amber-500" /> Customer Feedback
                                                        </h4>
                                                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[35px] border border-amber-100/50 dark:border-amber-500/10 relative overflow-hidden group/rating">
                                                            <div className="relative z-10">
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <div className="flex px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-white/5 items-center gap-1">
                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                            <FiStar key={s} size={12} className={s <= userRating.rating ? "text-amber-500 fill-amber-500" : "text-gray-100 dark:text-gray-700"} />
                                                                        ))}
                                                                        <span className="text-[10px] font-black text-gray-900 dark:text-white ml-1">{userRating.rating}/5</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Verified Rating</span>
                                                                </div>
                                                                <div className="flex gap-4">
                                                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-2xl h-fit shadow-sm border border-amber-50">
                                                                        <FiMessageSquare size={16} className="text-amber-500" />
                                                                    </div>
                                                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300 italic flex-1 leading-relaxed">
                                                                        "{userRating.review || "Excellent service and food quality!"}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-0 right-0 p-8 opacity-5 translate-x-8 -translate-y-8 rotate-12 scale-150 transition-transform group-hover/rating:scale-[1.7] duration-700">
                                                                <FiStar size={60} className="text-amber-500 fill-amber-500" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeparateOrdersPage;
