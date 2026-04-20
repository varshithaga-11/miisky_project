import React, { useEffect, useState } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiInfo, FiChevronLeft, FiChevronRight, FiCheck, FiX } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getCuisineTypeList, deleteCuisineType, patchCuisineType, CuisineType } from "./cuisinetypeapi";
import { getFoodList } from "../Food/foodapi";
import AddCuisineType from "./AddCuisineType";
import EditCuisineType from "./EditCuisineType";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { getUserRoleFromToken } from "../../../utils/auth";
import { checkFoodDependency, deleteFoodRecord } from "../shared/foodManagementApi";

const CuisineTypePage: React.FC = () => {
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<number | null>(null);
  const [isApprovingLoading, setIsApprovingLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const userRole = getUserRoleFromToken();
  const isAdmin = userRole === "admin" || userRole === "master";

  useEffect(() => {
    fetchCuisines();
  }, [currentPage, pageSize, searchTerm]);

  const fetchCuisines = async () => {
    setLoading(true);
    try {
      const resp = await getCuisineTypeList(currentPage, pageSize, searchTerm);
      setCuisines(resp.results);
      setTotalItems(resp.count);
      setTotalPages(resp.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalClick = (id: number, currentStatus: boolean) => {
    setApprovalTarget({ id, currentStatus });
  };

  const confirmApproval = async () => {
    if (!approvalTarget) return;
    const { id, currentStatus } = approvalTarget;
    if (!currentStatus) {
      // toast.info("Please don't repeat the words — it may cause some issues.");
    }
    setIsApprovingLoading(true);
    try {
      await patchCuisineType(id, { is_approved: !currentStatus });
      toast.success(`Cuisine type ${!currentStatus ? 'approved' : 'disapproved'} successfully.`);
      fetchCuisines();
    } catch {
      toast.error("Failed to update approval status.");
    } finally {
      setIsApprovingLoading(false);
      setApprovalTarget(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await checkFoodDependency("cuisine_type", id);
      if (res.detail !== "none") {
        toast.error(`Cannot delete as it has ${res.detail}. Please remove them first.`);
        return;
      }
      setRecordToDelete(id);
    } catch {
      toast.error("Failed to check dependencies");
    }
  };

  const confirmDelete = async () => {
    if (recordToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteFoodRecord("cuisine_type", recordToDelete);
      toast.success("Cuisine type deleted successfully!");
      setRecordToDelete(null);
      fetchCuisines();
    } catch {
      toast.error("Failed to delete cuisine type");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRejectClick = (id: number) => {
    setRejectionTarget(id);
  };

  const confirmRejection = async () => {
    if (rejectionTarget === null) return;
    setIsApprovingLoading(true);
    try {
      await patchCuisineType(rejectionTarget, { is_rejected: true, is_approved: false });
      toast.success("Cuisine type rejected successfully.");
      fetchCuisines();
    } catch {
      toast.error("Failed to reject cuisine type.");
    } finally {
      setIsApprovingLoading(false);
      setRejectionTarget(null);
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

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium animate-pulse">
            <FiInfo className="w-4 h-4" />
            <span>{isAdmin ? "Before approving, please re-check if any data is repeated to avoid issues." : "Please don't repeat same word it may cause problems."}</span>
          </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
           Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400 text-start">#</TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400 text-start">Name</TableCell>
                {isAdmin && <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400 text-start">Approved</TableCell>}
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 uppercase dark:text-gray-400 text-end">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-400 italic">Loading...</TableCell></TableRow>
              ) : cuisines.length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-400 italic">No records found</TableCell></TableRow>
              ) : (
                  cuisines.map((item: CuisineType, idx: number) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                          <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.name}</TableCell>
                          {isAdmin && (
                            <TableCell className="px-5 py-4">
                                {item.is_approved ? (
                                  <button
                                    onClick={() => handleApprovalClick(item.id!, true)}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                    title="Click to disapprove"
                                  >
                                    <FiCheck size={12} /> Approved
                                  </button>
                                ) : item.is_rejected ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400">
                                      <FiX size={12} /> Rejected
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleApprovalClick(item.id!, false)}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                        title="Click to approve"
                                      >
                                        <FiCheck size={12} /> Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectClick(item.id!)}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                                        title="Click to reject"
                                      >
                                        <FiX size={12} /> Reject
                                      </button>
                                    </div>
                                  )}
                            </TableCell>
                          )}
                          <TableCell className="px-5 py-4">
                              <div className="flex justify-end gap-3">
                                  <button 
                                      className="text-blue-600 hover:text-blue-800 transition-colors" 
                                      onClick={() => { setEditId(item.id!); setIsEditModalOpen(true); }}
                                      title="Edit"
                                  >
                                      <FiEdit />
                                  </button>
                                  {isAdmin && (
                                    <button 
                                        className="text-red-600 hover:text-red-800 transition-colors" 
                                        onClick={() => handleDelete(item.id!)}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                  )}
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
              onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              <FiChevronLeft /> Previous
            </button>
            
            <div className="flex items-center gap-1">
               {Array.from({ length: totalPages }, (_, i: number) => i + 1)
                 .filter((p: number) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                 .map((p: number, i: number, arr: number[]) => (
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
              onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
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

      {isAddModalOpen && <AddCuisineType onClose={() => setIsAddModalOpen(false)} onAdd={() => fetchCuisines()} />}
      {isEditModalOpen && editId && <EditCuisineType cuisineId={editId} onClose={() => setIsEditModalOpen(false)} onUpdated={() => fetchCuisines()} />}

      <ConfirmationModal
        isOpen={rejectionTarget !== null}
        onClose={() => setRejectionTarget(null)}
        onConfirm={confirmRejection}
        title="Reject Cuisine Type"
        message="Are you sure you want to reject this cuisine type?"
        confirmText="Yes, Reject"
        cancelText="No"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Cuisine Type?"
        message="Are you sure you want to remove this cuisine type? This action is permanent."
        confirmText="Delete Cuisine"
      />

      <ConfirmationModal
        isOpen={approvalTarget !== null}
        onClose={() => setApprovalTarget(null)}
        onConfirm={confirmApproval}
        isLoading={isApprovingLoading}
        title={approvalTarget?.currentStatus ? "Disapprove Cuisine Type?" : "Approve Cuisine Type?"}
        message={
          approvalTarget?.currentStatus
            ? "Are you sure you want to disapprove this cuisine type? It will no longer be visible to other users."
            : "Are you sure you want to approve this cuisine type? Please ensure there are no duplicate entries before approving."
        }
        confirmText={approvalTarget?.currentStatus ? "Yes, Disapprove" : "Yes, Approve"}
      />
    </>
  );
};

export default CuisineTypePage;
