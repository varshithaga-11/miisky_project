import React, { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiEye } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import API, { getDietPlans as getDietPlanList, deleteDietPlan } from "../../../utils/api";
import { DietPlan } from "./dietplanapi";
import AddDietPlan from "./AddDietPlan";
import EditDietPlan from "./EditDietPlan";
import ViewDietPlan from "./ViewDietPlan";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { checkFoodDependency, deleteFoodRecord } from "../shared/foodManagementApi";

const DietPlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof DietPlan | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchPlans();
  }, [currentPage, pageSize, searchTerm]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await getDietPlanList({ page: currentPage, limit: pageSize, search: searchTerm });
      const data = response.data;
      setPlans(Array.isArray(data) ? data : data.results);
      setTotalItems(data.count || (Array.isArray(data) ? data.length : 0));
      setTotalPages(data.total_pages || 1);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load diet plans");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await checkFoodDependency("diet_plan", id);
      if (res.detail !== "none") {
        toast.error(`Cannot delete diet plan as it is ${res.detail}. Please remove them first.`);
        return;
      }
      setIdToDelete(id);
    } catch {
      toast.error("An error occurred while checking dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteFoodRecord("diet_plan", idToDelete);
      toast.success("Diet plan deleted successfully!");
      setIdToDelete(null);
      fetchPlans();
    } catch {
      toast.error("Failed to delete diet plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: keyof DietPlan) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPlans = useMemo(() => {
    if (!sortField) return plans;
    return [...plans].sort((a, b) => {
        // @ts-ignore
      const aVal = a[sortField];
        // @ts-ignore
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [plans, sortField, sortDirection]);

  return (
    <>
      <PageMeta title="Diet Plans" description="Manage Diet Plans and Pricing" />
      <PageBreadcrumb pageTitle="Diet Plans" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or code..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <ImportButton onSuccess={fetchPlans} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
              <FiPlus /> Add Plan
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
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400 cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1">
                        Title {sortField === 'title' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400 cursor-pointer" onClick={() => handleSort('code')}>
                    Code {sortField === 'code' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Duration</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Price (Net)</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Features</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && plans.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</TableCell></TableRow>
              ) : sortedPlans.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">No diet plans found</TableCell></TableRow>
              ) : (
                sortedPlans.map((plan, index) => (
                  <TableRow key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-sm dark:text-white/90">
                      {plan.title}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm text-gray-500">
                        {plan.code}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                        {plan.no_of_days} Days
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                        <div>
                            <span className="font-bold text-lg">₹{plan.final_amount}</span>
                            {plan.discount_amount && Number(plan.discount_amount) > 0 && (
                                <span className="ml-2 text-xs text-red-500 line-through">₹{plan.amount}</span>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {plan.features?.length || 0} features
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="View" onClick={() => { setViewingId(plan.id!); setIsViewOpen(true); }}>
                          <FiEye className="text-lg" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditingId(plan.id!); setIsEditOpen(true); }}>
                          <FiEdit className="text-lg" />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(plan.id!)}>
                          <FiTrash2 className="text-lg" />
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
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</Button>
                <div className="flex gap-1">
                    {Array.from({length: totalPages}, (_, i) => i+1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        >{page}</button>
                    ))}
                </div>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</Button>
            </div>
            <div className="text-sm text-gray-500">Showing {Math.min(currentPage * pageSize, totalItems)} of {totalItems}</div>
        </div>
      )}

      {isAddOpen && <AddDietPlan onClose={() => setIsAddOpen(false)} onAdd={() => { fetchPlans(); setIsAddOpen(false); }} />}
      {isEditOpen && editingId !== null && (
        <EditDietPlan
          id={editingId}
          onClose={() => setIsEditOpen(false)}
          onUpdate={() => { fetchPlans(); setIsEditOpen(false); setEditingId(null); }}
        />
      )}
      {isViewOpen && viewingId !== null && (
        <ViewDietPlan
          id={viewingId}
          onClose={() => { setIsViewOpen(false); setViewingId(null); }}
        />
      )}

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Diet Plan?"
        message="Are you sure you want to permanently delete this diet plan? Any patients who have purchased it may lose access. This action is irreversible."
        confirmText="Delete Plan"
      />
    </>
  );
};

export default DietPlanManagement;
