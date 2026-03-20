import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyKitchenSuggestions, respondToKitchenSuggestion, UserMicroKitchenMapping } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiHome, FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiCalendar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const AllotedMicroKitchenByNutritionPage: React.FC = () => {
    const [suggestions, setSuggestions] = useState<UserMicroKitchenMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

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
                                        <div className="flex items-start gap-3">
                                            <FiMapPin className="text-gray-400 mt-1" size={14} />
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{suggestion.kitchen_details?.city}, {suggestion.kitchen_details?.state}</p>
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
                                        <div className="pt-4 flex items-center justify-between">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${suggestion.status === 'accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                Status: {suggestion.status} on {suggestion.responded_at ? new Date(suggestion.responded_at).toLocaleDateString() : 'N/A'}
                                            </p>
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
        </div>
    );
};

export default AllotedMicroKitchenByNutritionPage;
