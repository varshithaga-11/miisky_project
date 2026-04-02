import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, Order, rateMicroKitchen, getLoggedProfile } from "../orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiPackage, FiClock, FiMapPin, FiCheckCircle, FiLoader, FiCalendar, FiBox, FiStar, FiMessageSquare } from "react-icons/fi";
import { OrderDeliverySummary } from "../../../components/orders/OrderDeliverySummary";
import { coordsFromFields, distanceKmBetween } from "../../../components/orders/orderGeo";
import { motion, AnimatePresence } from "framer-motion";

const RatingModal: React.FC<{
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ order, isOpen, onClose, onSuccess }) => {
    const existingRating = order.ratings && order.ratings.length > 0 ? order.ratings[0] : null;
    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [review, setReview] = useState(existingRating?.review || "");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (existingRating) {
            setRating(existingRating.rating);
            setReview(existingRating.review || "");
        }
    }, [existingRating]);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please provide a rating");
            return;
        }
        setSubmitting(true);
        try {
            await rateMicroKitchen(order.micro_kitchen, order.id, rating, review);
            toast.success(existingRating ? "Rating updated!" : "Thank you for your feedback!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit rating");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[50px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5"
            >
                <div className="p-12 space-y-10 text-center">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight mb-2 text-left">
                            {existingRating ? "Edit Your Feedback" : "Rate Your Experience"}
                        </h2>
                        <p className="text-gray-400 font-medium italic text-left">How was the food from {order.kitchen_details?.brand_name || "Premium Kitchen"}?</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star} 
                                onClick={() => setRating(star)}
                                className={`p-4 rounded-3xl transition-all ${rating >= star ? 'bg-amber-100 text-amber-500 shadow-xl scale-110' : 'bg-gray-50 text-gray-300 dark:bg-white/[0.03]'}`}
                            >
                                <FiStar className={`size-8 ${rating >= star ? 'fill-amber-500' : ''}`} />
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <FiMessageSquare className="absolute left-6 top-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <textarea 
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your thoughts on the meal quality, taste, and presentation..."
                            className="w-full pl-14 pr-8 py-6 bg-gray-50 dark:bg-white/[0.02] border-none rounded-[35px] shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm min-h-[160px] placeholder:text-gray-400 placeholder:font-medium"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-5 rounded-[25px] border-2 border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                            Later
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-[2] flex items-center justify-center gap-3 px-12 py-5 bg-indigo-500 hover:bg-indigo-600/90 text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : existingRating ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [profile, setProfile] = useState<{ latitude?: unknown; longitude?: unknown } | null>(null);
    const [profileLoaded, setProfileLoaded] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getMyOrders();
            setOrders((data as any).results || data);
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
                const p = await getLoggedProfile();
                setProfile(p ?? null);
            } catch {
                setProfile(null);
            } finally {
                setProfileLoaded(true);
            }
        })();
    }, []);

    const profileCoords = coordsFromFields(profile?.latitude, profile?.longitude);
    const missingProfileCoords = profileLoaded && !profileCoords;

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

                {missingProfileCoords && (
                    <div className="mb-8 rounded-[32px] border border-amber-200/80 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-500/30 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <FiMapPin className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={22} />
                            <div>
                                <p className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Add your location for delivery pricing</p>
                                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
                                    Your profile does not have latitude and longitude yet. Add them under{" "}
                                    <strong>Profile</strong> so we can measure distance to the micro kitchen and apply delivery
                                    charges from your kitchen&apos;s slabs. You can still order; once coordinates are saved,
                                    checkout will include distance-based delivery.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/profile-info"
                            className="shrink-0 inline-flex items-center justify-center rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 transition-colors"
                        >
                            Open profile
                        </Link>
                    </div>
                )}

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
                            {orders.map((order, idx) => {
                                const userRating = order.ratings && order.ratings.length > 0 ? order.ratings[0] : null;
                                const customerCoords =
                                    profileCoords ??
                                    coordsFromFields(order.user_details?.latitude, order.user_details?.longitude);
                                const kitchenCoords = coordsFromFields(
                                    order.kitchen_details?.latitude,
                                    order.kitchen_details?.longitude
                                );
                                const liveKm = distanceKmBetween(customerCoords, kitchenCoords);
                                let geoNote: string | null = null;
                                if (!kitchenCoords) {
                                    geoNote =
                                        "Kitchen coordinates are not on file — distance-based delivery may show ₹0 until the kitchen sets its location.";
                                } else if (!customerCoords) {
                                    geoNote =
                                        "Your account has no coordinates — add latitude/longitude under Profile to see live distance and to get delivery charges on future orders.";
                                }
                                return (
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
                                                    <div className="bg-gray-100 shadow-inner dark:bg-white/[0.03] p-5 rounded-3xl md:col-span-1">
                                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FiCheckCircle /> Order total</p>
                                                        <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">₹{Number(order.final_amount ?? order.total_amount).toFixed(2)}</p>
                                                        <p className="text-[9px] text-gray-400 mt-1">Incl. delivery where applicable</p>
                                                    </div>
                                                    <div className="col-span-2 bg-gray-50/50 dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-50 dark:border-white/5">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FiMapPin /> Delivery Location</p>
                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{order.delivery_address}</p>
                                                    </div>
                                                </div>

                                                <OrderDeliverySummary
                                                    order={order}
                                                    className="mt-2"
                                                    liveDistanceKm={liveKm}
                                                    liveDistanceLabel={
                                                        profileCoords
                                                            ? "Straight-line distance (your profile ↔ kitchen)"
                                                            : "Straight-line distance (account ↔ kitchen)"
                                                    }
                                                    geoNote={geoNote}
                                                />

                                                {/* Order Items Gallery & Existing Rating */}
                                                <div className="space-y-6">
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

                                                    {userRating && (
                                                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[35px] border border-amber-100/50 dark:border-amber-500/10 flex flex-col md:flex-row md:items-center gap-6">
                                                            <div className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-100 dark:border-white/5">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <FiStar key={s} size={14} className={s <= userRating.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                                                                ))}
                                                                <span className="ml-2 text-xs font-black text-gray-900 dark:text-white">{userRating.rating}/5</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-1 leading-none">Your Review</p>
                                                                <p className="text-sm font-bold text-gray-600 dark:text-gray-300 italic line-clamp-2">"{userRating.review || "No written review"}"</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tracking Visualizer Sidebar */}
                                            <div className="lg:w-80 bg-gray-50 shadow-inner flex flex-col justify-center items-center dark:bg-gray-900/50 p-10 rounded-[40px] border border-gray-50 dark:border-white/5 relative group/side overflow-hidden">
                                                <div className="relative z-10 flex flex-col items-center">
                                                    <FiClock className="size-10 text-indigo-100 dark:text-indigo-900/30 mb-4 group-hover/side:text-indigo-500 transition-colors" />
                                                    <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest text-center mb-1">Status Update</p>
                                                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 text-center uppercase mb-6">Kitchen is {order.status}</p>
                                                    
                                                    {order.status === 'delivered' && (
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setSelectedOrder(order)}
                                                            className={`px-8 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/5 transition-all flex items-center gap-2 ${
                                                                userRating 
                                                                ? "bg-amber-500 text-white border-transparent hover:bg-amber-600" 
                                                                : "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-500 hover:text-white"
                                                            }`}
                                                        >
                                                            <FiStar className="size-3" /> {userRating ? "Edit Review" : "Rate Food"}
                                                        </motion.button>
                                                    )}
                                                </div>
                                                <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-12 -translate-y-12 rotate-12">
                                                    <FiPackage size={120} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <RatingModal 
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={fetchOrders}
                />
            )}
        </div>
    );
};

export default OrdersPage;
