import { useEffect, useState } from "react";
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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editIngredientId, setEditIngredientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchIngredients();
  }, [currentPage, pageSize, searchTerm]);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await getIngredientList(currentPage, pageSize, searchTerm);
      setIngredients(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
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
      fetchIngredients();
    } catch {
      alert("Failed to delete ingredient.");
    }
  };

  return (
    <>
      <PageMeta title="Ingredient Management" description="Manage ingredients" />
      <PageBreadcrumb pageTitle="Ingredient Management" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsAddModalOpen(true)}>Add Ingredient</Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show:</span>
              <select 
                className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              >
                {[5, 10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
           Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>
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
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">No ingredients found</TableCell>
              </TableRow>
            ) : (
              ingredients.map((u, i) => (
                <TableRow key={u.id}>
                  <TableCell>{(currentPage - 1) * pageSize + i + 1}</TableCell>
                  <TableCell className="font-medium text-gray-800 dark:text-white/90">{u.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-3 text-lg">
                      <button onClick={() => { setEditIngredientId(u.id!); setIsEditModalOpen(true); }} className="text-blue-500"><FiEdit /></button>
                      <button onClick={() => handleDelete(u.id!)} className="text-red-500"><FiTrash2 /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2 text-sm">
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

      {isAddModalOpen && <AddIngredient onClose={() => setIsAddModalOpen(false)} onAdd={() => { fetchIngredients(); setIsAddModalOpen(false); }} />}
      {isEditModalOpen && editIngredientId && (
        <EditIngredient ingredientId={editIngredientId} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdated={() => { fetchIngredients(); setIsEditModalOpen(false); }} />
      )}
    </>
  );
};

export default IngredientManagementPage;
