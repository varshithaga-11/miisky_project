import React, { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getNormalRangeList, deleteNormalRange, NormalRange } from "./normalrangeapi";
import AddNormalRange from "./AddNormalRange";
import EditNormalRange from "./EditNormalRange";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';

const NormalRangeManagement: React.FC = () => {
  const [ranges, setRanges] = useState<NormalRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof NormalRange | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchRanges();
  }, [currentPage, pageSize, searchTerm]);

  const fetchRanges = async () => {
    setLoading(true);
    try {
      const response = await getNormalRangeList(currentPage, pageSize, searchTerm);
      setRanges(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load ranges");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteNormalRange(id);
      toast.success("Deleted");
      fetchRanges();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSort = (field: keyof NormalRange) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRanges = useMemo(() => {
    if (!sortField) return ranges;
    return [...ranges].sort((a, b) => {
        // @ts-ignore
      const aVal = a[sortField];
        // @ts-ignore
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [ranges, sortField, sortDirection]);

  return (
    <>
      <PageMeta title="Normal Ranges" description="Manage Health Parameter Normal Ranges" />
      <PageBreadcrumb pageTitle="Normal Ranges" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ranges, parameters or units..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <ImportButton onSuccess={fetchRanges} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
              <FiPlus /> Add Normal Range
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400 cursor-pointer" onClick={() => handleSort('health_parameter')}>
                    <div className="flex items-center gap-1">
                        Parameter {sortField === 'health_parameter' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400 cursor-pointer" onClick={() => handleSort('raw_value')}>
                    <div className="flex items-center gap-1">
                        Info {sortField === 'raw_value' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400 cursor-pointer" onClick={() => handleSort('min_value')}>
                    <div className="flex items-center gap-1">
                        Min/Max {sortField === 'min_value' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400 cursor-pointer" onClick={() => handleSort('unit')}>
                    <div className="flex items-center gap-1">
                        Unit {sortField === 'unit' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && ranges.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</TableCell></TableRow>
              ) : sortedRanges.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">No ranges found</TableCell></TableRow>
              ) : (
                sortedRanges.map((r, index) => (
                  <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-blue-600 text-sm dark:text-blue-400">
                      {r.health_parameter_name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                        <div className="text-gray-800 dark:text-white/90 font-medium">{r.raw_value || "N/A"}</div>
                        <div className="text-xs text-gray-400 italic">{r.qualitative_value} {r.interpretation_flag}</div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm font-medium">
                        {r.min_value ?? "-"} to {r.max_value ?? "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm text-primary-500">
                        {r.unit}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditingId(r.id!); setIsEditOpen(true); }}>
                          <FiEdit className="text-lg" />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(r.id!)}>
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

      {isAddOpen && <AddNormalRange onClose={() => setIsAddOpen(false)} onAdd={() => { fetchRanges(); setIsAddOpen(false); }} />}
      {isEditOpen && editingId !== null && (
        <EditNormalRange
          id={editingId}
          onClose={() => setIsEditOpen(false)}
          onUpdate={() => { fetchRanges(); setIsEditOpen(false); setEditingId(null); }}
        />
      )}
    </>
  );
};

export default NormalRangeManagement;
