import React, { useEffect, useState } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiInfo, FiChevronLeft, FiChevronRight, FiCheck, FiX } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodIngredientList, deleteFoodIngredient, patchFoodIngredient, FoodIngredient } from "./foodingredientapi";
import { getFoodList, Food } from "../Food/foodapi";
import AddFoodIngredient from "./AddFoodIngredient";
import EditFoodIngredient from "./EditFoodIngredient";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";


const FoodIngredientManagementPage: React.FC = () => {
  const [foodIngredients, setFoodIngredients] = useState<FoodIngredient[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getFoodList(1, "all").then(res => setFoods(res.results)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchFoodIngredients();
  }, [selectedFoodId, currentPage, pageSize, searchTerm]);

  const fetchFoodIngredients = async () => {
    setLoading(true);
    try {
      const response = await getFoodIngredientList(
          currentPage,
          pageSize,
          searchTerm,
          selectedFoodId ? Number(selectedFoodId) : undefined
      );
      setFoodIngredients(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch {
      console.error("Failed to load food ingredients.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteFoodIngredient(idToDelete);
      toast.success("Food ingredient deleted successfully!");
      setIdToDelete(null);
      fetchFoodIngredients();
    } catch {
      toast.error("Failed to delete food ingredient.");
    } finally {
      setIsDeleting(false);
    }
  };

  const foodOptions = [
    { value: "all", label: "All Foods" },
    ...foods.map((f: Food) => ({ value: String(f.id), label: f.name }))
  ];

  return (
    <>
      <PageMeta title="Food Ingredient Management" description="Manage ingredients for recipes" />
      <PageBreadcrumb pageTitle="Food Ingredient Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-1 gap-4 w-full max-w-2xl">
            <div className="w-full max-w-xs">
              <Select
                value={selectedFoodId || "all"}
                onChange={(val) => { setSelectedFoodId(val === "all" ? "" : val); setCurrentPage(1); }}
                options={foodOptions}
                placeholder="Filter by Food"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ImportButton onSuccess={fetchFoodIngredients} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <FiPlus />
              Add Item
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Food</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Ingredient</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Quantity</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Unit</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Posted By</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400 italic">Loading recipe ingredients...</TableCell>
                </TableRow>
              ) : foodIngredients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400 italic">No recipe ingredients found.</TableCell>
                </TableRow>
              ) : (
                foodIngredients.map((fi: FoodIngredient, i: number) => (
                  <TableRow key={fi.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{foods.find((f: Food) => f.id === fi.food)?.name || "N/A"}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{fi.ingredient_name || "N/A"}</TableCell>
                    <TableCell className="px-5 py-4">{fi.quantity}</TableCell>
                    <TableCell className="px-5 py-4">
                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400">
                        {fi.unit_name || "N/A"}
                       </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">{fi.posted_by_name || 'System'}</span>
                        <span className="text-[10px] uppercase tracking-widest opacity-60 font-black text-blue-600">{fi.posted_by_role || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditId(fi.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(fi.id!)}>
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
              onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm dark:text-gray-400">
               Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddFoodIngredient 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={() => { fetchFoodIngredients(); setIsAddModalOpen(false); }} 
            initialFoodId={selectedFoodId ? Number(selectedFoodId) : undefined}
        />
      )}
      
      {isEditModalOpen && editId && (
        <EditFoodIngredient 
            editId={editId} 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onUpdated={() => { fetchFoodIngredients(); setIsEditModalOpen(false); }} 
        />
      )}

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Food Ingredient?"
        message="Are you sure you want to remove this food ingredient? This action is permanent."
        confirmText="Delete Food Ingredient"
      />
    </>
  );
};

export default FoodIngredientManagementPage;
