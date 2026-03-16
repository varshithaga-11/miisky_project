import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodIngredientList, deleteFoodIngredient, FoodIngredient } from "./foodingredientapi";
import { getFoodList, Food } from "../Food/foodapi";
import { getIngredientList, Ingredient } from "../Ingredient/ingredientapi";
import { getUnitList, Unit } from "../Unit/unitapi";
import AddFoodIngredient from "./AddFoodIngredient";
import EditFoodIngredient from "./EditFoodIngredient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";

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
      alert("Failed to load food ingredients.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteFoodIngredient(id);
      setFoodIngredients(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  const foodOptions = [
    { value: "", label: "All Foods" },
    ...foods.map(f => ({ value: String(f.id), label: f.name }))
  ];

  return (
    <>
      <PageMeta title="Food Ingredient Management" description="Manage ingredients for recipes" />
      <PageBreadcrumb pageTitle="Food Ingredient Management" />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-1 gap-4 w-full max-w-2xl">
          <div className="w-full max-w-xs">
            <Select
              value={selectedFoodId}
              onChange={(val) => setSelectedFoodId(val)}
              options={foodOptions}
              placeholder="Filter by Food"
            />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search recipe ingredients..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsAddModalOpen(true)}>Add Recipe Ingredient</Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show:</span>
            <select 
              className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[5, 10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
         Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>#</TableCell>
              <TableCell isHeader>Food</TableCell>
              <TableCell isHeader>Ingredient</TableCell>
              <TableCell isHeader>Quantity</TableCell>
              <TableCell isHeader>Unit</TableCell>
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {foodIngredients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">No recipe ingredients found.</TableCell>
                </TableRow>
            ) : (
                foodIngredients.map((fi, i) => (
                    <TableRow key={fi.id}>
                      <TableCell>{(currentPage - 1) * pageSize + i + 1}</TableCell>
                      <TableCell>{foods.find(f => f.id === fi.food)?.name || "N/A"}</TableCell>
                      <TableCell>{fi.ingredient_name || "N/A"}</TableCell>
                      <TableCell>{fi.quantity}</TableCell>
                      <TableCell>{fi.unit_name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex gap-3 text-lg">
                          <button onClick={() => { setEditId(fi.id!); setIsEditModalOpen(true); }} className="text-blue-500"><FiEdit /></button>
                          <button onClick={() => handleDelete(fi.id!)} className="text-red-500"><FiTrash2 /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
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
    </>
  );
};

export default FoodIngredientManagementPage;
