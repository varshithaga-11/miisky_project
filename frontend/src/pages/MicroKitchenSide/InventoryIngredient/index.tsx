import React, { useEffect, useState } from "react";
import {
    fetchInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    InventoryIngredient
} from "./api";
import { fetchIngredients, MicroKitchenIngredient } from "../Ingredient/api";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiAlertTriangle, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import SearchableSelect from "../../../components/form/SearchableSelect";
import Label from "../../../components/form/Label";

const InventoryPage: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryIngredient[]>([]);
    const [baseIngredients, setBaseIngredients] = useState<MicroKitchenIngredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryIngredient | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // Infinite scroll for base ingredients
    const [baseIngPage, setBaseIngPage] = useState(1);
    const [loadingMoreIng, setLoadingMoreIng] = useState(false);
    const [hasMoreIng, setHasMoreIng] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [ingSearchTerm, setIngSearchTerm] = useState("");

    const [formData, setFormData] = useState<Partial<InventoryIngredient>>({
        ingredient: 0,
        quantity: 0,
        low_stock_threshold: 5
    });

    const loadData = async (page = 1, limit = pageSize, search = searchTerm) => {
        setLoading(true);
        try {
            const invData = await fetchInventory(page, limit, search);
            setInventory(invData.results);
            setTotalItems(invData.count);
            setCurrentPage(page);
        } catch (error) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const loadBaseIngredients = async (page = 1, append = false, search = ingSearchTerm) => {
        if (append) setLoadingMoreIng(true);
        
        try {
            const ingData = await fetchIngredients(page, 10, search);
            const results = ingData.results || [];
            if (append) {
                setBaseIngredients(prev => [...prev, ...results]);
            } else {
                setBaseIngredients(results);
            }
            setHasMoreIng(results.length === 10);
            setBaseIngPage(page);
        } catch (error) {
            toast.error("Failed to load base ingredients");
        } finally {
            setLoadingMoreIng(false);
        }
    };

    const handleLoadMoreIngredients = () => {
        if (hasMoreIng && !loadingMoreIng) {
            loadBaseIngredients(baseIngPage + 1, true, ingSearchTerm);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            const timer = setTimeout(() => {
                loadBaseIngredients(1, false, ingSearchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [ingSearchTerm, isModalOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData(1, pageSize, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, pageSize]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ingredient) {
            toast.warning("Please select an ingredient");
            return;
        }
        try {
            if (editingItem?.id) {
                await updateInventoryItem(editingItem.id, formData);
                toast.success("Stock updated successfully");
            } else {
                await createInventoryItem(formData);
                toast.success("Stock added successfully");
            }
            setIsModalOpen(false);
            setEditingItem(null);
            loadData(currentPage);
        } catch (error: any) {
            const errorMsg = error.response?.data?.ingredient || error.response?.data?.detail || "Failed to save stock item";
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this item from inventory?")) return;
        try {
            await deleteInventoryItem(id);
            toast.success("Item removed from inventory");
            loadData(currentPage);
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    const openModal = (item: InventoryIngredient | null = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                ingredient: item.ingredient,
                quantity: item.quantity,
                low_stock_threshold: item.low_stock_threshold
            });
        } else {
            setEditingItem(null);
            setFormData({
                // ingredient: 0,
                // quantity: 0,
                // low_stock_threshold: 0
            });
        }
        setIsModalOpen(true);
    };

    const isLowStock = (item: InventoryIngredient) => item.quantity <= item.low_stock_threshold;

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <PageMeta title="Kitchen Inventory | Miisky" description="Manage kitchen stock levels" />
            <PageBreadcrumb pageTitle="Inventory Management" />
            <ToastContainer />

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Kitchen Inventory</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track real-time stock levels and low-threshold alerts.</p>
                    </div>
                    <Button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/20 transition-all active:scale-95"
                    >
                        <FiPlus size={20} />
                        <span className="font-bold">Add  Stock</span>
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 transition-all outline-none text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Label className="text-sm font-bold text-gray-500">Show:</Label>
                        <Select
                            value={String(pageSize)}
                            onChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}
                            options={[
                                { value: "10", label: "10" },
                                { value: "14", label: "14" },
                                { value: "20", label: "20" },
                                { value: "50", label: "50" },
                            ]}
                            className="w-20"
                        />
                        <span className="text-sm text-gray-500 font-medium">rows</span>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ingredient</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Stock Level</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Low Threshold</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Last Updated</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 italic">Syncing inventory...</TableCell>
                                    </TableRow>
                                ) : inventory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 italic">No inventory records found.</TableCell>
                                    </TableRow>
                                ) : (
                                    inventory.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                            <TableCell className="px-5 py-4 text-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="font-bold text-gray-800 dark:text-white/90">{item.ingredient_name}</div>
                                                    {isLowStock(item) && (
                                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
                                                            <FiAlertTriangle size={10} />
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center">
                                                <span className={`text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest ${isLowStock(item)
                                                    ? "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                    }`}>
                                                    {item.quantity} {item.unit_name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center text-theme-sm font-medium text-gray-400">
                                                {item.low_stock_threshold} {item.unit_name}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-xs text-gray-400 font-medium">
                                                {item.last_updated ? new Date(item.last_updated).toLocaleString() : "-"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-end">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => openModal(item)}
                                                        className="text-blue-600 hover:text-blue-800 text-lg transition-all"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id!)}
                                                        className="text-red-600 hover:text-red-800 text-lg transition-all"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
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
                                onClick={() => loadData(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => loadData(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white border border-blue-600'
                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => loadData(Math.min(totalPages, currentPage + 1))}
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
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/10 min-h-[550px]"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {editingItem ? "Update Stock" : "New Stock Item"}
                                    </h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {!editingItem && (
                                        <div>
                                            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Select Ingredient</label>
                                            <SearchableSelect
                                                value={formData.ingredient || ""}
                                                onChange={(val) => setFormData({ ...formData, ingredient: Number(val) })}
                                                options={baseIngredients.map(i => ({ label: `${i.name} (${i.unit_name})`, value: i.id! }))}
                                                placeholder="Search and select ingredient"
                                                onFocus={() => {
                                                    if (baseIngredients.length === 0) loadBaseIngredients(1, false, "");
                                                }}
                                                onSearch={(val) => setIngSearchTerm(val)}
                                                onLoadMore={handleLoadMoreIngredients}
                                                isLoadingMore={loadingMoreIng}
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Quantity</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                placeholder="Enter Quantity"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Low Threshold</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                placeholder="Lowest that quantity can go"
                                                value={formData.low_stock_threshold}
                                                onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <FiCheck size={20} />
                                            {editingItem ? "Update Stock" : "Add to Inventory"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryPage;
