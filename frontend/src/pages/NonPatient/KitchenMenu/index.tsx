import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getKitchenMenu, getFoodList, MicroKitchenFoodMenuItem, Food } from "../../AdminSide/Food/foodapi";
import { addToCart } from "../orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiShoppingCart, FiSearch, FiLayers, FiInfo, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { createApiUrl } from "../../../access/access";

type MenuItem = MicroKitchenFoodMenuItem | (Food & { food?: number });

const KitchenMenuPage: React.FC = () => {
    const { kitchenId } = useParams<{ kitchenId: string }>();
    const [foods, setFoods] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchFoods = async () => {
        if (!kitchenId) return;
        setLoading(true);
        try {
            const menuData = await getKitchenMenu(Number(kitchenId));
            if (menuData.length > 0) {
                setFoods(menuData);
            } else {
                const data = await getFoodList(1, "all", search, "", "", Number(kitchenId));
                setFoods(data.results);
            }
        } catch (error) {
            console.error(error);
            try {
                const data = await getFoodList(1, "all", search, "", "", Number(kitchenId));
                setFoods(data.results);
            } catch {
                toast.error("Failed to load menu");
                setFoods([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, [kitchenId]);

    const filteredFoods = search
        ? foods.filter((f) => {
            const name = 'food_details' in f ? (f as MicroKitchenFoodMenuItem).food_details?.name : (f as Food).name;
            return name?.toLowerCase().includes(search.toLowerCase());
          })
        : foods;

    const handleAddToCart = async (foodId: number) => {
        try {
            await addToCart(Number(kitchenId), foodId, 1);
            toast.success("Added to cart!");
        } catch (error) {
            toast.error("Failed to add to cart");
        }
    };

    const getImageUrl = (imagePath: string | undefined | null) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http")) return imagePath;
        return createApiUrl(imagePath.startsWith("/") ? imagePath.slice(1) : imagePath);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Kitchen Menu" description="Explore the kitchen's culinary offerings" />
            <PageBreadcrumb pageTitle="Menu" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-32">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3">Culinary Selection</h1>
                        <p className="text-gray-500 font-medium italic">Handpicked dishes prepared with precision by your selected micro-kitchen.</p>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-800 border-none rounded-[30px] shadow-2xl shadow-gray-200/40 dark:shadow-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[400px] bg-white dark:bg-gray-800 rounded-[45px] animate-pulse border border-gray-100 dark:border-white/5 shadow-sm"></div>
                        ))}
                    </div>
                ) : filteredFoods.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[60px] p-24 text-center border shadow-sm border-gray-100 dark:border-white/5 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-8">
                            <FiLayers size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Menu Items Available</h3>
                        <p className="text-gray-400 mt-2 font-medium">This kitchen hasn't listed any dishes yet. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredFoods.map((food, idx) => {
                            const isMicroKitchenFood = 'food_details' in food;
                            const foodId = isMicroKitchenFood ? (food as MicroKitchenFoodMenuItem).food : (food as Food).id!;
                            const name = isMicroKitchenFood ? (food as MicroKitchenFoodMenuItem).food_details?.name : (food as Food).name;
                            const description = isMicroKitchenFood ? (food as MicroKitchenFoodMenuItem).food_details?.description : (food as Food).description;
                            const image = isMicroKitchenFood ? (food as MicroKitchenFoodMenuItem).food_details?.image : (food as Food).image;
                            const mealTypes = isMicroKitchenFood ? (food as MicroKitchenFoodMenuItem).food_details?.meal_type_names : (food as Food).meal_type_names;
                            const price = isMicroKitchenFood ? (food as MicroKitchenFoodMenuItem).price : (food as Food).price;
                            return (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={isMicroKitchenFood ? (food as MicroKitchenFoodMenuItem).id : (food as Food).id!}
                                className="group bg-white dark:bg-gray-800 rounded-[45px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-transparent hover:border-indigo-500/30 transition-all duration-500"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                                    {image ? (
                                        <img src={getImageUrl(image)} alt={name || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : <FiLayers className="w-full h-full p-20 text-gray-200" />}
                                    
                                    <div className="absolute top-6 right-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/50 dark:border-white/10">
                                        <span className="text-xl font-black text-emerald-500 tracking-tighter">₹{price ?? 0}</span>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter line-clamp-2 leading-tight mb-2">{name}</h4>
                                        <p className="text-xs font-medium text-gray-400 line-clamp-2 leading-relaxed italic">{description || "No description provided."}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {(mealTypes || []).map((m: string) => (
                                            <span key={m} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 text-[9px] font-black rounded-lg uppercase tracking-widest">{m}</span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <button 
                                            onClick={() => handleAddToCart(foodId)}
                                            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                                        >
                                            <FiPlus size={16} /> Add to Cart
                                        </button>
                                        <button className="p-4 bg-gray-50 dark:bg-white/[0.03] text-gray-400 hover:text-indigo-500 rounded-2xl transition-all">
                                            <FiInfo size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );})}
                    </div>
                )}
            </div>

            {/* Quick Cart Trigger */}
            <Link to="/patient/cart" className="fixed bottom-10 right-10 bg-indigo-500 text-white w-20 h-20 rounded-[30px] flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-90 transition-all z-50 border-4 border-white dark:border-gray-800">
                <FiShoppingCart size={28} />
            </Link>
        </div>
    );
};

export default KitchenMenuPage;
