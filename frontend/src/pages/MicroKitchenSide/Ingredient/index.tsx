import React, { useEffect, useState } from "react";
import { 
    fetchIngredients, 
    createIngredient, 
    updateIngredient, 
    deleteIngredient, 
    checkIngredientUsage,
    MicroKitchenIngredient 
} from "./api";
import { fetchIngredientUnits, IngredientUnit } from "../IngredientUnit/api";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiBox, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import SearchableSelect from "../../../components/form/SearchableSelect";
import Label from "../../../components/form/Label";

const IngredientPage: React.FC = () => {
    const [ingredients, setIngredients] = useState<MicroKitchenIngredient[]>([]);
    const [units, setUnits] = useState<IngredientUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<MicroKitchenIngredient | null>(null);
    const [formData, setFormData] = useState<MicroKitchenIngredient>({ name: "", unit: 0 });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async (page = 1, limit = pageSize, search = searchTerm) => {
        setLoading(true);
        try {
            const ingData = await fetchIngredients(page, limit, search);
            setIngredients(ingData.results);
            setTotalItems(ingData.count);
            setCurrentPage(page);
        } catch (error) {
            toast.error("Failed to load ingredients");
        } finally {
            setLoading(false);
        }
    };

    const loadUnits = async () => {
        try {
            const unitData = await fetchIngredientUnits();
            setUnits(unitData);
        } catch (error) {
            toast.error("Failed to load units");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData(1, pageSize, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, pageSize]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.unit) {
            toast.warning("Please select a unit");
            return;
        }
        try {
            if (editingIngredient?.id) {
                await updateIngredient(editingIngredient.id, formData);
                toast.success("Ingredient updated successfully");
            } else {
                await createIngredient(formData);
                toast.success("Ingredient created successfully");
            }
            setIsModalOpen(false);
            setFormData({ name: "", unit: 0 });
            setEditingIngredient(null);
            loadData(currentPage);
        } catch (error) {
            toast.error("Failed to save ingredient");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const usage = await checkIngredientUsage(id);
            if (usage.is_used) {
                alert(`Cannot delete this ingredient as it is present in ${usage.usage_count} kitchen inventory list(s). Please remove it from those inventories first.`);
                return;
            }

            if (!window.confirm("Are you sure you want to delete this ingredient?")) return;

            await deleteIngredient(id);
            toast.success("Ingredient deleted successfully");
            loadData(currentPage);
        } catch (error) {
            toast.error("Failed to delete ingredient");
        }
    };

    const openModal = (ing: MicroKitchenIngredient | null = null) => {
        if (ing) {
            setEditingIngredient(ing);
            setFormData({ name: ing.name, unit: ing.unit });
        } else {
            setEditingIngredient(null);
            setFormData({ name: "", unit: 0 }); // 0 will trigger the placeholder if mapped correctly or use ""
        }
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <PageMeta title="Base Ingredients | Miisky" description="Manage ingredients" />
            <PageBreadcrumb pageTitle="Base Ingredients" />
            <ToastContainer />

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Base Ingredients</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Define the standard list of ingredients available for kitchens.</p>
                    </div>
                    <Button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/20 transition-all active:scale-95"
                    >
                        <FiPlus size={20} />
                        <span className="font-bold">Add Ingredient</span>
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ingredients..."
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
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ingredient Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Unit</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-right">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 italic">Loading ingredients...</TableCell>
                                    </TableRow>
                                ) : ingredients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 italic">No ingredients found.</TableCell>
                                    </TableRow>
                                ) : (
                                    ingredients.map((ing, idx) => (
                                        <TableRow key={ing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {(currentPage - 1) * pageSize + idx + 1}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                                                        <FiBox size={16} />
                                                    </div>
                                                    {ing.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-black uppercase tracking-widest dark:bg-gray-700/50 dark:text-gray-300">
                                                    {ing.unit_name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => openModal(ing)}
                                                        className="text-blue-600 hover:text-blue-800 text-lg transition-all"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ing.id!)}
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
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            currentPage === pageNum
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
                            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/10 min-h-[480px]"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {editingIngredient ? "Edit Ingredient" : "Add Ingredient"}
                                    </h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Ingredient Name</Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., Tomato, Chicken Breast"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Measurement Unit</label>
                                        <SearchableSelect
                                            value={formData.unit || ""}
                                            onChange={(val) => setFormData({ ...formData, unit: Number(val) })}
                                            options={units.map(u => ({ label: u.unit, value: u.id! }))}
                                            placeholder="Search and select unit"
                                            onFocus={loadUnits}
                                        />
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
                                            {editingIngredient ? "Update" : "Save"}
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

export default IngredientPage;
