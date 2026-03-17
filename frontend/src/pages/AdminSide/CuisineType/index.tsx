import { useEffect, useState } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getCuisineTypeList, deleteCuisineType, CuisineType } from "./cuisinetypeapi";
import AddCuisineType from "./AddCuisineType";
import EditCuisineType from "./EditCuisineType";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CuisineTypePage: React.FC = () => {
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  useEffect(() => {
    fetchCuisines();
  }, [currentPage, searchTerm]);

  const fetchCuisines = async () => {
    setLoading(true);
    try {
      const resp = await getCuisineTypeList(currentPage, pageSize, searchTerm);
      setCuisines(resp.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this cuisine type?")) return;
    try {
      await deleteCuisineType(id);
      toast.success("Deleted successfully");
      fetchCuisines();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <PageMeta title="Cuisine Types" description="Manage cuisine types" />
      <PageBreadcrumb pageTitle="Cuisine Types" />
      <ToastContainer position="bottom-right" />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search cuisine..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
        
        <div className="flex items-center gap-4">
          <ImportButton onSuccess={fetchCuisines} />
          <Button size="sm" className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
            <FiPlus /> Add Cuisine
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Name</TableCell>
              <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400 text-right">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={3} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : cuisines.length === 0 ? (
               <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-400 italic">No records found</TableCell></TableRow>
            ) : (
                cuisines.map((item, idx) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="px-5 py-4 font-medium">{item.name}</TableCell>
                        <TableCell className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-3">
                                <button className="text-blue-600 hover:text-blue-800" onClick={() => { setEditId(item.id!); setIsEditModalOpen(true); }}>
                                    <FiEdit />
                                </button>
                                <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(item.id!)}>
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

      {isAddModalOpen && <AddCuisineType onClose={() => setIsAddModalOpen(false)} onAdd={() => fetchCuisines()} />}
      {isEditModalOpen && editId && <EditCuisineType cuisineId={editId} onClose={() => setIsEditModalOpen(false)} onUpdated={() => fetchCuisines()} />}
    </>
  );
};

export default CuisineTypePage;
