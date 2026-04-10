import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { FiPlus, FiTrash2, FiEdit, FiSearch } from "react-icons/fi";
import { getPricingPlanList, deletePricingPlan, PricingPlan } from "./pricingplanapi";
import AddPricingPlan from "./AddPricingPlan";
import EditPricingPlan from "./EditPricingPlan";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const PricingPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPricingPlanList(currentPage, pageSize, search);
      setPlans(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      toast.error("Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = (id: number) => {
    setIdToDelete(id);
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deletePricingPlan(idToDelete);
      toast.success("Pricing plan archived successfully!");
      setIdToDelete(null);
      fetchPlans();
    } catch (error) {
      toast.error("Failed to archive pricing plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageMeta title="Pricing Management" description="Manage subscription tiers" />
      <PageBreadcrumb pageTitle="Pricing Plans" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button 
                size="sm" 
                className="inline-flex items-center gap-2"
                onClick={() => setIsAddModalOpen(true)}
            >
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
              <span className="text-sm text-gray-400 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Plan Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pricing (Monthly/Yearly)</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Features</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No plans found</TableCell>
                </TableRow>
              ) : (
                plans.map((plan, index) => (
                  <TableRow key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col">
                          <div className="font-bold text-gray-900 dark:text-white">{plan.name}</div>
                          <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider font-sans">{plan.plan_category}</div>
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col gap-0.5">
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                             ${plan.price_monthly} <span className="text-[10px] text-gray-400 font-normal">/ mo</span>
                          </div>
                          {plan.price_yearly && (
                            <div className="text-[10px] font-bold text-green-600">
                               ${plan.price_yearly} <span className="text-gray-400 font-normal">/ yr</span>
                            </div>
                          )}
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-wrap gap-1">
                          {plan.features.slice(0, 2).map((feature, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-50 text-[10px] font-medium text-gray-500 rounded border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                              {feature}
                            </span>
                          ))}
                          {plan.features.length > 2 && (
                            <span className="text-[10px] text-gray-400 font-bold">+{plan.features.length - 2} more</span>
                          )}
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col gap-1.5">
                           <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-center inline-block max-w-fit ${
                               plan.is_active ? "bg-green-50 text-green-600 dark:bg-green-900/30" : "bg-red-50 text-red-600 dark:bg-red-900/30"
                           }`}>
                               {plan.is_active ? "LIVE" : "DRAFT"}
                           </span>
                           {plan.is_featured && (
                             <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-center inline-block max-w-fit bg-blue-50 text-blue-600 border border-blue-100">
                                FEATURED
                             </span>
                           )}
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => setEditingId(plan.id!)}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(plan.id!)}><FiTrash2 /></button>
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
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddPricingPlan 
          onSuccess={() => fetchPlans()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditPricingPlan 
          id={editingId} 
          onSuccess={() => fetchPlans()} 
          onClose={() => setEditingId(null)} 
        />
      )}

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Archive Pricing Plan?"
        message="Archiving this pricing plan will stop it from appearing on the public site. Are you sure you want to continue?"
        confirmText="Archive Plan"
      />
    </>
  );
};

export default PricingPlanPage;
