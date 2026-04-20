import React, { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiInfo, FiChevronLeft, FiChevronRight, FiCheck, FiX } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getUnitList, deleteUnit, patchUnit, Unit } from "./unitapi";
import { getFoodIngredientList } from "../FoodIngredient/foodingredientapi";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getUserRoleFromToken } from "../../../utils/auth";
import { checkFoodDependency, deleteFoodRecord } from "../shared/foodManagementApi";

import AddUnit from "./AddUnit";
import EditUnit from "./EditUnit";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const UnitManagementPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUnitId, setEditUnitId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [rejectionTarget, setRejectionTarget] = useState<number | null>(null);
  const [isApprovingLoading, setIsApprovingLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const userRole = getUserRoleFromToken();
  const isAdmin = userRole === "admin" || userRole === "master";
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUnits();
  }, [currentPage, pageSize, searchTerm]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const resp = await getUnitList(currentPage, pageSize, searchTerm);
      setUnits(resp.results);
      setTotalItems(resp.count);
      setTotalPages(resp.total_pages);
    } catch {
      console.error("Failed to load units.");
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
      await patchUnit(id, { is_approved: !currentStatus });
      toast.success(`Unit ${!currentStatus ? 'approved' : 'disapproved'} successfully.`);
      fetchUnits();
    } catch {
      toast.error("Failed to update approval status.");
    } finally {
      setIsApprovingLoading(false);
      setApprovalTarget(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await checkFoodDependency("unit", id);
      if (res.detail !== "none") {
        toast.error(`Cannot delete as it has ${res.detail}. Please remove them first.`);
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
      await deleteFoodRecord("unit", recordToDelete);
      toast.success("Unit deleted successfully!");
      setRecordToDelete(null);
      fetchUnits();
    } catch {
      toast.error("Failed to delete unit.");
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
      await patchUnit(rejectionTarget, { is_rejected: true, is_approved: false });
      toast.success("Unit rejected successfully.");
      fetchUnits();
    } catch {
      toast.error("Failed to reject unit.");
    } finally {
      setIsApprovingLoading(false);
      setRejectionTarget(null);
    }
  };



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
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium animate-pulse">
            <FiInfo className="w-4 h-4" />
            <span>{isAdmin ? "Before approving, please re-check if any data is repeated to avoid issues." : "Please don't repeat same word it may cause problems."}</span>
          </div>
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Unit Name</TableCell>
                {isAdmin && <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Approved</TableCell>}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">Loading units...</TableCell>
                </TableRow>
              ) : units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">No units found</TableCell>
                </TableRow>
              ) : (
                units.map((u: Unit, i: number) => (
                  <TableRow key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{u.name}</TableCell>
                        {isAdmin && (
                          <TableCell className="px-5 py-4">
                              {u.is_approved ? (
                                <button
                                  onClick={() => handleApprovalClick(u.id!, true)}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                  title="Click to disapprove"
                                >
                                  <FiCheck size={12} /> Approved
                                </button>
                              ) : u.is_rejected ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400">
                                  <FiX size={12} /> Rejected
                                </span>
                              ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprovalClick(u.id!, false)}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                  title="Click to approve"
                                >
                                  <FiCheck size={12} /> Accept
                                </button>
                                <button
                                  onClick={() => handleRejectClick(u.id!)}
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
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditUnitId(u.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        {isAdmin && (
                          <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(u.id!)}>
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

      {isAddModalOpen && <AddUnit onClose={() => setIsAddModalOpen(false)} onAdd={() => { fetchUnits(); setIsAddModalOpen(false); }} />}
      {isEditModalOpen && editUnitId && (
        <EditUnit unitId={editUnitId} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdated={() => { fetchUnits(); setIsEditModalOpen(false); }} />
      )}

      <ConfirmationModal
        isOpen={rejectionTarget !== null}
        onClose={() => setRejectionTarget(null)}
        onConfirm={confirmRejection}
        title="Reject Unit"
        message="Are you sure you want to reject this unit?"
        confirmText="Yes, Reject"
        cancelText="No"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Unit?"
        message="Are you sure you want to remove this measurement unit? This will affect all ingredients using it."
        confirmText="Delete Unit"
      />

      <ConfirmationModal
        isOpen={approvalTarget !== null}
        onClose={() => setApprovalTarget(null)}
        onConfirm={confirmApproval}
        isLoading={isApprovingLoading}
        title={approvalTarget?.currentStatus ? "Disapprove Unit?" : "Approve Unit?"}
        message={
          approvalTarget?.currentStatus
            ? "Are you sure you want to disapprove this unit? It will no longer be available for selection."
            : "Are you sure you want to approve this unit? Please ensure there are no duplicate entries before approving."
        }
        confirmText={approvalTarget?.currentStatus ? "Yes, Disapprove" : "Yes, Approve"}
      />
    </>
  );
};

export default UnitManagementPage;
