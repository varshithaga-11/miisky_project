import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    getMyCarts,
    placeOrder,
    deleteCartItem,
    Cart,
    getLoggedProfile,
    getCartCheckoutPreview,
    CheckoutPreview,
} from "../../NonPatient/orderapi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiShoppingCart, FiTrash2, FiMapPin, FiCheckCircle, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const CHECKOUT_WARNING_COPY: Record<string, string> = {
    no_slabs: "This kitchen has no delivery slabs yet — delivery shows ₹0 until they add distance rates.",
    no_customer_coordinates:
        "Add latitude & longitude under Profile so we can calculate distance and delivery charge.",
    no_kitchen_coordinates: "Kitchen GPS is not set — delivery charge is ₹0 until the kitchen adds their location.",
    no_kitchen: "Kitchen information is incomplete.",
    nearest_slab_applied:
        "Your distance did not fall exactly in one band; the nearest slab rate was used (same as at checkout).",
};

const CartPage: React.FC = () => {
    const [carts, setCarts] = useState<Cart[]>([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState<number | null>(null);
    const [address, setAddress] = useState("");
    const [checkoutByCartId, setCheckoutByCartId] = useState<
        Record<number, CheckoutPreview | null | undefined>
    >({});
    const [itemToRemove, setItemToRemove] = useState<number | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

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

    const fetchUserAddress = async () => {
        try {
            const profile = await getLoggedProfile();
            if (profile?.address) {
                setAddress(profile.address);
            }
        } catch (err) {
            console.error("Failed to fetch user address", err);
        }
    };

    useEffect(() => {
        fetchCarts();
        fetchUserAddress();
    }, []);

    const cartIdsKey = useMemo(() => carts.map((c) => c.id).join(","), [carts]);

    useEffect(() => {
        if (!carts.length) {
            setCheckoutByCartId({});
            return;
        }
        let cancelled = false;
        const loading: Record<number, CheckoutPreview | null | undefined> = {};
        carts.forEach((c) => {
            loading[c.id] = undefined;
        });
        setCheckoutByCartId(loading);

        (async () => {
            const updates: Record<number, CheckoutPreview | null> = {};
            await Promise.all(
                carts.map(async (c) => {
                    try {
                        updates[c.id] = await getCartCheckoutPreview(c.id);
                    } catch {
                        updates[c.id] = null;
                    }
                })
            );
            if (!cancelled) {
                setCheckoutByCartId((prev) => ({ ...prev, ...updates }));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [cartIdsKey]);

    const handleRemoveItem = (itemId: number) => {
        setItemToRemove(itemId);
    };

    const confirmRemove = async () => {
        if (!itemToRemove) return;
        setIsRemoving(true);
        try {
            await deleteCartItem(itemToRemove);
            toast.success("Item removed from cart successfully");
            setItemToRemove(null);
            fetchCarts();
        } catch (error) {
            toast.error("Failed to remove item from cart");
        } finally {
            setIsRemoving(false);
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
                                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">
                                                {checkoutByCartId[cart.id] ? "Total (food + delivery)" : "Food subtotal"}
                                            </p>
                                            <p className="text-xl font-black text-white tracking-tighter leading-none">
                                                ₹
                                                {checkoutByCartId[cart.id]
                                                    ? Number(checkoutByCartId[cart.id]!.final_amount).toFixed(2)
                                                    : calculateTotal(cart.items)}
                                            </p>
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
                                                <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/40 p-5 space-y-3">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order summary</p>
                                                    {checkoutByCartId[cart.id] === undefined ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                                            <FiLoader className="animate-spin text-indigo-500" />
                                                            Calculating delivery…
                                                        </div>
                                                    ) : checkoutByCartId[cart.id] === null ? (
                                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                                            Could not load pricing preview. You can still place the order; totals match at checkout.
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between text-sm font-bold text-gray-800 dark:text-gray-200">
                                                                <span>Food subtotal</span>
                                                                <span>₹{Number(checkoutByCartId[cart.id]!.food_subtotal).toFixed(2)}</span>
                                                            </div>
                                                            {checkoutByCartId[cart.id]!.delivery_distance_km != null && (
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                    Straight-line distance ~{" "}
                                                                    <span className="font-mono font-bold">
                                                                        {Number(checkoutByCartId[cart.id]!.delivery_distance_km).toFixed(2)} km
                                                                    </span>
                                                                </p>
                                                            )}
                                                            <div className="flex justify-between text-sm font-bold text-gray-800 dark:text-gray-200">
                                                                <span>Delivery charge</span>
                                                                <span>₹{Number(checkoutByCartId[cart.id]!.delivery_charge).toFixed(2)}</span>
                                                            </div>
                                                            {checkoutByCartId[cart.id]!.delivery_slab && (
                                                                <p className="text-[10px] text-gray-400">
                                                                    Slab: {checkoutByCartId[cart.id]!.delivery_slab!.min_km}–
                                                                    {checkoutByCartId[cart.id]!.delivery_slab!.max_km} km (₹
                                                                    {checkoutByCartId[cart.id]!.delivery_slab!.charge})
                                                                </p>
                                                            )}
                                                            <div className="flex justify-between text-base font-black text-indigo-600 dark:text-indigo-400 pt-2 border-t border-gray-100 dark:border-white/10">
                                                                <span>Total to pay</span>
                                                                <span>₹{Number(checkoutByCartId[cart.id]!.final_amount).toFixed(2)}</span>
                                                            </div>
                                                            {checkoutByCartId[cart.id]!.warnings?.map((w) =>
                                                                CHECKOUT_WARNING_COPY[w] ? (
                                                                    <p
                                                                        key={w}
                                                                        className="text-[10px] text-amber-800 dark:text-amber-300/90 leading-snug"
                                                                    >
                                                                        {CHECKOUT_WARNING_COPY[w]}
                                                                    </p>
                                                                ) : null
                                                            )}
                                                            {checkoutByCartId[cart.id]!.warnings?.includes("no_customer_coordinates") && (
                                                                <Link
                                                                    to="/profile-info"
                                                                    className="inline-block text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline"
                                                                >
                                                                    Open Profile → add map coordinates
                                                                </Link>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
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
                                                    {placing === cart.id ? "Processing..." : "Confirm & book order"}
                                                </Button>
                                                <p className="text-[10px] text-gray-400 text-center font-bold italic tracking-wide">Review totals above, then confirm. Powered by Miisky.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!itemToRemove}
                onClose={() => setItemToRemove(null)}
                onConfirm={confirmRemove}
                isLoading={isRemoving}
                title="Remove Item?"
                message="Are you sure you want to remove this meal from your shopping cart?"
                confirmText="Remove Item"
            />
        </div>
    );
};

export default CartPage;
