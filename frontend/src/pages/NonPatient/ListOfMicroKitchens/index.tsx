import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getApprovedMicroKitchens, MicroKitchenProfile } from "../../PatientSide/ListOfMicroKitchen/api";
import { toast, ToastContainer } from "react-toastify";
import { getAllKitchenReviews, MicroKitchenRating } from "../../MicroKitchenSide/Reviews/api";
import { FiStar, FiMapPin, FiClock, FiSearch, FiInfo, FiCheckCircle, FiX, FiMessageSquare, FiUser, FiCalendar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const NonPatientListOfMicroKitchenPage: React.FC = () => {
    const [kitchens, setKitchens] = useState<MicroKitchenProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Reviews Modal States
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedKitchen, setSelectedKitchen] = useState<MicroKitchenProfile | null>(null);
    const [reviews, setReviews] = useState<MicroKitchenRating[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

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

    const fetchReviews = async (kitchen: MicroKitchenProfile) => {
        setSelectedKitchen(kitchen);
        setShowReviewsModal(true);
        setLoadingReviews(true);
        try {
            const data = await getAllKitchenReviews(kitchen.id);
            setReviews(data.results || []);
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoadingReviews(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Discover Kitchens" description="Explore our network of certified micro-kitchens" />
            <PageBreadcrumb pageTitle="Kitchen Network" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Our Culinary Network</h1>
                        <p className="text-gray-500 font-medium italic">Verified local kitchens dedicated to preparing high-quality, personalized meals.</p>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Explore by name or cuisine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 border-none rounded-[30px] shadow-2xl shadow-gray-200/40 dark:shadow-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[40px] h-[450px] animate-pulse border border-gray-100 dark:border-white/5 shadow-sm"></div>
                        ))}
                    </div>
                ) : kitchens.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[50px] border border-dashed border-gray-100 dark:border-white/10 shadow-sm flex flex-col items-center">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-8">
                            <FiInfo size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Kitchens Found</h3>
                        <p className="text-gray-400 mt-2 font-medium">Try broadening your search criteria to see available providers.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {kitchens.map((kitchen, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={kitchen.id}
                                className="group bg-white dark:bg-gray-800 rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-transparent hover:border-indigo-500/30 dark:border-white/[0.05] transition-all duration-500 hover:-translate-y-2"
                            >
                                {/* Media Section */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    {kitchen.photo_exterior ? (
                                        <img
                                            src={kitchen.photo_exterior}
                                            alt={kitchen.brand_name || ""}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                            <FiMapPin className="size-16 text-indigo-100 dark:text-gray-600" />
                                        </div>
                                    )}

                                    <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl border border-white/20">
                                        <FiCheckCircle size={14} /> Certified
                                    </div>

                                    {kitchen.latest_inspection && (
                                        <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/50 dark:border-white/10">
                                            <FiStar className="text-amber-500 fill-amber-500" size={18} />
                                            <span className="font-black text-gray-900 dark:text-white text-lg leading-none">
                                                {kitchen.latest_inspection.overall_score || "N/A"}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400">/10</span>
                                        </div>
                                    )}
                                </div>

                                {/* Detail Section */}
                                <div className="p-8 space-y-8">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em] mb-2 leading-none">Expert Partner</p>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 line-clamp-1 uppercase tracking-tighter">{kitchen.brand_name || "Premium Kitchen"}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {(kitchen.cuisine_type || "Global").split(',').slice(0, 2).map(c => (
                                                <span key={c} className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-500/10">
                                                    {c.trim()}
                                                </span>
                                            ))}
                                            {kitchen.religion && (
                                                <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-xl uppercase tracking-widest border border-amber-100/50 dark:border-amber-500/10">
                                                    {kitchen.religion}
                                                </span>
                                            )}
                                            {kitchen.caste && (
                                                <span className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-xl uppercase tracking-widest border border-rose-100/50 dark:border-rose-500/10">
                                                    {kitchen.caste}
                                                </span>
                                            )}
                                            {kitchen.languages && (
                                                <span className="px-4 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-[10px] font-black rounded-xl uppercase tracking-widest border border-teal-100/50 dark:border-teal-500/10">
                                                    {kitchen.languages}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/[0.05]">
                                        <div
                                            className="flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -m-2 rounded-2xl transition-colors group/map"
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
                                            <div className="p-2.5 bg-gray-50 dark:bg-white/[0.03] rounded-2xl shadow-inner group-hover/map:bg-indigo-50 dark:group-hover/map:bg-indigo-900/20 transition-colors">
                                                <FiMapPin className="text-gray-400 group-hover/map:text-indigo-500" size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Serving Area</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">
                                                    {[kitchen.user_details?.address, kitchen.user_details?.city, kitchen.user_details?.state]
                                                        .filter(Boolean)
                                                        .join(", ") || "Location on request"}
                                                </p>
                                                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter mt-1 inline-block">
                                                    View on Map
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-3xl border border-gray-100/50 dark:border-white/5">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <FiClock className="size-4 text-gray-300" />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kitchen.time_available || "08:00 - 22:00"}</span>
                                                </div>
                                                <Link
                                                    to={`/patient/kitchen/${kitchen.id}/menu`}
                                                    className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                                                >
                                                    View Menu <FiInfo size={14} />
                                                </Link>
                                            </div>
                                            <button
                                                onClick={() => fetchReviews(kitchen)}
                                                className="w-full py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiStar size={14} /> User Reviews
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
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
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Verified Experiences</p>
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
                                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
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
                                                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex-shrink-0 flex items-center justify-center">
                                                    <FiUser className="text-indigo-400" size={20} />
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

export default NonPatientListOfMicroKitchenPage;
