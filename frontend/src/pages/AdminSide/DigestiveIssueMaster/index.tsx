import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getDigestiveIssueMasterList, deleteDigestiveIssueMaster, DigestiveIssueMaster } from "./api";
import AddDigestiveIssueMaster from "./AddDigestiveIssueMaster";
import EditDigestiveIssueMaster from "./EditDigestiveIssueMaster";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import ImportButton from "../../../components/common/ImportButton";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const DigestiveIssueMasterPage: React.FC = () => {
  const [rows, setRows] = useState<DigestiveIssueMaster[]>([]);
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
  const [sortField, setSortField] = useState<keyof DigestiveIssueMaster | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void fetchRows();
  }, [currentPage, pageSize, searchTerm]);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const r = await getDigestiveIssueMasterList(currentPage, pageSize, searchTerm);
      setRows(r.results);
      setTotalItems(r.count);
      setTotalPages(r.total_pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setRecordToDelete(id);
  };

  const confirmDelete = async () => {
    if (recordToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteDigestiveIssueMaster(recordToDelete);
      toast.success("Digestive issue deleted successfully!");
      setRecordToDelete(null);
      void fetchRows();
    } catch {
      toast.error("Failed to delete digestive issue.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: keyof DigestiveIssueMaster) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    return [...rows].sort((a, b) => {
      const c = String(a[sortField] ?? "").localeCompare(String(b[sortField] ?? ""));
      return sortDirection === "asc" ? c : -c;
    });
  }, [rows, sortField, sortDirection]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, searchTerm]);

  if (loading && rows.length === 0) return <div className="text-black dark:text-white p-6">Loading...</div>;

  return (
    <>
      <PageMeta title="Digestive issues" description="Digestive issue catalog" />
      <PageBreadcrumb pageTitle="Digestive issues" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
                <FiPlus /> Add
              </Button>
              <ImportButton onSuccess={() => void fetchRows()} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(v) => {
                  setPageSize(Number(v));
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
              <span className="text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">entries</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
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
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Name
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === "name" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-500">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, i) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">{row.name}</TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 text-lg transition-colors"
                          onClick={() => {
                            setEditId(row.id!);
                            setIsEditOpen(true);
                          }}
                        >
                          <FiEdit />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 text-lg transition-colors"
                          onClick={() => void handleDelete(row.id!)}
                        >
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
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
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
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
      {isAddOpen && <AddDigestiveIssueMaster onClose={() => setIsAddOpen(false)} onAdd={() => void fetchRows()} />}
      {isEditOpen && editId !== null && (
        <EditDigestiveIssueMaster recordId={editId} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onUpdated={() => void fetchRows()} />
      )}

      <ConfirmationModal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Record?"
        message="Are you sure you want to remove this digestive issue from the master list?"
        confirmText="Delete Record"
      />
    </>
  );
};

export default DigestiveIssueMasterPage;
