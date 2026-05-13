import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMealPackageList, deleteMealPackage, MealPackage } from "./api";
import AddMealPackage from "./AddMealPackage";
import EditMealPackage from "./EditMealPackage";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import Badge from "../../../components/ui/badge/Badge";

const MealPackageManagementPage: React.FC = () => {
  const [packages, setPackages] = useState<MealPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPackageId, setEditPackageId] = useState<number | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search, sort, pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof MealPackage | null>("sort_order");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchPackages();
  }, [currentPage, pageSize, searchTerm]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await getMealPackageList(currentPage, pageSize, searchTerm);
      setPackages(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to fetch meal packages.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setPackageToDelete(id);
  };

  const confirmDelete = async () => {
    if (packageToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteMealPackage(packageToDelete);
      toast.success("Meal package deleted successfully.");
      
      // Optimistic update
      setPackages((prev) => prev.filter((p) => p.id !== packageToDelete));
      setTotalItems((prev) => prev - 1);
      
      setPackageToDelete(null);
      
      await fetchPackages();
      
      if (packages.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch {
      toast.error("Failed to delete meal package.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: keyof MealPackage) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPackages = useMemo(() => {
    if (!sortField) return packages;
    return [...packages].sort((a, b) => {
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
  }, [packages, sortField, sortDirection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  if (loading && packages.length === 0) return <div className="text-black dark:text-white p-6">Loading meal packages...</div>;

  return (
    <>
      <PageMeta title="Meal Package Management" description="Manage meal packages efficiently" />
      <PageBreadcrumb pageTitle="Meal Package Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search package..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button
              size="sm"
              className="inline-flex items-center gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus /> Add Package
            </Button>

            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
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
              <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            {searchTerm && ` (filtered from search)`}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Package Name
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Meal Types</TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleSort('sort_order')}
                >
                  <div className="flex items-center gap-2">
                    Order
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === 'sort_order' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estimation (₹)</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sortedPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No meal packages found</TableCell>
                </TableRow>
              ) : (
                sortedPackages.map((pkg, index) => (
                  <TableRow key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      <div>
                        <div className="font-semibold">{pkg.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{pkg.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                      <div className="flex flex-wrap gap-1">
                        {pkg.meal_type_names?.map((name, i) => (
                          <Badge key={i} color="blue" variant="light" size="sm">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                      {pkg.sort_order}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                      {pkg.estimation_amount !== null && pkg.estimation_amount !== undefined ? `₹${pkg.estimation_amount}` : "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                       <Badge color={pkg.is_active ? "success" : "error"} variant="light" size="sm">
                        {pkg.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditPackageId(pkg.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(pkg.id!)}>
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
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === pageNum
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
        <AddMealPackage 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={() => { 
            fetchPackages(); 
            setIsAddModalOpen(false); 
            setCurrentPage(1);
          }} 
        />
      )}
      {isEditModalOpen && editPackageId !== null && (
        <EditMealPackage
          packageId={editPackageId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => { 
            fetchPackages(); 
            setIsEditModalOpen(false); 
            setEditPackageId(null); 
          }}
        />
      )}

      <ConfirmationModal
        isOpen={packageToDelete !== null}
        onClose={() => setPackageToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Meal Package?"
        message="Are you sure you want to permanently delete this meal package? This action is irreversible."
        confirmText="Delete Package"
      />
    </>
  );
};

export default MealPackageManagementPage;
