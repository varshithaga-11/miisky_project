import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyKitchenSuggestions, respondToKitchenSuggestion, rateMicroKitchen, getMyRatingForKitchen, UserMicroKitchenMapping } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiHome, FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiCalendar, FiStar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const AllotedMicroKitchenByNutritionPage: React.FC = () => {
    const [suggestions, setSuggestions] = useState<UserMicroKitchenMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [ratingModal, setRatingModal] = useState<{ kitchen: UserMicroKitchenMapping } | null>(null);
    const [ratingStars, setRatingStars] = useState(0);
    const [ratingReview, setRatingReview] = useState("");
    const [ratingSubmitting, setRatingSubmitting] = useState(false);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const data = await getMyKitchenSuggestions();
            setSuggestions(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load suggested kitchens");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleResponse = async (id: number, status: 'accepted' | 'rejected') => {
        setActionLoading(id);
        try {
            await respondToKitchenSuggestion(id, status);
            toast.success(`Kitchen ${status === 'accepted' ? 'accepted' : 'declined'} successfully!`);
            fetchSuggestions();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit response");
        } finally {
            setActionLoading(null);
        }
    };

    const openRatingModal = async (kitchen: UserMicroKitchenMapping) => {
        setRatingModal({ kitchen });
        setRatingStars(0);
        setRatingReview("");
        if (kitchen.micro_kitchen) {
            try {
                const existing = await getMyRatingForKitchen(kitchen.micro_kitchen);
                if (existing) {
                    setRatingStars(existing.rating);
                    setRatingReview(existing.review || "");
                }
            } catch {
                // ignore
            }
        }
    };

    const submitRating = async () => {
        if (!ratingModal || ratingStars < 1) {
            toast.error("Please select a rating (1-5 stars)");
            return;
        }
        setRatingSubmitting(true);
        try {
            await rateMicroKitchen(ratingModal.kitchen.micro_kitchen, ratingStars, ratingReview || undefined);
            toast.success("Rating submitted!");
            setRatingModal(null);
            fetchSuggestions();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit rating");
        } finally {
            setRatingSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Kitchen Suggestions" description="Manage kitchens suggested by your nutritionist" />
            <PageBreadcrumb pageTitle="Suggested Kitchens" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-20">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Kitchen Invitations</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Your nutritionist has recommended these verified local kitchens for your diet plan.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[40px] h-[300px] animate-pulse shadow-sm border border-gray-100 dark:border-white/5"></div>
                        ))}
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-8">
                            <FiHome size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Current Suggestions</h3>
                        <p className="text-gray-400 mt-2 font-medium">Wait for your nutritionist to suggest verified local kitchens to support your plan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {suggestions.map((suggestion) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={suggestion.id} 
                                className={`group bg-white dark:bg-gray-800 rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-transparent hover:border-indigo-500/30 dark:border-white/5 transition-all duration-500 ${suggestion.status === 'accepted' ? 'ring-2 ring-emerald-500/50' : ''}`}
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em] mb-1">Recommendation</p>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 truncate uppercase tracking-tighter">{suggestion.kitchen_details?.brand_name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                                                By Chef {suggestion.nutritionist_details?.first_name || 'Nutritionist'}
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-2xl shadow-inner ${
                                            suggestion.status === 'accepted' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' : 
                                            suggestion.status === 'rejected' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 
                                            'bg-amber-50 text-amber-500 dark:bg-amber-900/20'
                                        }`}>
                                            {suggestion.status === 'accepted' ? <FiCheckCircle size={20} /> : suggestion.status === 'rejected' ? <FiXCircle size={20} /> : <FiClock size={20} />}
                                        </div>
                                    </div>

                                    {/* Plan Details Card */}
                                    <div className="bg-gray-50/50 dark:bg-white/[0.02] p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <FiCalendar className="text-gray-400 mt-1" size={14} />
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Diet Plan Association</p>
                                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate">{suggestion.diet_plan_details?.plan_name}</p>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex items-start gap-3 ${suggestion.kitchen_details?.latitude != null && suggestion.kitchen_details?.longitude != null ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -m-2 rounded-2xl transition-colors group/map" : ""}`}
                                            onClick={() => {
                                                const kd = suggestion.kitchen_details;
                                                if (kd?.latitude != null && kd?.longitude != null) {
                                                    window.open(`https://www.google.com/maps?q=${kd.latitude},${kd.longitude}`, "_blank");
                                                }
                                            }}
                                        >
                                            <FiMapPin className="text-gray-400 mt-1 group-hover/map:text-indigo-500" size={14} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase">
                                                    {[suggestion.kitchen_details?.city, suggestion.kitchen_details?.state].filter(Boolean).join(", ") || "Location on file"}
                                                </p>
                                                {suggestion.kitchen_details?.latitude != null && suggestion.kitchen_details?.longitude != null && (
                                                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter mt-1 inline-block">
                                                        View on Map
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {suggestion.status === 'suggested' ? (
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                onClick={() => handleResponse(suggestion.id, 'accepted')}
                                                disabled={actionLoading === suggestion.id}
                                                className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Accept SUGGESTION
                                            </button>
                                            <button
                                                onClick={() => handleResponse(suggestion.id, 'rejected')}
                                                disabled={actionLoading === suggestion.id}
                                                className="px-6 border border-gray-100 dark:border-white/10 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                            >
                                                <FiXCircle size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pt-4 flex items-center justify-between flex-wrap gap-3">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${suggestion.status === 'accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                Status: {suggestion.status} on {suggestion.responded_at ? new Date(suggestion.responded_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                            {suggestion.status === 'accepted' && (
                                                <button
                                                    onClick={() => openRatingModal(suggestion)}
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <FiStar size={14} /> Rate Kitchen
                                                </button>
                                            )}
                                            {suggestion.status === 'rejected' && (
                                                <button 
                                                    onClick={() => handleResponse(suggestion.id, 'accepted')}
                                                    className="text-[10px] font-black text-indigo-500 underline"
                                                >
                                                    Reconsider?
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            <AnimatePresence>
                {ratingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => !ratingSubmitting && setRatingModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/5"
                        >
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
                                Rate {ratingModal.kitchen.kitchen_details?.brand_name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">How was your experience?</p>
                            <div className="flex gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setRatingStars(s)}
                                        className="p-2 rounded-xl transition-all hover:scale-110"
                                    >
                                        <FiStar
                                            size={32}
                                            className={s <= ratingStars ? "text-amber-500 fill-amber-500" : "text-gray-200 dark:text-gray-600"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                placeholder="Optional: Share your experience..."
                                value={ratingReview}
                                onChange={(e) => setRatingReview(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 text-sm mb-6 resize-none"
                                rows={3}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => !ratingSubmitting && setRatingModal(null)}
                                    disabled={ratingSubmitting}
                                    className="flex-1 py-3 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRating}
                                    disabled={ratingSubmitting || ratingStars < 1}
                                    className="flex-1 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-wider hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {ratingSubmitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllotedMicroKitchenByNutritionPage;
