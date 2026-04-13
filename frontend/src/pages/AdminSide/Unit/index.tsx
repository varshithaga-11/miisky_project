import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiInfo } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getUnitList, deleteUnit, patchUnit, Unit } from "./unitapi";
import { getFoodIngredientList } from "../FoodIngredient/foodingredientapi";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import Switch from "../../../components/form/switch/Switch";
import AddUnit from "./AddUnit";
import EditUnit from "./EditUnit";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";

const UnitManagementPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUnitId, setEditUnitId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const list = await getUnitList();
      setUnits(list);
    } catch {
      console.error("Failed to load units.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id: number, currentStatus: boolean) => {
    // Show instruction toast
    if (!currentStatus) {
      toast.info("Please don't repeat the words it may cause some issues.");
    }
    try {
      await patchUnit(id, { is_approved: !currentStatus });
      toast.success(`Unit ${!currentStatus ? 'approved' : 'disapproved'} successfully.`);
      fetchUnits();
    } catch {
      toast.error("Failed to update approval status.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Pre-check for dependencies (Food Ingredients)
      const foodIngRes = await getFoodIngredientList(1, 1, "", undefined, undefined, id);
      
      if (foodIngRes.count > 0) {
        toast.error(`Cannot delete unit. It is used in ${foodIngRes.count} food ingredients. Please remove it from there first.`);
        return;
      }

      setRecordToDelete(id);
    } catch {
      toast.error("An error occurred while checking dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (recordToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteUnit(recordToDelete);
      toast.success("Unit deleted successfully!");
      setRecordToDelete(null);
      fetchUnits();
    } catch {
      toast.error("Failed to delete unit.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [units, searchTerm]);

  return (
    <>
      <PageMeta title="Unit Management" description="Manage measurement units" />
      <PageBreadcrumb pageTitle="Unit Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div className="flex items-center gap-4">
            <ImportButton onSuccess={fetchUnits} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <FiPlus />
              Add Unit
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
          <div>
            Showing {filteredUnits.length} of {units.length} entries
          </div>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium animate-pulse">
            <FiInfo className="w-4 h-4" />
            <span>Before approving, please re-check if any data is repeated to avoid issues.</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Unit Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Approved</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">Loading units...</TableCell>
                </TableRow>
              ) : filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">No units found</TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((u, i) => (
                  <TableRow key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{i + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{u.name}</TableCell>
                    <TableCell className="px-5 py-4">
                        <Switch 
                            label="" 
                            key={`${u.id}-${u.is_approved}`}
                            defaultChecked={u.is_approved} 
                            onChange={() => handleToggleApproval(u.id!, u.is_approved || false)} 
                        />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditUnitId(u.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(u.id!)}>
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

      {isAddModalOpen && <AddUnit onClose={() => setIsAddModalOpen(false)} onAdd={() => { fetchUnits(); setIsAddModalOpen(false); }} />}
      {isEditModalOpen && editUnitId && (
        <EditUnit unitId={editUnitId} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdated={() => { fetchUnits(); setIsEditModalOpen(false); }} />
      )}

      <ConfirmationModal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Unit?"
        message="Are you sure you want to remove this measurement unit? This will affect all ingredients using it."
        confirmText="Delete Unit"
      />
    </>
  );
};

export default UnitManagementPage;
