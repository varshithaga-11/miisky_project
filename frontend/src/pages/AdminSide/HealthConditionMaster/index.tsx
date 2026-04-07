import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  getHealthConditionMasterList,
  deleteHealthConditionMaster,
  HealthConditionMaster,
} from "./api";
import AddHealthConditionMaster from "./AddHealthConditionMaster";
import EditHealthConditionMaster from "./EditHealthConditionMaster";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const CATEGORY_LABEL: Record<string, string> = {
  chronic: "Chronic",
  infectious: "Infectious",
  metabolic: "Metabolic",
  digestive: "Digestive",
  other: "Other",
};

const HealthConditionMasterPage: React.FC = () => {
  const [rows, setRows] = useState<HealthConditionMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof HealthConditionMaster | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    void fetchRows();
  }, [currentPage, pageSize, searchTerm]);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const response = await getHealthConditionMasterList(currentPage, pageSize, searchTerm);
      setRows(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this health condition? Linked patient rows may be removed.")) return;
    try {
      await deleteHealthConditionMaster(id);
      void fetchRows();
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleSort = (field: keyof HealthConditionMaster) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    return [...rows].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const as = aValue == null ? "" : String(aValue);
      const bs = bValue == null ? "" : String(bValue);
      const cmp = as.localeCompare(bs);
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [rows, sortField, sortDirection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  if (loading && rows.length === 0) {
    return <div className="text-black dark:text-white p-6">Loading...</div>;
  }

  return (
    <>
      <PageMeta title="Health conditions (master)" description="Manage health condition catalog" />
      <PageBreadcrumb pageTitle="Health conditions (master)" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-6">
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
              <FiPlus /> Add
            </Button>
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
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
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  #
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name {sortField === "name" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  Category {sortField === "category" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500">
                    No records
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {row.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                      {CATEGORY_LABEL[row.category] ?? row.category}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                          onClick={() => {
                            setEditId(row.id!);
                            setIsEditOpen(true);
                          }}
                        >
                          <FiEdit />
                        </button>
                        <button type="button" className="text-red-600 hover:text-red-800" title="Delete" onClick={() => void handleDelete(row.id!)}>
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
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 text-sm rounded-md border ${
                  currentPage === pageNum ? "bg-blue-600 text-white border-blue-600" : "dark:bg-gray-800 dark:border-gray-600"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500">Page {currentPage} of {totalPages}</div>
        </div>
      )}

      {isAddOpen && <AddHealthConditionMaster onClose={() => setIsAddOpen(false)} onAdd={() => void fetchRows()} />}
      {isEditOpen && editId !== null && (
        <EditHealthConditionMaster
          recordId={editId}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdated={() => void fetchRows()}
        />
      )}
    </>
  );
};

export default HealthConditionMasterPage;
