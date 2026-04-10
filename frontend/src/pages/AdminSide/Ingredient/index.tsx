import { useEffect, useState } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getIngredientList, deleteIngredient, Ingredient } from "./ingredientapi";
import { getFoodIngredientList } from "../FoodIngredient/foodingredientapi";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import AddIngredient from "./AddIngredient";
import EditIngredient from "./EditIngredient";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const IngredientManagementPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editIngredientId, setEditIngredientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, [currentPage, pageSize, searchTerm]);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await getIngredientList(currentPage, pageSize, searchTerm);
      setIngredients(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch {
      console.error("Failed to load ingredients.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Pre-check for dependencies (Food Ingredients)
      const foodIngRes = await getFoodIngredientList(1, 1, "", undefined, id);
      
      if (foodIngRes.count > 0) {
        toast.error(`Cannot delete ingredient. It is used in ${foodIngRes.count} food items. Please remove it from there first.`);
        return;
      }

      setRecordToDelete(id);
    } catch {
      toast.error("An error occurred while checking dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (recordToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteIngredient(recordToDelete);
      toast.success("Ingredient deleted successfully!");
      setRecordToDelete(null);
      fetchIngredients();
    } catch {
      toast.error("Failed to delete ingredient.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageMeta title="Ingredient Management" description="Manage ingredients" />
      <PageBreadcrumb pageTitle="Ingredient Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div className="flex items-center gap-4">
            <ImportButton onSuccess={fetchIngredients} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <FiPlus />
              Add Ingredient
            </Button>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                ]}
                className="w-20"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Ingredient Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">Loading ingredients...</TableCell>
                </TableRow>
              ) : ingredients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">No ingredients found</TableCell>
                </TableRow>
              ) : (
                ingredients.map((u, i) => (
                  <TableRow key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{u.name}</TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditIngredientId(u.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(u.id!)}>
                          <FiTrash2 />
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
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm dark:text-gray-400">
               Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isAddModalOpen && <AddIngredient onClose={() => setIsAddModalOpen(false)} onAdd={() => { fetchIngredients(); setIsAddModalOpen(false); }} />}
      {isEditModalOpen && editIngredientId && (
        <EditIngredient 
           ingredientId={editIngredientId} 
           isOpen={isEditModalOpen} 
           onClose={() => setIsEditModalOpen(false)} 
           onUpdated={() => { fetchIngredients(); setIsEditModalOpen(false); }} 
        />
      )}

      <ConfirmationModal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Ingredient?"
        message="Are you sure you want to remove this ingredient? This will affect all food items using it."
        confirmText="Delete Ingredient"
      />
    </>
  );
};

export default IngredientManagementPage;
