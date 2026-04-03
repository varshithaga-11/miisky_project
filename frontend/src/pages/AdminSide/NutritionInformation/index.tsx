import React, { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getAdminNutritionistList } from "./api";
import { toast, ToastContainer } from "react-toastify";
import {
    FiUser, FiSearch, FiPhone, FiMail,
    FiChevronRight, FiBriefcase, FiCheckCircle, FiClock
} from "react-icons/fi";
import Button from "../../../components/ui/button/Button";
import { NutritionistDetailModal } from "./NutritionistDetailModal";

const NutritionInformationPage: React.FC = () => {
    const [nutritionists, setNutritionists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [viewingId, setViewingId] = useState<number | null>(null);
    const [selectedNutritionist, setSelectedNutritionist] = useState<any>(null);

    const fetchList = useCallback(async (page: number, search: string, lim: number) => {
        setLoading(true);
        try {
            const data = await getAdminNutritionistList(page, search, lim);
            setNutritionists(data.results);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dietitian data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList(currentPage, searchTerm, limit);
    }, [currentPage, searchTerm, limit, fetchList]);

    const getStatusBadge = (isVerified: boolean) => {
        return isVerified ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-200 dark:border-green-800">
                <FiCheckCircle size={12} /> Verified
            </span>
        ) : (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-amber-200 dark:border-amber-800">
                <FiClock size={12} /> Pending
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
            <PageMeta title="Dietitian Overview" description="Manage and view nutritionist professional records" />
            <PageBreadcrumb pageTitle="Dietitian Management" />
            <ToastContainer position="bottom-right" className="z-[99999]" />

            <div className="px-4 md:px-8">
                {/* Filters & Search */}
                <div className="mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="p-4 bg-indigo-600 rounded-[24px] text-white shadow-xl shadow-indigo-600/20 italic">
                            <FiBriefcase size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">Registered Professionals</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Network Strength: {totalPages * 10}+</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 shadow-sm group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find by name, email, credentials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-[28px] border border-transparent focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-sm tracking-tight shadow-indigo-500/5"
                        />
                    </div>
                </div>

                {/* Main Table List */}
                <div className="bg-white dark:bg-gray-800/40 rounded-[44px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b dark:border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Dietitian Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Professional Credentials</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Stats</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Verification</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {loading && nutritionists.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="inline-flex flex-col items-center gap-4">
                                                <div className="size-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic animate-pulse">Synchronizing Data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : nutritionists.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <FiUser size={64} className="text-gray-100 dark:text-gray-800" />
                                                <h3 className="text-xl font-black text-gray-200 dark:text-gray-700 uppercase tracking-tighter italic">No Dietitians registered in current search</h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    nutritionists.map((nut) => (
                                        <tr key={nut.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 rounded-[20px] bg-gray-100 dark:bg-gray-700 overflow-hidden ring-4 ring-gray-100 dark:ring-white/5 shadow-inner">
                                                        {nut.photo ? (
                                                            <img src={nut.photo} className="w-full h-full object-cover" alt="" />
                                                        ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><FiUser size={24} /></div>}
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                                                            {nut.first_name} {nut.last_name}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-3">
                                                            <span className="flex items-center gap-1"><FiMail /> {nut.email}</span>
                                                            <span className="flex items-center gap-1"><FiPhone /> {nut.mobile || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Experience</div>
                                                    <div className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">
                                                        {nut.qualification || "GENERAL NUTRITIONIST"} • {nut.experience || "0"} Years
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <div className="text-[8px] font-black text-gray-400 uppercase italic">Active</div>
                                                        <div className="text-sm font-black text-indigo-500 uppercase">12+</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[8px] font-black text-gray-400 uppercase italic">Rating</div>
                                                        <div className="text-sm font-black text-amber-500 uppercase tracking-tighter">4.8 ★</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {getStatusBadge(nut.is_active)}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedNutritionist(nut);
                                                        setViewingId(nut.id);
                                                    }}
                                                    className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ml-auto shadow-xl shadow-black/10 dark:shadow-white/5"
                                                >
                                                    View Details <FiChevronRight />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-8 py-6 bg-gray-50/50 dark:bg-white/[0.02] border-t dark:border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Showing Page {currentPage} of {totalPages} results</div>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-indigo-500 shadow-sm"
                            >
                                <option value={10}>10 Per Page</option>
                                <option value={20}>20 Per Page</option>
                                <option value={50}>50 Per Page</option>
                                <option value={100}>100 Per Page</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {viewingId && (
                <NutritionistDetailModal
                    nutritionist={selectedNutritionist}
                    open={!!viewingId}
                    onClose={() => {
                        setViewingId(null);
                        setSelectedNutritionist(null);
                    }}
                />
            )}
        </div>
    );
};

export default NutritionInformationPage;
