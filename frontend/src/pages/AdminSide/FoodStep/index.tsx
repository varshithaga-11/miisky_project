import { useEffect, useState } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getFoodStepList, deleteFoodStep, FoodStep } from "./foodstepapi";
import { getFoodList, Food } from "../Food/foodapi";
import AddFoodStep from "./AddFoodStep";
import EditFoodStep from "./EditFoodStep";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

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
      console.error("Failed to load food steps.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteFoodStep(id);
      fetchSteps();
    } catch {
      alert("Failed to delete.");
    }
  };

  const foodOptions = [
    { value: "all", label: "All Foods" },
    ...foods.map(f => ({ value: String(f.id), label: f.name }))
  ];

  return (
    <>
      <PageMeta title="Food Step Management" description="Manage preparation steps for recipes" />
      <PageBreadcrumb pageTitle="Food Step Management" />
      
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
                placeholder="Search steps..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ImportButton onSuccess={fetchSteps} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <FiPlus />
              Add Step
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Food Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Step No.</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Instruction</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && steps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">Loading steps...</TableCell>
                </TableRow>
              ) : steps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">No steps found.</TableCell>
                </TableRow>
              ) : (
                steps.map((step, i) => (
                  <TableRow key={step.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{foods.find(f => f.id === step.food)?.name || "N/A"}</TableCell>
                    <TableCell className="px-5 py-4">
                       <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                        Step {step.step_number}
                       </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 max-w-md">
                      <div className="line-clamp-2 text-gray-600 dark:text-gray-400">{step.instruction}</div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditId(step.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(step.id!)}>
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
