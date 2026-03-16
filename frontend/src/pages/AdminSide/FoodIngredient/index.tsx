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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState<string>("");

  useEffect(() => {
    getFoodList().then(setFoods).catch(console.error);
    fetchFoodIngredients();
  }, [selectedFoodId]);

  const fetchFoodIngredients = async () => {
    setLoading(true);
    try {
      const list = await getFoodIngredientList(selectedFoodId ? Number(selectedFoodId) : undefined);
      setFoodIngredients(list);
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
        <div className="w-full max-w-xs">
          <Select
            value={selectedFoodId}
            onChange={(val) => setSelectedFoodId(val)}
            options={foodOptions}
            placeholder="Filter by Food"
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Recipe Ingredient</Button>
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
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{foods.find(f => f.id === fi.food)?.name || "Loading..."}</TableCell>
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

      {isAddModalOpen && (
        <AddFoodIngredient 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={() => { fetchFoodIngredients(); setIsAddModalOpen(false); }} 
            initialFoodId={selectedFoodId}
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
