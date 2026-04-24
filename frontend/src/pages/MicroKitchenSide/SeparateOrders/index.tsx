import React, { useEffect, useState } from "react";
import {
    assignOrderDeliveryPerson,
    getMicroKitchenOrdersList,
    getMicroKitchenOrderDetail,
    updateOrderStatus,
    Order,
    MicroKitchenOrderListRow,
    getMicroKitchenOrderDeliveryFeedback,
    DeliveryFeedback,
} from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiLoader, FiMapPin, FiStar, FiChevronUp, FiEye, FiSearch, FiTruck } from "react-icons/fi";
import { OrderDeliverySummary } from "../../../components/orders/OrderDeliverySummary";
import { coordsFromFields, distanceKmBetween } from "../../../components/orders/orderGeo";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { fetchSupplyChainUsers, SupplyChainUser } from "../DeliveryManagement/api";
import { FilterBar } from "../../../components/common";

const SeparateOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<MicroKitchenOrderListRow[]>([]);
    const [orderDetailById, setOrderDetailById] = useState<Record<number, Order>>({});
    const [deliveryFeedbackByOrderId, setDeliveryFeedbackByOrderId] = useState<Record<number, DeliveryFeedback[]>>({});
    const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [teamUsers, setTeamUsers] = useState<SupplyChainUser[]>([]);
    const [roleFilterByOrder, setRoleFilterByOrder] = useState<Record<number, "all" | "primary" | "backup" | "temporary">>({});
    const [selectedPersonByOrder, setSelectedPersonByOrder] = useState<Record<number, string>>({});
    const [savingDeliveryForOrderId, setSavingDeliveryForOrderId] = useState<number | null>(null);
    const [idForFeedback, setIdForFeedback] = useState<number | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [period, setPeriod] = useState("today");
    const [logisticsFilter, setLogisticsFilter] = useState<string>("all");

    const fetchOrders = async (p = 1, isLoadMore = false, s = search, st = statusFilter, t = typeFilter, sd = startDate, ed = endDate, per = period, log = logisticsFilter) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const data = await getMicroKitchenOrdersList(p, 10, st, t, s, per, sd, ed, log);
            if (isLoadMore) {
                setOrders(prev => [...prev, ...(data.results || [])]);
            } else {
                setOrders(data.results || []);
            }
            setTotalItems(data.count || 0);
            setCurrentPage(data.currentPage || p);
            setHasMore(data.currentPage! < data.totalPages!);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load orders");
            if (!isLoadMore) setOrders([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadOrderDetail = async (orderId: number, force = false) => {
        if (!force && orderDetailById[orderId]) return;
        setDetailLoadingId(orderId);
        try {
            const data = await getMicroKitchenOrderDetail(orderId);
            setOrderDetailById((prev) => ({ ...prev, [orderId]: data }));
            try {
                const feedbacks = await getMicroKitchenOrderDeliveryFeedback(orderId);
                setDeliveryFeedbackByOrderId((prev) => ({ ...prev, [orderId]: feedbacks }));
            } catch {
                setDeliveryFeedbackByOrderId((prev) => ({ ...prev, [orderId]: [] }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load order details");
        } finally {
            setDetailLoadingId(null);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(1, false, search, statusFilter, typeFilter, startDate, endDate, period, logisticsFilter);
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [search, statusFilter, typeFilter, startDate, endDate, period, logisticsFilter]);

    useEffect(() => {
        const loadTeam = async () => {
            try {
                const users = await fetchSupplyChainUsers();
                setTeamUsers(users);
            } catch (error) {
                console.error(error);
            }
        };
        loadTeam();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                fetchOrders(currentPage + 1, true);
            }
        }, { threshold: 0.1 });
        const el = document.getElementById("order-sentinel");
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, currentPage]);

    const handleStatusUpdate = async (orderId: number, status: string) => {
        setUpdating(orderId);
        try {
            await updateOrderStatus(orderId, status);
            toast.success(`Order marked as ${status}`);
            setOrderDetailById((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
            await fetchOrders();
            if (expandedOrderId === orderId) {
                await loadOrderDetail(orderId, true);
            }
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

    const getImageUrl = (path: string | undefined | null): string | undefined => {
        if (!path) return undefined;
        if (path.startsWith("http")) return path;
        return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    const toggleRow = (orderId: number) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            return;
        }
        setExpandedOrderId(orderId);
        void loadOrderDetail(orderId);
    };

    const filteredTeamMembersForOrder = (orderId: number): SupplyChainUser[] => {
        const role = roleFilterByOrder[orderId] || "all";
        if (role === "all") return teamUsers;
        return teamUsers.filter((u) => u.team_role === role);
    };

    /** Include the saved assignee in the list even if role filter would hide them. */
    const deliveryPersonOptionsForOrder = (order: Order): SupplyChainUser[] => {
        const base = filteredTeamMembersForOrder(order.id!);
        const pid = order.delivery_person;
        if (pid == null) return base;
        if (base.some((u) => u.id === pid)) return base;
        const extra = teamUsers.find((u) => u.id === pid);
        return extra ? [extra, ...base] : base;
    };

    const deliveryPersonSelectValue = (order: Order): string => {
        const oid = order.id!;
        if (selectedPersonByOrder[oid] !== undefined) return selectedPersonByOrder[oid];
        return order.delivery_person != null ? String(order.delivery_person) : "";
    };

    const saveDeliveryAssignment = async (order: Order) => {
        const oid = order.id!;
        const raw = deliveryPersonSelectValue(order);
        const personId = raw === "" ? null : parseInt(raw, 10);
        if (raw !== "" && !Number.isFinite(personId)) {
            toast.error("Choose a valid delivery person or clear the selection.");
            return;
        }
        setSavingDeliveryForOrderId(oid);
        try {
            await assignOrderDeliveryPerson(oid, personId);
            toast.success("Delivery assignment saved.");
            setSelectedPersonByOrder((prev) => {
                const next = { ...prev };
                delete next[oid];
                return next;
            });
            setOrderDetailById((prev) => {
                const next = { ...prev };
                delete next[oid];
                return next;
            });
            await fetchOrders();
            await loadOrderDetail(oid, true);
        } catch (error) {
            console.error(error);
            toast.error("Could not save delivery person.");
        } finally {
            setSavingDeliveryForOrderId(null);
        }
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
                <div className="space-y-6 mb-8">
                    <div className="flex flex-wrap items-end gap-4">
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
                                className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
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
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="patient">Patient</option>
                                <option value="non_patient">Non Patient</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Logistics Partner</label>
                            <select
                                value={logisticsFilter}
                                onChange={(e) => setLogisticsFilter(e.target.value)}
                                className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                            >
                                <option value="all">All Partners</option>
                                {teamUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <FilterBar 
                        startDate={startDate}
                        endDate={endDate}
                        activePeriod={period}
                        onPeriodChange={setPeriod}
                        onFilterChange={(s: string, e: string, p: string) => {
                            setStartDate(s);
                            setEndDate(e);
                            setPeriod(p);
                        }}
                    />
                </div>

                {loading && currentPage === 1 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[40px]">
                        <FiLoader className="animate-spin text-indigo-500 mb-4" size={40} />
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Synchronizing records...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl">
                            <div className="overflow-x-auto overscroll-x-contain">
                                <Table className="min-w-[900px]">
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/40">
                                        <TableCell isHeader className="px-6 py-4">Customer</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Mobile</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Type</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Status</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Amount</TableCell>
                                        <TableCell isHeader className="px-6 py-4">Date</TableCell>
                                        <TableCell isHeader className="px-6 py-4 text-center">Logistics</TableCell>
                                        <TableCell isHeader className="px-6 py-4 text-right">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-6 py-32 text-center text-gray-400 font-black uppercase tracking-widest">
                                                No orders match your criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                    orders.map((order) => {
                                        const fullOrder = orderDetailById[order.id];
                                        return (
                                        <React.Fragment key={order.id}>
                                            <TableRow
                                                className={`hover:bg-gray-50/80 dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${expandedOrderId === order.id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                                onClick={() => toggleRow(order.id!)}
                                            >
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-[10px] uppercase">
                                                            {order.customer_name?.[0] || 'C'}
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                                            {order.customer_name?.trim() || "—"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-xs font-bold text-gray-500 group-hover:text-indigo-500 transition-colors">
                                                    {order.customer_mobile?.trim() || "—"}
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-[9px] font-black uppercase text-gray-400 border border-gray-100 dark:border-white/5 tracking-widest">
                                                        {order.order_type?.replace("_", " ")}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic border shadow-sm ${getStatusStyles(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400 italic">
                                                    ₹{Number(order.final_amount).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-center">
                                                    {order.delivery_person_details ? (
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 tracking-tighter italic">
                                                            <FiTruck size={12} />
                                                            {order.delivery_person_details.first_name} {order.delivery_person_details.last_name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest italic">Pending</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => toggleRow(order.id!)}
                                                            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            {expandedOrderId === order.id ? <FiChevronUp /> : <FiEye />}
                                                        </button>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id!, e.target.value)}
                                                            disabled={updating === order.id || order.status === "cancelled" || order.status === "delivered"}
                                                            className="text-[9px] font-black uppercase bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-xl focus:ring-0 cursor-pointer disabled:opacity-50 h-9 px-3 tracking-widest italic"
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

                                            <AnimatePresence>
                                                {expandedOrderId === order.id && (
                                                    <TableRow className="border-t border-gray-50 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.005]">
                                                        <TableCell colSpan={7} className="px-8 py-8">
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.98 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.98 }}
                                                            >
                                                                {detailLoadingId === order.id && !fullOrder ? (
                                                                    <div className="flex items-center gap-4 text-gray-400 py-12">
                                                                        <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Decrypting order details…</span>
                                                                    </div>
                                                                ) : fullOrder ? (
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                    <div className="space-y-8">
                                                                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-50 dark:border-white/5 shadow-sm">
                                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                                                <FiPackage size={14} className="text-indigo-500" /> Manifest Breakdown
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                                {fullOrder.items?.map((item) => {
                                                                                    const itemImageUrl = getImageUrl(item.food_details?.image);
                                                                                    return (
                                                                                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/50 border border-transparent hover:border-indigo-100 transition-all group">
                                                                                        <div className="size-14 rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 flex-shrink-0">
                                                                                            {itemImageUrl ? (
                                                                                                <img
                                                                                                    src={itemImageUrl}
                                                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                                                    alt=""
                                                                                                />
                                                                                            ) : <div className="w-full h-full flex items-center justify-center text-gray-200"><FiPackage size={20} /></div>}
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">{item.food_details?.name}</p>
                                                                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">{item.quantity} QTY × ₹{item.price}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        <div className="p-1 rounded-3xl bg-white dark:bg-gray-800 border border-gray-50 dark:border-white/5 shadow-sm">
                                                                            <OrderDeliverySummary
                                                                                order={fullOrder}
                                                                                className="!p-6"
                                                                                liveDistanceKm={distanceKmBetween(
                                                                                    coordsFromFields(fullOrder.user_details?.latitude, fullOrder.user_details?.longitude),
                                                                                    coordsFromFields(fullOrder.kitchen_details?.latitude, fullOrder.kitchen_details?.longitude)
                                                                                )}
                                                                                liveDistanceLabel="Straight-line distance (Kitchen to Patient)"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-8">
                                                                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-50 dark:border-white/5 shadow-sm">
                                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                                                <FiMapPin size={14} className="text-indigo-500" /> Logistics Assignment
                                                                            </h4>
                                                                            <div className="mb-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 p-5 space-y-4">
                                                                                <div className="flex flex-col sm:flex-row gap-3">
                                                                                    <select
                                                                                        value={roleFilterByOrder[order.id!] || "all"}
                                                                                        onChange={(e) =>
                                                                                            setRoleFilterByOrder((prev) => ({
                                                                                                ...prev,
                                                                                                [order.id!]: e.target.value as "all" | "primary" | "backup" | "temporary",
                                                                                            }))
                                                                                        }
                                                                                        className="flex-1 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-white dark:bg-gray-900 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest"
                                                                                    >
                                                                                        <option value="all">Filer Role</option>
                                                                                        <option value="primary">Primary</option>
                                                                                        <option value="backup">Backup</option>
                                                                                        <option value="temporary">Temporary</option>
                                                                                    </select>
                                                                                    <select
                                                                                        value={deliveryPersonSelectValue(fullOrder)}
                                                                                        onChange={(e) =>
                                                                                            setSelectedPersonByOrder((prev) => ({
                                                                                                ...prev,
                                                                                                [order.id!]: e.target.value,
                                                                                            }))
                                                                                        }
                                                                                        className="flex-[2] rounded-xl border border-indigo-100 dark:border-indigo-900 bg-white dark:bg-gray-900 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest italic"
                                                                                    >
                                                                                        <option value="">Unassigned</option>
                                                                                        {deliveryPersonOptionsForOrder(fullOrder).map((u) => (
                                                                                            <option key={u.id} value={u.id}>
                                                                                                {`${u.first_name || ""} ${u.last_name || ""}`.trim()}
                                                                                                {u.team_role ? ` (${u.team_role})` : ""}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="primary"
                                                                                    className="w-full !rounded-xl !py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                                                                                    disabled={savingDeliveryForOrderId === order.id}
                                                                                    onClick={() => saveDeliveryAssignment(fullOrder)}
                                                                                >
                                                                                    {savingDeliveryForOrderId === order.id ? "Synchronizing…" : "Confirm Logistics Update"}
                                                                                </Button>
                                                                            </div>
                                                                            
                                                                            <div className="space-y-6 px-2">
                                                                                <div>
                                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary address</p>
                                                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 italic group-hover:text-indigo-600 transition-colors">
                                                                                        {fullOrder.delivery_address?.trim() || "—"}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">GPS Verification</p>
                                                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 italic">
                                                                                        {fullOrder.delivery_lat_lng_address?.trim() || "—"}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {fullOrder.ratings && fullOrder.ratings.length > 0 && (
                                                                            <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-500/10">
                                                                                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                                    <FiStar size={14} /> Consumer Experience
                                                                                </h4>
                                                                                <div className="flex items-center gap-1 mb-3">
                                                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                                                        <FiStar key={s} size={12} className={s <= fullOrder.ratings![0].rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                                                                                    ))}
                                                                                </div>
                                                                                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 italic leading-relaxed">"{fullOrder.ratings[0].review}"</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                ) : (
                                                                    <div className="py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">Failed to retrieve unit record.</div>
                                                                )}
                                                            </motion.div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                        );
                                    })
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                        </div>

                        {hasMore && (
                            <div id="order-sentinel" className="py-12 flex items-center justify-center">
                                <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeparateOrdersPage;
