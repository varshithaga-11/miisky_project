import { useEffect, useState } from "react";
import { FiPlus, FiEye, FiSearch, FiBox, FiEdit, FiTrash2 } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodList, Food } from "../Food/foodapi";
import { getFoodCategoryList, FoodCategory } from "../FoodCategory/foodcategoryapi";
import { deleteFullRecipe } from "./recipeapi";
import AddRecipeModal from "./AddRecipeModal";
import EditRecipeModal from "./EditRecipeModal";
import ViewRecipeModal from "./ViewRecipeModal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";

const RecipeManagementPage: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [categories, setCategories] = useState<FoodCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
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
            const [foodList, catList] = await Promise.all([
                getFoodList(),
                getFoodCategoryList()
            ]);
            setFoods(foodList);
            setCategories(catList);
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
            // We don't remove the food itself from the list because the food record still exists, 
            // but its ingredients/steps are gone.
        } catch (err) {
            toast.error("Failed to delete recipe data.");
        }
    };

    const filteredFoods = foods.filter((f: Food) => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <PageMeta title="Recipe Management" description="View and Manage Full Recipes" />
            <PageBreadcrumb pageTitle="Recipe Management" />
            <ToastContainer position="bottom-right" />

            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search recipes..." 
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 shadow-lg shadow-blue-500/20"
                >
                    <FiPlus /> Add Recipe Full
                </Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableCell isHeader>#</TableCell>
                            <TableCell isHeader>Image</TableCell>
                            <TableCell isHeader>Food Name</TableCell>
                            <TableCell isHeader>Category</TableCell>
                            <TableCell isHeader className="text-right">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-gray-500">
                                    <div className="animate-pulse flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                        <span>Loading recipes...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredFoods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-gray-400 italic">
                                    No recipes found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredFoods.map((food: Food, i: number) => (
                                <TableRow key={food.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                    <TableCell className="w-12 text-gray-400">{i + 1}</TableCell>
                                    <TableCell>
                                        {food.image ? (
                                            <img 
                                                src={food.image as string} 
                                                alt={food.name} 
                                                className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                <FiBox />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900 dark:text-white">{food.name}</div>
                                        <div className="text-xs text-gray-400">{food.description?.substring(0, 40)}...</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                            {categories.find((c: FoodCategory) => c.id === food.category)?.name || "Uncategorized"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setSelectedFood(food); setIsViewModalOpen(true); }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="View Recipe"
                                            >
                                                <FiEye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedFood(food); setIsEditModalOpen(true); }}
                                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                                                title="Edit Recipe"
                                            >
                                                <FiEdit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(food.id!)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
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
