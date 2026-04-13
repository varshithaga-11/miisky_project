import React, { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiInfo, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMealTypeList, deleteMealType, patchMealType, MealType } from "./mealtypeapi";
import { getFoodList } from "../Food/foodapi";
import AddMealType from "./AddMealType";
import EditMealType from "./EditMealType";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import Switch from "../../../components/form/switch/Switch";

const MealTypeManagementPage: React.FC = () => {
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMealTypeId, setEditMealTypeId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof MealType | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search, sort, pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchMealTypes();
  }, [currentPage, pageSize, searchTerm]);

  const fetchMealTypes = async () => {
    setLoading(true);
    try {
      const response = await getMealTypeList(currentPage, pageSize, searchTerm);
      setMealTypes(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Pre-check for dependencies (Foods)
      const foodsResponse = await getFoodList(1, 1, "", id);
      if (foodsResponse.count > 0) {
        toast.error(`Cannot delete meal type. It has ${foodsResponse.count} associated foods. Please delete them first.`);
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
      await deleteMealType(recordToDelete);
      toast.success("Meal type deleted successfully.");
      setRecordToDelete(null);
      fetchMealTypes();
    } catch {
      toast.error("Failed to delete meal type.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleApproval = async (id: number, currentStatus: boolean) => {
    // Show instruction toast
    if (!currentStatus) {
      toast.info("Please don't repeat the words it may cause some issues.");
    }
    try {
      await patchMealType(id, { is_approved: !currentStatus });
      toast.success(`Meal type ${!currentStatus ? 'approved' : 'disapproved'} successfully.`);
      fetchMealTypes();
    } catch {
      toast.error("Failed to update approval status.");
    }
  };

  const onMealTypeAdded = () => {
    fetchMealTypes();
    setIsAddModalOpen(false);
  };

  const onMealTypeUpdated = () => {
    fetchMealTypes();
    setIsEditModalOpen(false);
    setEditMealTypeId(null);
  };

  const sortedMealTypes = useMemo(() => {
    if (!sortField) return mealTypes;
    return [...mealTypes].sort((a, b) => {
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
  }, [mealTypes, sortField, sortDirection]);

  const handleSort = (field: keyof MealType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta title="Meal Type Management" description="Manage meal types" />
      <PageBreadcrumb pageTitle="Meal Type Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search meal type..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          <div className="flex items-center gap-4">
            <ImportButton onSuccess={fetchMealTypes} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <FiPlus />
              Add Meal Type
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
          <div>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Meal Type Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Approved</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">Loading meal types...</TableCell>
                 </TableRow>
              ) : sortedMealTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">No meal types found</TableCell>
                </TableRow>
              ) : (
                sortedMealTypes.map((mealType, index) => (
                  <TableRow key={mealType.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{mealType.name}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Switch 
                        label="" 
                        key={`${mealType.id}-${mealType.is_approved}`}
                        defaultChecked={mealType.is_approved} 
                        onChange={() => handleToggleApproval(mealType.id!, mealType.is_approved || false)} 
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditMealTypeId(mealType.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(mealType.id!)}>
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
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              <FiChevronLeft /> Previous
            </button>
            
            <div className="flex items-center gap-1">
               {Array.from({ length: totalPages }, (_, i) => i + 1)
                 .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                 .map((p, i, arr) => (
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

      {isAddModalOpen && <AddMealType onClose={() => setIsAddModalOpen(false)} onAdd={onMealTypeAdded} />}
      {isEditModalOpen && editMealTypeId !== null && (
        <EditMealType
          mealTypeId={editMealTypeId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={onMealTypeUpdated}
        />
      )}

      <ConfirmationModal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Meal Type?"
        message="Are you sure you want to remove this meal type? This action is permanent."
        confirmText="Delete Meal Type"
      />
    </>
  );
};

export default MealTypeManagementPage;
