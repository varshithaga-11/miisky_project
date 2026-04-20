import React, { useEffect, useState, useRef } from "react";
import { FiPlus, FiEye, FiSearch, FiBox, FiEdit, FiTrash2, FiInfo, FiChevronLeft, FiChevronRight, FiCheck, FiX } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodList, Food, patchFood } from "../Food/foodapi";
import { getMealTypeList, MealType } from "../MealType/mealtypeapi";
import { deleteFullRecipe } from "./recipeapi";
import AddRecipeModal from "./AddRecipeModal";
import EditRecipeModal from "./EditRecipeModal";
import ViewRecipeModal from "./ViewRecipeModal";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import { createApiUrl } from "../../../access/access";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { getCuisineTypeList, CuisineType } from "../Food/foodapi";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getUserRoleFromToken } from "../../../utils/auth";


const getImageUrl = (imagePath: string | undefined | null) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  let path = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  if (!path.startsWith("media/")) {
    path = `media/${path}`;
  }
  return createApiUrl(path);
};

const RecipeManagementPage: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const userRole = getUserRoleFromToken();
    const isAdmin = userRole === "admin" || userRole === "master";
    const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
    const [selectedMealTypeId, setSelectedMealTypeId] = useState<number | "">("");
    const [selectedCuisineTypeId, setSelectedCuisineTypeId] = useState<number | "">("");
    const [mealTypesLoaded, setMealTypesLoaded] = useState(false);
    const [cuisineTypesLoaded, setCuisineTypesLoaded] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const fetchingMealsRef = useRef(false);
    const fetchingCuisinesRef = useRef(false);
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [approvalTarget, setApprovalTarget] = useState<{ id: number; currentStatus: boolean } | null>(null);
    const [rejectionTarget, setRejectionTarget] = useState<number | null>(null);
    const [isApprovingLoading, setIsApprovingLoading] = useState(false);

    useEffect(() => {
        fetchFoods();
    }, [currentPage, pageSize, searchTerm, selectedMealTypeId, selectedCuisineTypeId]);

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const foodRes = await getFoodList(
                currentPage,
                pageSize,
                searchTerm || undefined,
                selectedMealTypeId || undefined,
                selectedCuisineTypeId || undefined,
                undefined,
                undefined,
                true
            );
            setFoods(foodRes.results);
            setTotalItems(foodRes.count);
            setTotalPages(foodRes.total_pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMealTypes = async () => {
        if (mealTypesLoaded || fetchingMealsRef.current) return;
        fetchingMealsRef.current = true;
        try {
            const mealRes = await getMealTypeList(1, "all") as { results: MealType[] };
            setMealTypes(mealRes.results);
            setMealTypesLoaded(true);
        } catch (err) {
            console.error("Error loading meal types:", err);
        } finally {
            fetchingMealsRef.current = false;
        }
    };

    const fetchCuisineTypes = async () => {
        if (cuisineTypesLoaded || fetchingCuisinesRef.current) return;
        fetchingCuisinesRef.current = true;
        try {
            const cuisineRes = await getCuisineTypeList(1, "all") as { results: CuisineType[] };
            setCuisineTypes(cuisineRes.results);
            setCuisineTypesLoaded(true);
        } catch (err) {
            console.error("Error loading cuisine types:", err);
        } finally {
            fetchingCuisinesRef.current = false;
        }
    };

    const fetchData = async () => {
        await fetchFoods();
    };

    const handleDelete = (foodId: number) => {
        setIdToDelete(foodId);
    };

    const confirmDelete = async () => {
        if (idToDelete === null) return;
        setIsDeleting(true);
        try {
            await deleteFullRecipe(idToDelete);
            toast.success("Recipe cleared successfully!");
            setIdToDelete(null);
            fetchData();
        } catch (err) {
            toast.error("Failed to delete recipe data.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApprovalClick = (id: number, currentStatus: boolean) => {
        setApprovalTarget({ id, currentStatus });
    };

    const confirmApproval = async () => {
        if (!approvalTarget) return;
        const { id, currentStatus } = approvalTarget;
        if (!currentStatus) {
            // toast.info("Please don't repeat the words — it may cause some issues.");
        }
        setIsApprovingLoading(true);
        try {
            await patchFood(id, { is_approved: !currentStatus });
            toast.success(`Recipe ${!currentStatus ? 'approved' : 'disapproved'} successfully.`);
            fetchData();
        } catch {
            toast.error("Failed to update approval status.");
        } finally {
            setIsApprovingLoading(false);
            setApprovalTarget(null);
        }
    };

    const handleRejectClick = (id: number) => {
        setRejectionTarget(id);
    };

    const confirmRejection = async () => {
        if (rejectionTarget === null) return;
        setIsApprovingLoading(true);
        try {
            await patchFood(rejectionTarget, { is_rejected: true, is_approved: false });
            toast.success("Recipe rejected successfully.");
            fetchData();
        } catch {
            toast.error("Failed to reject recipe.");
        } finally {
            setIsApprovingLoading(false);
            setRejectionTarget(null);
        }
    };

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
                            onFocus={() => { fetchMealTypes(); fetchCuisineTypes(); }}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                                onFocus={fetchMealTypes}
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
                                onFocus={fetchCuisineTypes}
                                onChange={(val) => {
                                    setSelectedCuisineTypeId(val as number | "");
                                    setCurrentPage(1);
                                }}
                                placeholder="Filter by Cuisine"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ImportButton onSuccess={fetchData} />
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
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                    <div>
                        Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                        <FiInfo className="w-4 h-4" />
                        <span>{isAdmin ? "Before approving, please re-check if any data is repeated to avoid issues." : "Please don't repeat same word it may cause problems."}</span>
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
                                {isAdmin && <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Approved</TableCell>}
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-400 italic">
                                         Loading recipes...
                                    </TableCell>
                                </TableRow>
                            ) : foods.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-400 italic">
                                        No recipes found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                foods.map((food: Food, i: number) => (
                                    <TableRow key={food.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                                        <TableCell className="px-5 py-4">
                                            {food.image ? (
                                                <img 
                                                    src={getImageUrl(food.image as string)} 
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
                                        {isAdmin && (
                                            <TableCell className="px-5 py-4">
                                                {food.is_approved ? (
                                                    <button
                                                        onClick={() => handleApprovalClick(food.id!, true)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                                        title="Click to disapprove"
                                                    >
                                                        <FiCheck size={12} /> Approved
                                                    </button>
                                                ) : food.is_rejected ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400">
                                                        <FiX size={12} /> Rejected
                                                    </span>
                                                ) : food.posted_by_role === 'nutritionist' ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApprovalClick(food.id!, false)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                                            title="Click to approve"
                                                        >
                                                            <FiCheck size={12} /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(food.id!)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                                                            title="Click to reject"
                                                        >
                                                            <FiX size={12} /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Pending</span>
                                                )}
                                            </TableCell>
                                        )}
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
                                                {isAdmin && (
                                                    <button 
                                                        onClick={() => handleDelete(food.id!)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete Recipe Data"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}
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
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1"
                        >
                            <FiChevronLeft /> Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((p: number, i: number, arr: number[]) => (
                                    <React.Fragment key={p}>
                                        {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-gray-400">...</span>}
                                        <button
                                            onClick={() => setCurrentPage(p)}
                                            className={`px-3 py-1 text-sm rounded ${currentPage === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                        >
                                            {p}
                                        </button>
                                    </React.Fragment>
                                ))
                            }
                        </div>

                        <button
                            onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1"
                        >
                            Next <FiChevronRight />
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
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

            <ConfirmationModal
                isOpen={rejectionTarget !== null}
                onClose={() => setRejectionTarget(null)}
                onConfirm={confirmRejection}
                title="Reject Recipe"
                message="Are you sure you want to reject this recipe?"
                confirmText="Yes, Reject"
                cancelText="No"
                variant="danger"
            />

            <ConfirmationModal
                isOpen={idToDelete !== null}
                onClose={() => setIdToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Recipe Data?"
                message="Are you sure you want to delete all ingredients and steps for this recipe? This action only clears the recipe details, not the food item itself."
                confirmText="Clear Recipe"
            />

            <ConfirmationModal
                isOpen={approvalTarget !== null}
                onClose={() => setApprovalTarget(null)}
                onConfirm={confirmApproval}
                isLoading={isApprovingLoading}
                title={approvalTarget?.currentStatus ? "Disapprove Recipe?" : "Approve Recipe?"}
                message={
                    approvalTarget?.currentStatus
                        ? "Are you sure you want to disapprove this recipe? It will no longer be visible to other users."
                        : "Are you sure you want to approve this recipe? Please ensure there are no duplicate entries before approving."
                }
                confirmText={approvalTarget?.currentStatus ? "Yes, Disapprove" : "Yes, Approve"}
            />
        </>
    );
};

export default RecipeManagementPage;
