import React, { useEffect, useState } from "react";
import { 
    fetchIngredientUnits, 
    createIngredientUnit, 
    updateIngredientUnit, 
    deleteIngredientUnit, 
    checkUnitUsage,
    IngredientUnit 
} from "./api";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Label from "../../../components/form/Label";

const IngredientUnitPage: React.FC = () => {
    const [units, setUnits] = useState<IngredientUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<IngredientUnit | null>(null);
    const [formData, setFormData] = useState<IngredientUnit>({ unit: "" });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const loadUnits = async () => {
        setLoading(true);
        try {
            const data = await fetchIngredientUnits();
            setUnits(data);
        } catch (error) {
            toast.error("Failed to load units");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnits();
    }, []);

    const totalPages = Math.ceil(units.length / pageSize);
    const currentUnits = units.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUnit?.id) {
                await updateIngredientUnit(editingUnit.id, formData);
                toast.success("Unit updated successfully");
            } else {
                await createIngredientUnit(formData);
                toast.success("Unit created successfully");
            }
            setIsModalOpen(false);
            setFormData({ unit: "" });
            setEditingUnit(null);
            loadUnits();
        } catch (error) {
            toast.error("Failed to save unit");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const usage = await checkUnitUsage(id);
            if (usage.is_used) {
                alert(`Cannot delete this unit as it is used in ${usage.usage_count} ingredient(s). Please delete or update those ingredients first.`);
                return;
            }

            if (!window.confirm("Are you sure you want to delete this unit?")) return;
            
            await deleteIngredientUnit(id);
            toast.success("Unit deleted successfully");
            loadUnits();
        } catch (error) {
            toast.error("Failed to delete unit");
        }
    };

    const openModal = (unit: IngredientUnit | null = null) => {
        if (unit) {
            setEditingUnit(unit);
            setFormData({ unit: unit.unit });
        } else {
            setEditingUnit(null);
            setFormData({ unit: "" });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <PageMeta title="Ingredient Units | Miisky" description="Manage ingredient units" />
            <PageBreadcrumb pageTitle="Ingredient Units" />
            <ToastContainer />

            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ingredient Units</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Standardized measurement units for inventory tracking.</p>
                    </div>
                    <Button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/20 transition-all active:scale-95"
                    >
                        <FiPlus size={20} />
                        <span className="font-bold">Add New Unit</span>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Unit Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-right">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 italic">Loading units...</TableCell>
                                    </TableRow>
                                ) : currentUnits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 italic">No units found.</TableCell>
                                    </TableRow>
                                ) : (
                                    currentUnits.map((unit, idx) => (
                                        <TableRow key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {(currentPage - 1) * pageSize + idx + 1}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                                                {unit.unit}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => openModal(unit)}
                                                        className="text-blue-600 hover:text-blue-800 text-lg transition-all"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(unit.id!)}
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
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
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
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {editingUnit ? "Edit Unit" : "Add Unit"}
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
                                        <Label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Unit Name (e.g., kg, liter, pcs)</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter unit name"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            required
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
                                            {editingUnit ? "Update" : "Save"}
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

export default IngredientUnitPage;
