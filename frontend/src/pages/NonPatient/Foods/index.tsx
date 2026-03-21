import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodList, Food } from "../../AdminSide/Food/foodapi";
import { toast, ToastContainer } from "react-toastify";
import { FiSearch, FiLayers, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";

const NonPatientFoodsPage: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const data = await getFoodList(1, "all", search, "", "", undefined, true);
            setFoods(data.results);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load foods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFoods();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Available Foods" description="Explore our comprehensive food database" />
            <PageBreadcrumb pageTitle="Food Database" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Food Catalog</h1>
                        <p className="text-gray-500 mt-1 font-medium">Browse through our extensive library of nutritional food items.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 rounded-[30px] border-none shadow-xl shadow-gray-200/40 dark:shadow-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1,2,3,4,5,6,7,8,9,10].map(i => (
                            <div key={i} className="h-44 bg-white dark:bg-gray-800 rounded-[35px] animate-pulse shadow-sm border border-gray-100 dark:border-white/5"></div>
                        ))}
                    </div>
                ) : foods.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-20 h-20 rounded-[30px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-6">
                            <FiSearch size={32} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Foods Found</h3>
                        <p className="text-gray-400 mt-1 font-medium">Try refining your search to discover available items.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {foods.map((food, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                key={food.id}
                                className="group bg-white dark:bg-gray-800 rounded-[35px] p-6 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/30 dark:shadow-none hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                                    <FiLayers size={20} />
                                </div>
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter line-clamp-2 leading-tight h-10 mb-3 group-hover:text-indigo-500 transition-colors">
                                    {food.name}
                                </h4>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{food.id}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate">
                                        {(food.meal_type_names || food.cuisine_type_names || [])?.join(', ') || 'Generic'}
                                    </span>
                                </div>
                                
                                <button className="w-full py-3 bg-gray-50 dark:bg-white/[0.03] rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                                    <FiInfo size={14} /> Nutrition Details
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
