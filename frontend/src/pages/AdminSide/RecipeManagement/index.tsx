import { useEffect, useState } from "react";
import { FiPlus, FiEye, FiSearch, FiBox, FiEdit, FiTrash2 } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodList, Food } from "../Food/foodapi";
import { getMealTypeList, MealType } from "../MealType/mealtypeapi";
import { deleteFullRecipe } from "./recipeapi";
import AddRecipeModal from "./AddRecipeModal";
import EditRecipeModal from "./EditRecipeModal";
import ViewRecipeModal from "./ViewRecipeModal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";

const RecipeManagementPage: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [foodRes, mealRes] = await Promise.all([
                getFoodList(1, "all"),
                getMealTypeList(1, "all")
            ]);
            setFoods(foodRes.results);
            setMealTypes(mealRes.results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (foodId: number) => {
        if (!window.confirm("Are you sure you want to delete all ingredients and steps for this recipe?")) return;
        
        try {
            await deleteFullRecipe(foodId);
            toast.success("Recipe cleared successfully!");
            fetchData();
        } catch (err) {
            toast.error("Failed to delete recipe data.");
        }
    };

    const filteredFoods = foods.filter((f: Food) => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedFoods = filteredFoods.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(filteredFoods.length / pageSize);

    return (
        <>
            <PageMeta title="Recipe Management" description="View and Manage Full Recipes" />
            <PageBreadcrumb pageTitle="Recipe Management" />
            <ToastContainer position="bottom-right" />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative flex-1 max-w-sm">
                        <input 
                            type="text" 
                            placeholder="Search recipes..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={() => setIsAddModalOpen(true)}
                            size="sm"
                            className="inline-flex items-center gap-2"
                        >
                            <FiPlus /> Add Recipe Full
                        </Button>

                        <div className="flex items-center justify-center gap-2">
                            <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
                            <Select
                                value={String(pageSize)}
                                onChange={(val) => {
                                    setPageSize(Number(val));
                                    setCurrentPage(1);
                                }}
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
                        Showing {filteredFoods.length === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredFoods.length)} of {filteredFoods.length} entries
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
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Food Name</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Meal Types</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                                         Loading recipes...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedFoods.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                                        No recipes found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedFoods.map((food: Food, i: number) => (
                                    <TableRow key={food.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                                        <TableCell className="px-5 py-4">
                                            {food.image ? (
                                                <img 
                                                    src={food.image as string} 
                                                    alt={food.name} 
                                                    className="w-12 h-12 rounded-lg object-cover border border-gray-100 dark:border-gray-700 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                                    <FiBox />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{food.name}</div>
                                            <div className="text-xs text-gray-400 line-clamp-1">{food.description || "No description"}</div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {food.meal_type_names && food.meal_type_names.length > 0 ? (
                                                    food.meal_type_names.map((meal, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full text-[10px] font-medium border border-blue-100 dark:border-blue-900/50">
                                                            {meal}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">none</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => { setSelectedFood(food); setIsViewModalOpen(true); }}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="View Recipe"
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedFood(food); setIsEditModalOpen(true); }}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Edit Recipe"
                                                >
                                                    <FiEdit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(food.id!)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Delete Recipe Data"
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

            {/* Modals */}
            <AddRecipeModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => { fetchData(); setIsAddModalOpen(false); }}
            />

            {selectedFood && (
                <>
                    <ViewRecipeModal 
                        food={selectedFood}
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                    />
                    <EditRecipeModal 
                        food={selectedFood}
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={() => { fetchData(); setIsEditModalOpen(false); }}
                    />
                </>
            )}
        </>
    );
};

export default RecipeManagementPage;
