import React, { useEffect, useState } from "react";
import {
    assignOrderDeliveryPerson,
    getMicroKitchenOrdersList,
    getMicroKitchenOrderDetail,
    updateOrderStatus,
    Order,
    MicroKitchenOrderListRow,
} from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiLoader, FiMapPin, FiStar, FiChevronUp, FiEye, FiSearch } from "react-icons/fi";
import { OrderDeliverySummary } from "../../../components/orders/OrderDeliverySummary";
import { coordsFromFields, distanceKmBetween } from "../../../components/orders/orderGeo";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { fetchSupplyChainUsers, SupplyChainUser } from "../DeliveryManagement/api";

const SeparateOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<MicroKitchenOrderListRow[]>([]);
    const [orderDetailById, setOrderDetailById] = useState<Record<number, Order>>({});
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

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getMicroKitchenOrdersList(currentPage, pageSize, statusFilter, typeFilter, search);
            setOrders(data.results || []);
            setTotalItems(data.count || 0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetail = async (orderId: number, force = false) => {
        if (!force && orderDetailById[orderId]) return;
        setDetailLoadingId(orderId);
        try {
            const data = await getMicroKitchenOrderDetail(orderId);
            setOrderDetailById((prev) => ({ ...prev, [orderId]: data }));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load order details");
        } finally {
            setDetailLoadingId(null);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, search ? 500 : 0); // Debounce search
        return () => clearTimeout(timer);
    }, [currentPage, pageSize, statusFilter, typeFilter, search]);

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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, typeFilter, pageSize, search]);

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
                                        <TableCell isHeader className="px-6 py-4 text-right">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-6 py-16 text-center text-gray-500 font-medium">
                                                No orders match your filters.
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
                                                <TableCell className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                    {order.customer_name?.trim() || "—"}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {order.customer_mobile?.trim() || "—"}
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
                                                    ₹{Number(order.final_amount).toFixed(2)}
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
                                                                {detailLoadingId === order.id && !fullOrder ? (
                                                                    <div className="flex items-center gap-3 text-gray-500 py-6">
                                                                        <FiLoader className="animate-spin text-indigo-500" size={24} />
                                                                        <span className="text-sm font-bold">Loading order #{order.id}…</span>
                                                                    </div>
                                                                ) : fullOrder ? (
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                    <div className="space-y-6">
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                                <FiPackage size={14} className="text-indigo-500" /> Items Breakdown
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {fullOrder.items?.map((item) => {
                                                                                    const itemImageUrl = getImageUrl(item.food_details?.image);
                                                                                    return (
                                                                                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm">
                                                                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                                                                                            {itemImageUrl ? (
                                                                                                <img
                                                                                                    src={itemImageUrl}
                                                                                                    className="w-full h-full object-cover"
                                                                                                    alt=""
                                                                                                />
                                                                                            ) : null}
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-xs font-black text-gray-900 dark:text-white leading-tight">{item.food_details?.name}</p>
                                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.quantity} × ₹{item.price}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm">
                                                                            <OrderDeliverySummary
                                                                                order={fullOrder}
                                                                                className="!p-0"
                                                                                liveDistanceKm={distanceKmBetween(
                                                                                    coordsFromFields(fullOrder.user_details?.latitude, fullOrder.user_details?.longitude),
                                                                                    coordsFromFields(fullOrder.kitchen_details?.latitude, fullOrder.kitchen_details?.longitude)
                                                                                )}
                                                                                liveDistanceLabel="Straight-line distance (Kitchen to Patient)"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                                <FiMapPin size={14} className="text-indigo-500" /> Delivery Details
                                                                            </h4>
                                                                            <div className="mb-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 p-3">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">
                                                                                    Assign from team members
                                                                                </p>
                                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                                                                                    Saved on the order in the database (<span className="font-mono">app_order.delivery_person_id</span>
                                                                                    ). Use Save to persist; the dropdown alone only updates this screen until you save.
                                                                                </p>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                    <select
                                                                                        value={roleFilterByOrder[order.id!] || "all"}
                                                                                        onChange={(e) =>
                                                                                            setRoleFilterByOrder((prev) => ({
                                                                                                ...prev,
                                                                                                [order.id!]: e.target.value as "all" | "primary" | "backup" | "temporary",
                                                                                            }))
                                                                                        }
                                                                                        className="rounded-lg border-none bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs font-bold"
                                                                                    >
                                                                                        <option value="all">All roles</option>
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
                                                                                        className="rounded-lg border-none bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs font-bold"
                                                                                    >
                                                                                        <option value="">None / unassigned</option>
                                                                                        {deliveryPersonOptionsForOrder(fullOrder).map((u) => (
                                                                                            <option key={u.id} value={u.id}>
                                                                                                {`${u.first_name || ""} ${u.last_name || ""}`.trim()}
                                                                                                {u.team_role ? ` (${u.team_role})` : ""}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </div>
                                                                                {fullOrder.delivery_person_details && (
                                                                                    <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                                                                                        Currently saved:{" "}
                                                                                        <span className="font-bold text-gray-700 dark:text-gray-300">
                                                                                            {`${fullOrder.delivery_person_details.first_name || ""} ${fullOrder.delivery_person_details.last_name || ""}`.trim() ||
                                                                                                `#${fullOrder.delivery_person}`}
                                                                                        </span>
                                                                                    </p>
                                                                                )}
                                                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                                                    <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="primary"
                                                                                        className="!rounded-xl !px-4 !py-2 text-xs font-black"
                                                                                        disabled={savingDeliveryForOrderId === order.id}
                                                                                        onClick={() => saveDeliveryAssignment(fullOrder)}
                                                                                    >
                                                                                        {savingDeliveryForOrderId === order.id ? "Saving…" : "Save delivery person"}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                                                                                <div>
                                                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-2">Street address</p>
                                                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                                        {fullOrder.delivery_address?.trim() || "—"}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-2">Address from map / GPS</p>
                                                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                                        {fullOrder.delivery_lat_lng_address?.trim() || "—"}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {fullOrder.ratings && fullOrder.ratings.length > 0 && (
                                                                            <div>
                                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                                    <FiStar size={14} className="text-amber-500" /> Feedback
                                                                                </h4>
                                                                                <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/10">
                                                                                    <div className="flex items-center gap-1 mb-2">
                                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                                            <FiStar key={s} size={10} className={s <= fullOrder.ratings![0].rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} />
                                                                                        ))}
                                                                                    </div>
                                                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic">"{fullOrder.ratings[0].review}"</p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500">Could not load this order.</p>
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
