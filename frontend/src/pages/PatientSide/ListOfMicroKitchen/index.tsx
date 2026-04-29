import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getApprovedMicroKitchens, MicroKitchenProfile } from "./api";
import { getAllKitchenReviews, MicroKitchenRating } from "../../MicroKitchenSide/Reviews/api";
import { toast, ToastContainer } from "react-toastify";
import { FiStar, FiMapPin, FiClock, FiSearch, FiInfo, FiCheckCircle, FiX, FiMessageSquare, FiUser, FiCalendar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ListOfMicroKitchenPage: React.FC = () => {
    const [kitchens, setKitchens] = useState<MicroKitchenProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Reviews Modal States
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedKitchen, setSelectedKitchen] = useState<MicroKitchenProfile | null>(null);
    const [reviews, setReviews] = useState<MicroKitchenRating[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
    const [reviewsTotalCount, setReviewsTotalCount] = useState(0);
    const [reviewsHasNext, setReviewsHasNext] = useState(false);
    const [reviewsHasPrevious, setReviewsHasPrevious] = useState(false);

    const fetchKitchens = async (search = "") => {
        setLoading(true);
        try {
            const data = await getApprovedMicroKitchens(search);
            setKitchens(data.results);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load micro kitchens");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKitchens(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchReviews = async (kitchen: MicroKitchenProfile, page = 1) => {
        setSelectedKitchen(kitchen);
        setShowReviewsModal(true);
        setLoadingReviews(true);
        try {
            const data = await getAllKitchenReviews(kitchen.id, page, 5);
            setReviews(data.results);
            setReviewsPage(data.current_page || page);
            setReviewsTotalPages(data.total_pages || 1);
            setReviewsTotalCount(data.count || 0);
            setReviewsHasNext(Boolean(data.next));
            setReviewsHasPrevious(Boolean(data.previous));
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoadingReviews(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Browse Kitchens" description="Certified micro-kitchens for your health plans" />
            <PageBreadcrumb pageTitle="Certified Micro Kitchens" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-12">
                {/* Search Header */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Our Kitchen Network</h1>
                        <p className="text-gray-500 mt-1 font-medium">Verified local kitchens preparing your personalized meals with care.</p>
                    </div>
                    
                    <div className="relative w-full md:w-96 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, cuisine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border dark:border-white/[0.05]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[32px] h-[400px] animate-pulse"></div>
                        ))}
                    </div>
                ) : kitchens.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10 shadow-sm">
                        <FiInfo className="size-16 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">No kitchens found</h3>
                        <p className="text-gray-500">Try adjusting your search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {kitchens.map((kitchen) => (
                            <div key={kitchen.id} className="group bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-transparent hover:border-blue-500/30 dark:border-white/[0.05] dark:hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2">
                                {/* Image Holder */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    {kitchen.photo_exterior ? (
                                        <img 
                                            src={kitchen.photo_exterior} 
                                            alt={kitchen.brand_name || ""} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                            <FiMapPin className="size-12 text-blue-200 dark:text-gray-600" />
                                        </div>
                                    )}
                                    
                                    {/* Verification Badge */}
                                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                        <FiCheckCircle size={12} /> Verified
                                    </div>

                                    {/* Rating Overlay */}
                                    {kitchen.latest_inspection && (
                                        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                                            <FiStar className="text-amber-500 fill-amber-500" size={16} />
                                            <span className="font-black text-gray-900 dark:text-white">
                                                {kitchen.latest_inspection.overall_score || "N/A"}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">/10</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em] mb-1">Chef {kitchen.user_details?.first_name || "Expert"}</p>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1">{kitchen.brand_name || "Premium Kitchen"}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                                                {kitchen.cuisine_type || "Multi Cuisine"}
                                            </span>
                                            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                                                {kitchen.meal_type || "Veg/Non-Veg"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                                        {/* Address */}
                                        <div 
                                            className="flex items-start gap-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -m-2 rounded-2xl transition-colors group/map"
                                            onClick={() => {
                                                if (kitchen.latitude != null && kitchen.longitude != null) {
                                                    window.open(`https://www.google.com/maps?q=${kitchen.latitude},${kitchen.longitude}`, "_blank");
                                                } else {
                                                    const addr = [kitchen.user_details?.address, kitchen.user_details?.city, kitchen.user_details?.state].filter(Boolean).join(", ");
                                                    if (addr) {
                                                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, "_blank");
                                                    } else {
                                                        toast.info("Address details not available.");
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl mt-1 group-hover/map:bg-blue-100 dark:group-hover/map:bg-blue-900/20 transition-colors">
                                                <FiMapPin className="text-blue-500" size={14} />
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="line-clamp-1">{kitchen.user_details?.address || "Location on request"}</p>
                                                    <span className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter shrink-0">Map</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight mt-0.5">
                                                    {kitchen.user_details?.city}, {kitchen.user_details?.state}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-3xl border border-gray-100/50 dark:border-white/5">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                    <FiClock className="size-3" />
                                                    <span>{kitchen.time_available || "9 AM - 9 PM"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest cursor-help group-hover:translate-x-1 transition-transform">
                                                    Explore <FiInfo size={12} />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => fetchReviews(kitchen, 1)}
                                                className="w-full py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiStar size={14} /> User Reviews
                                            </button>
                                        </div>
                                        
                                        {/* Latest Inspection Note */}
                                        {kitchen.latest_inspection?.recommendation && (
                                            <div className="p-4 bg-green-50/30 dark:bg-green-900/10 rounded-2xl border border-green-100/50 dark:border-green-900/20">
                                                <div className="text-[10px] uppercase font-black text-green-600 tracking-wider mb-1 flex items-center gap-1">
                                                    <FiStar size={10} className="fill-green-600" /> Professional Insight
                                                </div>
                                                <p className="text-xs text-green-800/80 dark:text-green-300/60 line-clamp-2 italic leading-relaxed">
                                                    "{kitchen.latest_inspection.recommendation}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reviews Modal */}
            <AnimatePresence>
                {showReviewsModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReviewsModal(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                                        {selectedKitchen?.brand_name || "Kitchen"} Feedback
                                    </h3>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Verified Experiences</p>
                                </div>
                                <button 
                                    onClick={() => setShowReviewsModal(false)}
                                    className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                                {loadingReviews ? (
                                    <div className="py-20 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Summoning Reviews...</p>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                                        <FiMessageSquare size={48} className="text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-bold">No verified reviews for this kitchen yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {reviews.map((r, i) => (
                                            <div key={r.id} className="flex gap-6 animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 flex items-center justify-center">
                                                    <FiUser className="text-blue-400" size={20} />
                                                </div>
                                                <div className="flex-1 border-b border-gray-50 dark:border-white/5 pb-8 last:border-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                                            {r.user_details?.first_name} {r.user_details?.last_name}
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <FiStar key={s} size={12} className={s <= r.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                            <FiCalendar size={10} /> {new Date(r.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[8px] font-black text-gray-500 uppercase tracking-tighter">
                                                            Order #{r.order}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium italic leading-relaxed">
                                                        "{r.review || "No written feedback provided, but shared a positive rating!"}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                Showing {(reviewsPage - 1) * 5 + 1}-{Math.min(reviewsPage * 5, reviewsTotalCount)} of {reviewsTotalCount}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => selectedKitchen && fetchReviews(selectedKitchen, reviewsPage - 1)}
                                                    disabled={!reviewsHasPrevious || loadingReviews}
                                                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5"
                                                >
                                                    Previous
                                                </button>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    Page {reviewsPage} / {reviewsTotalPages}
                                                </span>
                                                <button
                                                    onClick={() => selectedKitchen && fetchReviews(selectedKitchen, reviewsPage + 1)}
                                                    disabled={!reviewsHasNext || loadingReviews}
                                                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ListOfMicroKitchenPage;
