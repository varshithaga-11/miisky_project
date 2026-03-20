import React, { useEffect, useState } from "react";
import { getMyCarts, placeOrder, deleteCartItem, Cart } from "../orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiShoppingCart, FiTrash2, FiMapPin, FiCheckCircle, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";

const CartPage: React.FC = () => {
    const [carts, setCarts] = useState<Cart[]>([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState<number | null>(null);
    const [address, setAddress] = useState("");

    const fetchCarts = async () => {
        setLoading(true);
        try {
            const data = await getMyCarts();
            setCarts(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarts();
    }, []);

    const handleRemoveItem = async (itemId: number) => {
        try {
            await deleteCartItem(itemId);
            toast.success("Item removed");
            fetchCarts();
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    const handlePlaceOrder = async (cartId: number) => {
        if (!address.trim()) {
            toast.warning("Please provide a delivery address");
            return;
        }
        setPlacing(cartId);
        try {
            await placeOrder(cartId, address);
            toast.success("Order placed successfully!");
            fetchCarts();
        } catch (error) {
            toast.error("Failed to place order");
        } finally {
            setPlacing(null);
        }
    };

    const calculateTotal = (items: any[]) => {
        return items.reduce((sum, item) => sum + (item.food_details?.price || 0) * item.quantity, 0);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Your Cart" description="Manage your selected meals" />
            <PageBreadcrumb pageTitle="Cart" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-32">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Your Shopping Carts</h1>
                    <p className="text-gray-500 mt-1 font-medium italic text-sm">Meals grouped by micro-kitchen. Each kitchen requires a separate order.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-[50px] shadow-sm border border-gray-100 dark:border-white/5">
                        <FiLoader className="animate-spin text-indigo-500 mb-4" size={40} />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Syncing your selections...</p>
                    </div>
                ) : carts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 mb-8">
                            <FiShoppingCart size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Your Cart is Empty</h3>
                        <p className="text-gray-400 mt-2 font-medium">Explore our menus to start building your personalized meal plan.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <AnimatePresence>
                            {carts.map((cart) => (
                                <motion.div 
                                    key={cart.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-gray-800 rounded-[45px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-white/5"
                                >
                                    {/* Cart Header */}
                                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Ordering From</p>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{cart.kitchen_details?.brand_name || "Micro Kitchen"}</h2>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">Total Amount</p>
                                            <p className="text-xl font-black text-white tracking-tighter leading-none">₹{calculateTotal(cart.items)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3">
                                        {/* Items List */}
                                        <div className="lg:col-span-2 p-8 space-y-6">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-4 dark:border-white/5">Selected Items</h4>
                                            {cart.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-6 group">
                                                    <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner flex-shrink-0">
                                                        {item.food_details?.image ? (
                                                            <img src={item.food_details.image} alt={item.food_details.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <FiShoppingCart size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">{item.food_details?.name}</h5>
                                                        <p className="text-sm font-black text-emerald-500">₹{item.food_details?.price || 0} × {item.quantity}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Checkout Form */}
                                        <div className="bg-gray-50/50 dark:bg-white/[0.02] p-8 border-l border-gray-100 dark:border-white/5">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Fulfillment Details</h4>
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label className="flex items-center gap-2"><FiMapPin className="text-indigo-500" /> Delivery Address</Label>
                                                    <textarea 
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        placeholder="Enter your complete delivery address here..."
                                                        className="w-full p-6 bg-white dark:bg-gray-800 rounded-3xl border-none shadow-inner focus:ring-2 focus:ring-indigo-500 font-bold text-sm min-h-[120px] resize-none"
                                                    />
                                                </div>
                                                <Button 
                                                    className="w-full py-5 rounded-3xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-indigo-500/20"
                                                    disabled={placing === cart.id}
                                                    onClick={() => handlePlaceOrder(cart.id)}
                                                >
                                                    {placing === cart.id ? <FiLoader className="animate-spin" /> : <FiCheckCircle size={20} />}
                                                    {placing === cart.id ? "Processing..." : "Place Final Order"}
                                                </Button>
                                                <p className="text-[10px] text-gray-400 text-center font-bold italic tracking-wide">Secure checkout powered by Miisky Culinary Network</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
