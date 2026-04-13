import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiLayers, FiSearch, FiPlus, FiEye } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodList, deleteFood, patchFood, Food } from "./foodapi";
import AddFood from "./AddFood";
import EditFood from "./EditFood";
import FoodDetailModal from "./FoodDetailModal";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { createApiUrl } from "../../../access/access";
import { getFoodIngredientList } from "../FoodIngredient/foodingredientapi";
import { toast, ToastContainer } from "react-toastify";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { getMealTypeList, MealType } from "../MealType/mealtypeapi";
import { getCuisineTypeList, CuisineType } from "./foodapi";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import Switch from "../../../components/form/switch/Switch";

const getImageUrl = (imagePath: string | undefined | null) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  
  let path = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  if (!path.startsWith("media/")) {
    path = `media/${path}`;
  }
  return createApiUrl(path);
};

const FoodManagementPage: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFoodId, setEditFoodId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [sortField, setSortField] = useState<keyof Food | null>(null);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [selectedMealTypeId, setSelectedMealTypeId] = useState<number | "">("");
  const [selectedCuisineTypeId, setSelectedCuisineTypeId] = useState<number | "">("");
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // Search, sort, pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchFoods();
  }, [currentPage, pageSize, searchTerm, selectedMealTypeId, selectedCuisineTypeId]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const foodRes = await getFoodList(currentPage, pageSize, searchTerm, selectedMealTypeId, selectedCuisineTypeId);
      setFoods(foodRes.results);
      setTotalItems(foodRes.count);
      setTotalPages(foodRes.total_pages);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    if (filterOptionsLoaded) return;
    try {
      const [mealRes, cuisineRes] = await Promise.all([
        getMealTypeList(1, "all"),
        getCuisineTypeList(1, "all")
      ]);
      setMealTypes(mealRes.results);
      setCuisineTypes(cuisineRes.results);
      setFilterOptionsLoaded(true);
    } catch (err) {
      console.error("Error loading filter options:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Check for recipe ingredient dependencies
      const fiRes = await getFoodIngredientList(1, 1, "", id);
      if (fiRes.count > 0) {
        toast.error(`Cannot delete food item. It is used in ${fiRes.count} recipe ingredients. Please delete those ingredients first.`);
        return;
      }

      setIdToDelete(id);
    } catch {
      toast.error("An error occurred while checking dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteFood(idToDelete);
      toast.success("Food item deleted successfully.");
      setIdToDelete(null);
      fetchFoods();
    } catch {
      toast.error("Failed to delete food item.");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleToggleApproval = async (foodId: number, currentStatus: boolean) => {
    try {
      await patchFood(foodId, { is_approved: !currentStatus });
      toast.success(`Food ${!currentStatus ? 'approved' : 'disapproved'} successfully.`);
      fetchFoods();
    } catch {
      toast.error("Failed to update approval status.");
    }
  };

  const onFoodAdded = () => {
    fetchFoods();
    setIsAddModalOpen(false);
  };

  const onFoodUpdated = () => {
    fetchFoods();
    setIsEditModalOpen(false);
    setEditFoodId(null);
  };

  const sortedFoods = useMemo(() => {
    if (!sortField) return foods;
    return [...foods].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [foods, sortField, sortDirection]);

  const handleSort = (field: keyof Food) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta title="Food Management" description="Manage food list" />
      <PageBreadcrumb pageTitle="Food Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search food or meal type..."
              value={searchTerm}
              onFocus={loadFilterOptions}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <SearchableSelect
                options={[
                  { value: "", label: "All Meal Types" },
                  ...mealTypes.map(m => ({ value: m.id!, label: m.name }))
                ]}
                value={selectedMealTypeId}
                onFocus={loadFilterOptions}
                onChange={(val) => {
                  setSelectedMealTypeId(val as number | "");
                  setCurrentPage(1);
                }}
                placeholder="Filter by Meal Type"
              />
            </div>
            
            <div className="w-full sm:w-64">
              <SearchableSelect
                options={[
                  { value: "", label: "All Cuisines" },
                  ...cuisineTypes.map(c => ({ value: c.id!, label: c.name }))
                ]}
                value={selectedCuisineTypeId}
                onFocus={loadFilterOptions}
                onChange={(val) => {
                  setSelectedCuisineTypeId(val as number | "");
                  setCurrentPage(1);
                }}
                placeholder="Filter by Cuisine"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ImportButton onSuccess={fetchFoods} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <FiPlus />
              Add Food
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Image</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Food Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Meal Types
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Cuisines
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-2">
                  Price (₹) {sortField === 'price' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Approved</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-400 italic">Loading foods...</TableCell>
                </TableRow>
              ) : sortedFoods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-400 italic">No food items found</TableCell>
                </TableRow>
              ) : (
                sortedFoods.map((food, index) => (
                  <TableRow key={food.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="px-5 py-4">
                      {food.image ? (
                        <img src={getImageUrl(food.image)} alt={food.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 dark:border-gray-700 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg text-gray-400">
                          <FiLayers />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{food.name}</TableCell>
                    <TableCell className="px-5 py-4">
                       <div className="flex flex-wrap gap-1">
                        {food.meal_type_names && food.meal_type_names.length > 0 ? (
                           food.meal_type_names.map((meal, i) => (
                             <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                               {meal}
                             </span>
                           ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">none</span>
                        )}
                       </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                       <div className="flex flex-wrap gap-1">
                        {food.cuisine_type_names && food.cuisine_type_names.length > 0 ? (
                           food.cuisine_type_names.map((c, i) => (
                             <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                               {c}
                             </span>
                           ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">none</span>
                        )}
                       </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {food.price ? `₹${food.price}` : <span className="text-gray-400 font-normal italic">N/A</span>}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Switch
                        label=""
                        key={`${food.id}-${food.is_approved}`}
                        defaultChecked={food.is_approved}
                        onChange={() => handleToggleApproval(food.id!, food.is_approved || false)}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                       <div className="flex items-center gap-3 text-lg">
                        <button className="text-gray-400 hover:text-indigo-600 transition-colors" title="View Full Details" onClick={() => { setSelectedFood(food); setIsDetailModalOpen(true); }}>
                          <FiEye />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditFoodId(food.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(food.id!)}>
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

      {isAddModalOpen && <AddFood onClose={() => setIsAddModalOpen(false)} onAdd={onFoodAdded} />}
      {isEditModalOpen && editFoodId !== null && (
        <EditFood
          foodId={editFoodId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={onFoodUpdated}
        />
      )}
      {isDetailModalOpen && selectedFood && (
        <FoodDetailModal 
          food={selectedFood} 
          onClose={() => { setIsDetailModalOpen(false); setSelectedFood(null); }} 
        />
      )}

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Food Item?"
        message="Are you sure you want to delete this food item? Any active plans or recipes using this food may be affected. This action is permanent."
        confirmText="Delete Food"
      />
    </>
  );
};

export default FoodManagementPage;
