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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");

  useEffect(() => {
    getFoodList().then(setFoods).catch(console.error);
    fetchSteps();
  }, [selectedFoodId]);

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const list = await getFoodStepList(selectedFoodId ? Number(selectedFoodId) : undefined);
      // Sort steps by step_number locally for display
      const sortedList = list.sort((a, b) => a.step_number - b.step_number);
      setSteps(sortedList);
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
        <div className="w-full max-w-xs">
          <Select
            value={selectedFoodId}
            onChange={(val) => setSelectedFoodId(val)}
            options={foodOptions}
            placeholder="Filter by Food"
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Preparation Step</Button>
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
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">No steps found for this food.</TableCell>
                </TableRow>
            ) : (
                steps.map((step, i) => (
                    <TableRow key={step.id}>
                      <TableCell>{(i + 1)}</TableCell>
                      <TableCell>{foods.find(f => f.id === step.food)?.name || "Loading..."}</TableCell>
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

      {isAddModalOpen && (
        <AddFoodStep 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={() => { fetchSteps(); setIsAddModalOpen(false); }} 
            initialFoodId={selectedFoodId}
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
