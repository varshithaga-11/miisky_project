import React, { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getAdminNutritionistList } from "./api";
import { toast, ToastContainer } from "react-toastify";
import {
    FiUser, FiSearch, FiPhone, FiMail,
    FiChevronRight, FiCheckCircle, FiClock
} from "react-icons/fi";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { NutritionistDetailModal } from "./NutritionistDetailModal";

const NutritionInformationPage: React.FC = () => {
    const [nutritionists, setNutritionists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [viewingId, setViewingId] = useState<number | null>(null);
    const [selectedNutritionist, setSelectedNutritionist] = useState<any>(null);

    const fetchList = useCallback(async (page: number, search: string, lim: number) => {
        setLoading(true);
        try {
            const data = await getAdminNutritionistList(page, search, lim);
            setNutritionists(data.results);
            setTotalPages(data.total_pages);
            setTotalItems(typeof data.count === "number" ? data.count : 0);
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
        <>
            <PageMeta title="Dietitian Overview" description="Manage and view nutritionist professional records" />
            <PageBreadcrumb pageTitle="Dietitian Management" />
            <ToastContainer position="bottom-right" className="z-[99999]" />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find by name, email, credentials..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
                        <Select
                            value={String(limit)}
                            onChange={(val) => {
                                setLimit(Number(val));
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: "10", label: "10" },
                                { value: "20", label: "20" },
                                { value: "50", label: "50" },
                                { value: "100", label: "100" },
                            ]}
                            className="w-20"
                        />
                        <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        Showing {totalItems === 0 ? 0 : (currentPage - 1) * limit + 1} to{" "}
                        {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Dietitian details
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Credentials
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Stats
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Verification
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading && nutritionists.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                                        Loading dietitians…
                                    </TableCell>
                                </TableRow>
                            ) : nutritionists.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                                        No dietitians found for this search
                                    </TableCell>
                                </TableRow>
                            ) : (
                                nutritionists.map((nut) => (
                                    <TableRow key={nut.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <TableCell className="px-5 py-4 text-start">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                                                    {nut.photo ? (
                                                        <img src={nut.photo} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <FiUser size={22} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                                                        {nut.first_name} {nut.last_name}
                                                    </div>
                                                    <div className="text-theme-xs text-gray-500 dark:text-gray-400 flex flex-col gap-0.5 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <FiMail className="shrink-0" /> {nut.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FiPhone className="shrink-0" /> {nut.mobile || "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <div className="text-theme-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Experience</div>
                                            <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                                {nut.qualification || "General nutritionist"} · {nut.experience || "0"} yrs
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <div className="flex gap-4">
                                                <div>
                                                    <div className="text-theme-xs text-gray-500 dark:text-gray-400">Active</div>
                                                    <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">12+</div>
                                                </div>
                                                <div>
                                                    <div className="text-theme-xs text-gray-500 dark:text-gray-400">Rating</div>
                                                    <div className="text-theme-sm font-medium text-amber-600 dark:text-amber-400">4.8 ★</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">{getStatusBadge(nut.is_active)}</TableCell>
                                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedNutritionist(nut);
                                                    setViewingId(nut.id);
                                                }}
                                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                                            >
                                                View details <FiChevronRight className="text-lg" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        currentPage === pageNum
                                            ? "bg-blue-600 text-white border border-blue-600"
                                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </div>
                </div>
            )}

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
        </>
    );
};

export default NutritionInformationPage;
