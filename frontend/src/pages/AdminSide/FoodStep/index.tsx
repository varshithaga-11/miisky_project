import { useEffect, useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodStepList, deleteFoodStep, FoodStep } from "./foodstepapi";
import { getFoodList, Food } from "../Food/foodapi";
import AddFoodStep from "./AddFoodStep";
import EditFoodStep from "./EditFoodStep";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";

const FoodStepManagementPage: React.FC = () => {
  const [steps, setSteps] = useState<FoodStep[]>([]);
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
    fetchSteps();
  }, [selectedFoodId, currentPage, pageSize, searchTerm]);

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const response = await getFoodStepList(
          currentPage,
          pageSize,
          searchTerm,
          selectedFoodId ? Number(selectedFoodId) : undefined
      );
      // Sort steps by step_number locally for display
      const sortedList = response.results.sort((a, b) => a.step_number - b.step_number);
      setSteps(sortedList);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch {
      alert("Failed to load food steps.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteFoodStep(id);
      setSteps(prev => prev.filter(s => s.id !== id));
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
      <PageMeta title="Food Step Management" description="Manage preparation steps for recipes" />
      <PageBreadcrumb pageTitle="Food Step Management" />
      
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
              placeholder="Search steps..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsAddModalOpen(true)}>Add Preparation Step</Button>
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
              <TableCell isHeader>Food Name</TableCell>
              <TableCell isHeader>Step No.</TableCell>
              <TableCell isHeader>Instruction</TableCell>
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && steps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading steps...</TableCell>
                </TableRow>
            ) : steps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">No steps found.</TableCell>
                </TableRow>
            ) : (
                steps.map((step, i) => (
                    <TableRow key={step.id}>
                      <TableCell>{(currentPage - 1) * pageSize + i + 1}</TableCell>
                      <TableCell>{foods.find(f => f.id === step.food)?.name || "N/A"}</TableCell>
                      <TableCell className="font-bold">Step {step.step_number}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{step.instruction}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-3 text-lg">
                          <button onClick={() => { setEditId(step.id!); setIsEditModalOpen(true); }} className="text-blue-500" title="Edit"><FiEdit /></button>
                          <button onClick={() => handleDelete(step.id!)} className="text-red-500" title="Delete"><FiTrash2 /></button>
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
        <AddFoodStep 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={() => { fetchSteps(); setIsAddModalOpen(false); }} 
            initialFoodId={selectedFoodId ? Number(selectedFoodId) : undefined}
        />
      )}
      
      {isEditModalOpen && editId && (
        <EditFoodStep 
            editId={editId} 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onUpdated={() => { fetchSteps(); setIsEditModalOpen(false); }} 
        />
      )}
    </>
  );
};

export default FoodStepManagementPage;
