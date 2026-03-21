import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getAvailableMicroKitchenFoods, getApprovedMicroKitchens, MicroKitchenFoodItem, MicroKitchenProfile } from "./api";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import { FiSearch, FiLayers, FiInfo, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

const NonPatientFoodsPage: React.FC = () => {
    const [foods, setFoods] = useState<MicroKitchenFoodItem[]>([]);
    const [kitchens, setKitchens] = useState<MicroKitchenProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedKitchen, setSelectedKitchen] = useState<string>("all");

    const fetchKitchens = async () => {
        try {
            const data = await getApprovedMicroKitchens("");
            setKitchens(data.results || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const data = await getAvailableMicroKitchenFoods(
                selectedKitchen === "all" ? undefined : selectedKitchen,
                search || undefined
            );
            setFoods(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load foods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKitchens();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFoods();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedKitchen]);

    const getImageUrl = (path: string | undefined | null) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Available Foods" description="Explore foods from micro kitchens with prices" />
            <PageBreadcrumb pageTitle="Food Catalog" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-20">
                <div className="flex flex-col gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Food Catalog</h1>
                        <p className="text-gray-500 mt-1 font-medium">Browse available foods from micro kitchens with prices.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by food or kitchen name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 rounded-[30px] border-none shadow-xl shadow-gray-200/40 dark:shadow-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                            />
                        </div>
                        <div className="w-full sm:w-72">
                            <select
                                value={selectedKitchen}
                                onChange={(e) => setSelectedKitchen(e.target.value)}
                                className="w-full px-6 py-4 bg-white dark:bg-gray-800 rounded-[30px] border-none shadow-xl shadow-gray-200/40 dark:shadow-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                            >
                                <option value="all">All Micro Kitchens</option>
                                {kitchens.map((k) => (
                                    <option key={k.id} value={String(k.id)}>
                                        {k.brand_name || `Kitchen #${k.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <div
                                key={i}
                                className="h-44 bg-white dark:bg-gray-800 rounded-[35px] animate-pulse shadow-sm border border-gray-100 dark:border-white/5"
                            />
                        ))}
                    </div>
                ) : foods.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-20 h-20 rounded-[30px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-6">
                            <FiSearch size={32} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Foods Found</h3>
                        <p className="text-gray-400 mt-1 font-medium">Try adjusting your filters or search to discover available items.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {foods.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                key={item.id}
                                className="group bg-white dark:bg-gray-800 rounded-[35px] p-6 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/30 dark:shadow-none hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center overflow-hidden mb-4 group-hover:bg-indigo-500 transition-all">
                                    {item.food_details?.image ? (
                                        <img
                                            src={getImageUrl(item.food_details.image)}
                                            alt={item.food_details.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FiLayers size={24} className="text-indigo-500 group-hover:text-white" />
                                    )}
                                </div>
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter line-clamp-2 leading-tight h-10 mb-2 group-hover:text-indigo-500 transition-colors">
                                    {item.food_details?.name || "Food"}
                                </h4>
                                <div className="flex items-center gap-1.5 mb-3 text-[10px] text-gray-400">
                                    <FiMapPin size={10} />
                                    <span className="truncate">{item.micro_kitchen_details?.brand_name || "Kitchen"}</span>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{Number(item.price)}</span>
                                    {item.preparation_time && (
                                        <span className="text-[10px] font-bold text-gray-400">{item.preparation_time} min</span>
                                    )}
                                </div>
                                <button className="w-full py-3 bg-gray-50 dark:bg-white/[0.03] rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
                                    <FiInfo size={14} /> Details
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NonPatientFoodsPage;
