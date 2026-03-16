import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiLayers } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodList, deleteFood, Food } from "./foodapi";
import AddFood from "./AddFood";
import EditFood from "./EditFood";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const FoodManagementPage: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFoodId, setEditFoodId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof Food | null>(null);

  // Search, sort, pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const list = await getFoodList();
      setFoods(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await deleteFood(id);
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Failed to delete food item.");
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

  const filteredFoods = useMemo(() => {
    let filtered = foods;
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [foods, searchTerm]);

  const sortedFoods = useMemo(() => {
    if (!sortField) return filteredFoods;
    return [...filteredFoods].sort((a, b) => {
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
  }, [filteredFoods, sortField, sortDirection]);

  const paginatedFoods = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedFoods.slice(startIndex, startIndex + pageSize);
  }, [sortedFoods, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedFoods.length / pageSize);

  const handleSort = (field: keyof Food) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  if (loading && foods.length === 0) return <div className="p-6">Loading foods...</div>;

  return (
    <>
      <PageMeta title="Food Management" description="Manage food list" />
      <PageBreadcrumb pageTitle="Food Management" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search food or category..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-4">
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Food
            </Button>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-400">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                ]}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start">#</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">Image</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Food Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={() => handleSort('category_name')}>
                  <div className="flex items-center gap-2">
                    Category {sortField === 'category_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedFoods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500">No food items found</TableCell>
                </TableRow>
              ) : (
                paginatedFoods.map((food, index) => (
                  <TableRow key={food.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="px-5 py-4">
                      {food.image ? (
                        <img src={food.image} alt={food.name} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded text-gray-400">
                          <FiLayers />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{food.name}</TableCell>
                    <TableCell className="px-5 py-4">{food.category_name || "Uncategorized"}</TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
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
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
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
    </>
  );
};

export default FoodManagementPage;
