import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getIngredientList, deleteIngredient, Ingredient } from "./ingredientapi";
import AddIngredient from "./AddIngredient";
import EditIngredient from "./EditIngredient";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";

const IngredientManagementPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editIngredientId, setEditIngredientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const list = await getIngredientList();
      setIngredients(list);
    } catch {
      alert("Failed to load ingredients.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteIngredient(id);
      setIngredients(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Failed to delete ingredient.");
    }
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [ingredients, searchTerm]);

  return (
    <>
      <PageMeta title="Ingredient Management" description="Manage ingredients" />
      <PageBreadcrumb pageTitle="Ingredient Management" />
      
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Button onClick={() => setIsAddModalOpen(true)}>Add Ingredient</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>#</TableCell>
              <TableCell isHeader>Ingredient Name</TableCell>
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>
                  <div className="flex gap-3 text-lg">
                    <button onClick={() => { setEditIngredientId(u.id!); setIsEditModalOpen(true); }} className="text-blue-500"><FiEdit /></button>
                    <button onClick={() => handleDelete(u.id!)} className="text-red-500"><FiTrash2 /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isAddModalOpen && <AddIngredient onClose={() => setIsAddModalOpen(false)} onAdd={() => { fetchIngredients(); setIsAddModalOpen(false); }} />}
      {isEditModalOpen && editIngredientId && (
        <EditIngredient ingredientId={editIngredientId} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdated={() => { fetchIngredients(); setIsEditModalOpen(false); }} />
      )}
    </>
  );
};

export default IngredientManagementPage;
