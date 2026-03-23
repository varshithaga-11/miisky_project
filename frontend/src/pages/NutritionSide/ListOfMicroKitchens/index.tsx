import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getApprovedMicroKitchens, MicroKitchenProfile } from "./api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiStar, FiMapPin, FiClock, FiSearch, FiInfo, FiCheckCircle } from "react-icons/fi";

const ListOfMicroKitchensPage: React.FC = () => {
    const [kitchens, setKitchens] = useState<MicroKitchenProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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
        fetchKitchens(searchTerm);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            <PageMeta title="Kitchen Network" description="Certified micro-kitchens for nutrition planning" />
            <PageBreadcrumb pageTitle="Certified Micro Kitchens" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8 pb-12">
                {/* Search Header */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Kitchen Discovery</h1>
                        <p className="text-gray-500 mt-1 font-medium italic">Monitor and select verified local kitchens for your patient diet plans.</p>
                    </div>
                    
                    <div className="relative w-full md:w-96 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by brand, cuisine, or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-3xl shadow-2xl shadow-gray-200/40 dark:shadow-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:border dark:border-white/[0.05]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[32px] h-[400px] animate-pulse border border-gray-100 dark:border-white/5 shadow-sm"></div>
                        ))}
                    </div>
                ) : kitchens.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10 shadow-sm">
                        <FiInfo className="size-16 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">No active kitchens found</h3>
                        <p className="text-gray-500">Currently no kitchens are approved in this network or matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {kitchens.map((kitchen) => (
                            <div key={kitchen.id} className="group bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200/40 dark:shadow-none border border-transparent hover:border-indigo-500/30 dark:border-white/[0.05] dark:hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2">
                                {/* Image Holder */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    {kitchen.photo_exterior ? (
                                        <img 
                                            src={kitchen.photo_exterior} 
                                            alt={kitchen.brand_name || ""} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                            <FiMapPin className="size-12 text-indigo-200 dark:text-gray-600" />
                                        </div>
                                    )}
                                    
                                    {/* Verification Badge */}
                                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                        <FiCheckCircle size={12} /> Approved
                                    </div>

                                    {/* Rating Overlay */}
                                    {kitchen.latest_inspection && (
                                        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-gray-100 dark:border-white/10">
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
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[9px] uppercase font-black text-indigo-500 tracking-[0.2em]">{kitchen.kitchen_code || "K-ID"}</p>
                                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest italic">{kitchen.user_details?.first_name || "Expert"}</p>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 line-clamp-1">{kitchen.brand_name || "Premium Kitchen"}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-wide border border-indigo-100/50 dark:border-indigo-900/10">
                                                {kitchen.cuisine_type || "Multi Cuisine"}
                                            </span>
                                            <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg uppercase tracking-wide border border-rose-100/50 dark:border-rose-900/10">
                                                {kitchen.meal_type || "All Meals"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                                        {/* Address */}
                                        <div
                                            className={`flex items-start gap-4 text-sm ${kitchen.latitude != null && kitchen.longitude != null ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -m-2 rounded-2xl transition-colors group/map" : ""}`}
                                            onClick={() => {
                                                if (kitchen.latitude != null && kitchen.longitude != null) {
                                                    window.open(`https://www.google.com/maps?q=${kitchen.latitude},${kitchen.longitude}`, "_blank");
                                                }
                                            }}
                                        >
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl mt-0.5 group-hover/map:bg-indigo-100 dark:group-hover/map:bg-indigo-900/20 transition-colors">
                                                <FiMapPin className="text-indigo-500 group-hover/map:text-indigo-600" size={14} />
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400 font-medium flex-1 min-w-0">
                                                <p className="line-clamp-1 italic text-xs">"{kitchen.user_details?.address || "Location on file"}"</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-1">
                                                    {[kitchen.user_details?.city, kitchen.user_details?.state].filter(Boolean).join(", ") || "—"}
                                                </p>
                                                {kitchen.latitude != null && kitchen.longitude != null && (
                                                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter mt-1 inline-block">
                                                        View on Map
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-3xl border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                <FiClock className="size-3 text-indigo-400" />
                                                <span>{kitchen.time_available || "Full Operational Hours"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em] group-hover:translate-x-1 transition-transform cursor-pointer">
                                                Vetted <FiCheckCircle size={10} />
                                            </div>
                                        </div>
                                        
                                        {/* Latest Inspection Note */}
                                        {kitchen.latest_inspection?.recommendation && (
                                            <div className="p-4 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20 relative">
                                                <FiInfo className="absolute top-3 right-3 text-emerald-300 dark:text-emerald-700" size={12} />
                                                <div className="text-[9px] uppercase font-black text-emerald-600 tracking-wider mb-2 flex items-center gap-2">
                                                     INSPECTION INSIGHT
                                                </div>
                                                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/60 line-clamp-2 italic leading-relaxed font-medium">
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
        </div>
    );
};

export default ListOfMicroKitchensPage;
