import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getSkinIssueMasterList, deleteSkinIssueMaster, SkinIssueMaster } from "./api";
import AddSkinIssueMaster from "./AddSkinIssueMaster";
import EditSkinIssueMaster from "./EditSkinIssueMaster";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const SkinIssueMasterPage: React.FC = () => {
  const [rows, setRows] = useState<SkinIssueMaster[]>([]);
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
  const [sortField, setSortField] = useState<keyof SkinIssueMaster | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    void fetchRows();
  }, [currentPage, pageSize, searchTerm]);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const r = await getSkinIssueMasterList(currentPage, pageSize, searchTerm);
      setRows(r.results);
      setTotalItems(r.count);
      setTotalPages(r.total_pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteSkinIssueMaster(id);
      void fetchRows();
    } catch {
      alert("Failed to delete.");
    }
  };

  const handleSort = (field: keyof SkinIssueMaster) => {
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

  if (loading && rows.length === 0) return <div className="p-6 dark:text-white">Loading...</div>;

  return (
    <>
      <PageMeta title="Skin issues (master)" description="Skin issue catalog" />
      <PageBreadcrumb pageTitle="Skin issues (master)" />
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
              <FiPlus /> Add
            </Button>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Show:</Label>
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
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-5 py-3">#</TableCell>
                <TableCell isHeader className="px-5 py-3 cursor-pointer" onClick={() => handleSort("name")}>
                  Name {sortField === "name" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                </TableCell>
                <TableCell isHeader className="px-5 py-3">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-500">
                    No records
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, i) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium dark:text-white/90">{row.name}</TableCell>
                    <TableCell className="px-5 py-4">
                      <button type="button" className="text-blue-600 mr-3" onClick={() => { setEditId(row.id!); setIsEditOpen(true); }}>
                        <FiEdit />
                      </button>
                      <button type="button" className="text-red-600" onClick={() => void handleDelete(row.id!)}>
                        <FiTrash2 />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-2 border rounded dark:bg-gray-800 disabled:opacity-50">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" onClick={() => setCurrentPage(p)} className={`px-3 py-2 rounded border ${currentPage === p ? "bg-blue-600 text-white" : "dark:bg-gray-800"}`}>
              {p}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 border rounded dark:bg-gray-800 disabled:opacity-50">
            Next
          </button>
        </div>
      )}
      {isAddOpen && <AddSkinIssueMaster onClose={() => setIsAddOpen(false)} onAdd={() => void fetchRows()} />}
      {isEditOpen && editId !== null && (
        <EditSkinIssueMaster recordId={editId} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onUpdated={() => void fetchRows()} />
      )}
    </>
  );
};

export default SkinIssueMasterPage;
