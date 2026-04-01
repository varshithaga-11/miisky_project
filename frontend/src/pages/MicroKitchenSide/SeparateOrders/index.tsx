import React, { useEffect, useState } from "react";
import { getMyOrders, updateOrderStatus, Order } from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiLoader, FiMapPin, FiUser, FiCalendar, FiDollarSign, FiStar, FiMessageSquare, FiChevronDown, FiChevronUp, FiEye, FiSearch } from "react-icons/fi";
import { OrderDeliverySummary } from "../../../components/orders/OrderDeliverySummary";
import { coordsFromFields, distanceKmBetween } from "../../../components/orders/orderGeo";
import { getMyMicroKitchenProfile } from "../MicroKitchenQuestionare/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";

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
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getMyOrders(currentPage, pageSize, statusFilter, typeFilter, search);
            setOrders(data.results || []);
            setTotalItems(data.count || 0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, search ? 500 : 0); // Debounce search
        return () => clearTimeout(timer);
    }, [currentPage, pageSize, statusFilter, typeFilter, search]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, typeFilter, pageSize, search]);

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

    const totalPages = Math.ceil(totalItems / pageSize);

    const toggleRow = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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
                <div className="flex flex-wrap items-end gap-4 mb-8">
                    <div className="flex-1 min-w-[280px]">
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Search Customer Name / Address / Order ID</label>
                        <div className="relative group/search">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Start typing to search..."
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                    </div>
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
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Rows</label>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                        >
                            <option value={5}>5 Rows</option>
                            <option value={10}>10 Rows</option>
                            <option value={15}>15 Rows</option>
                            <option value={20}>20 Rows</option>
                            <option value={25}>25 Rows</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[40px]">
                        <FiLoader className="animate-spin text-indigo-500 mb-4" size={40} />
                        <p className="text-gray-400 font-bold text-sm">Loading orders...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/40">
                                        <TableCell isHeader className="px-6 py-4">Order ID</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Customer</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Type</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Status</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Amount</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Date</TableCell>
                                        <TableCell isHeader className="px-6 py-4 text-right">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <React.Fragment key={order.id}>
                                            <TableRow
                                                className={`hover:bg-gray-50/80 dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${expandedOrderId === order.id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                                onClick={() => toggleRow(order.id!)}
                                            >
                                                <TableCell className="px-6 py-4 font-black text-gray-900 dark:text-white">#{order.id}</TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 dark:text-white">{order.user_details?.first_name} {order.user_details?.last_name}</span>
                                                        <span className="text-xs text-gray-400">{order.user_details?.mobile}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
                                                        {order.order_type?.replace("_", " ")}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusStyles(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">
                                                    ₹{Number(order.final_amount ?? order.total_amount).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-xs text-gray-500">
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => toggleRow(order.id!)}
                                                            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 transition-all"
                                                        >
                                                            {expandedOrderId === order.id ? <FiChevronUp /> : <FiEye />}
                                                        </button>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id!, e.target.value)}
                                                            disabled={updating === order.id || order.status === "cancelled" || order.status === "delivered"}
                                                            className="text-[10px] font-black uppercase bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-0 cursor-pointer disabled:opacity-50 h-8"
                                                        >
                                                            <option value="placed">Placed</option>
                                                            <option value="accepted">Accepted</option>
                                                            <option value="preparing">Preparing</option>
                                                            <option value="ready">Ready</option>
                                                            <option value="picked_up">Picked Up</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expansion row */}
                                            <AnimatePresence>
                                                {expandedOrderId === order.id && (
                                                    <TableRow className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
                                                        <TableCell colSpan={7} className="px-8 py-8">
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                            >
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                    <div className="space-y-6">
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                                <FiPackage size={14} className="text-indigo-500" /> Items Breakdown
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {order.items?.map((item) => (
                                                                                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm">
                                                                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                                                                                            <img src={getImageUrl(item.food_details?.image)} className="w-full h-full object-cover" alt="" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-xs font-black text-gray-900 dark:text-white leading-tight">{item.food_details?.name}</p>
                                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.quantity} × ₹{item.price}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm">
                                                                            <OrderDeliverySummary
                                                                                order={order}
                                                                                className="!p-0"
                                                                                liveDistanceKm={distanceKmBetween(
                                                                                    coordsFromFields(order.user_details?.latitude, order.user_details?.longitude),
                                                                                    coordsFromFields(order.kitchen_details?.latitude || kitchenProfile?.latitude, order.kitchen_details?.longitude || kitchenProfile?.longitude)
                                                                                )}
                                                                                liveDistanceLabel="Straight-line distance"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                                <FiMapPin size={14} className="text-indigo-500" /> Delivery Details
                                                                            </h4>
                                                                            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm">
                                                                                <p className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-2">Address</p>
                                                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">{order.delivery_address}</p>
                                                                            </div>
                                                                        </div>

                                                                        {order.ratings && order.ratings.length > 0 && (
                                                                            <div>
                                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                                    <FiStar size={14} className="text-amber-500" /> Feedback
                                                                                </h4>
                                                                                <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/10">
                                                                                    <div className="flex items-center gap-1 mb-2">
                                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                                            <FiStar key={s} size={10} className={s <= order.ratings![0].rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} />
                                                                                        ))}
                                                                                    </div>
                                                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic">"{order.ratings[0].review}"</p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Buttons */}
                        <div className="mt-8 flex items-center justify-between">
                            <p className="text-xs text-gray-400 font-bold">
                                Showing <span className="text-gray-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                                <span className="text-gray-900 dark:text-white">
                                    {Math.min(currentPage * pageSize, totalItems)}
                                </span>{" "}
                                of <span className="text-gray-900 dark:text-white">{totalItems}</span> orders
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="!rounded-xl h-10 px-4"
                                >
                                    Previous
                                </Button>
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Show first, last, and pages around current
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "primary" : "outline"}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`!rounded-xl w-10 h-10 p-0 text-xs font-black ${currentPage === pageNum ? "shadow-lg shadow-indigo-500/20" : ""
                                                    }`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    } else if (
                                        (pageNum === currentPage - 2 && pageNum > 1) ||
                                        (pageNum === currentPage + 2 && pageNum < totalPages)
                                    ) {
                                        return <span key={pageNum} className="text-gray-400">...</span>;
                                    }
                                    return null;
                                })}
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="!rounded-xl h-10 px-4"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeparateOrdersPage;
