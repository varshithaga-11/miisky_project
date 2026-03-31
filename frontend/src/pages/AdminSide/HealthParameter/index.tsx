import React, { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiActivity } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getHealthParameterList, deleteHealthParameter, HealthParameter } from "./healthparameterapi";
import AddHealthParameter from "./AddHealthParameter";
import EditHealthParameter from "./EditHealthParameter";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from 'react-toastify';

const HealthParameterManagement: React.FC = () => {
  const [params, setParams] = useState<HealthParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof HealthParameter | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchParams();
  }, [currentPage, pageSize, searchTerm]);

  const fetchParams = async () => {
    setLoading(true);
    try {
      const response = await getHealthParameterList(currentPage, pageSize, searchTerm);
      setParams(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load health parameters");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this parameter?")) return;
    try {
      await deleteHealthParameter(id);
      toast.success("Deleted successfully");
      fetchParams();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSort = (field: keyof HealthParameter) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedParams = useMemo(() => {
    if (!sortField) return params;
    return [...params].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [params, sortField, sortDirection]);

  return (
    <>
      <PageMeta title="Health Parameters" description="Manage Health Parameters like Diabetes, Blood Pressure" />
      <PageBreadcrumb pageTitle="Health Parameters" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search parameters..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <ImportButton onSuccess={fetchParams} />
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
              <FiPlus /> Add Parameter
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
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                    <div className="flex items-center gap-2">
                        Parameter Name
                        <span>{sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Normal Ranges</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs uppercase dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && params.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</TableCell></TableRow>
              ) : sortedParams.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">No parameters found</TableCell></TableRow>
              ) : (
                sortedParams.map((p, index) => (
                  <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-sm dark:text-white/90">
                      {p.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                        <div className="flex flex-col gap-1.5">
                          {p.normal_ranges && p.normal_ranges.length > 0 ? (
                            p.normal_ranges.slice(0, 3).map((nr: any, idx: number) => (
                              <div key={nr.id || idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-900/20 text-[11px] font-black tracking-tight text-brand-700 dark:text-brand-300">
                                <FiActivity className="text-brand-400" size={12} />
                                <span>{nr.min_value} - {nr.max_value} {nr.unit}</span>
                              </div>
                            ))
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                No ranges
                            </span>
                          )}
                          {p.normal_ranges && p.normal_ranges.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-2">
                                +{p.normal_ranges.length - 3} more
                            </span>
                          )}
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditingId(p.id!); setIsEditOpen(true); }}>
                          <FiEdit className="text-lg" />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(p.id!)}>
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
                <Button 
                    variant="outline" size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >Previous</Button>
                <div className="flex gap-1">
                    {Array.from({length: totalPages}, (_, i) => i+1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <Button 
                    variant="outline" size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >Next</Button>
            </div>
            <div className="text-sm text-gray-500">Showing {Math.min(currentPage * pageSize, totalItems)} of {totalItems}</div>
        </div>
      )}

      {isAddOpen && <AddHealthParameter onClose={() => setIsAddOpen(false)} onAdd={() => { fetchParams(); setIsAddOpen(false); }} />}
      {isEditOpen && editingId !== null && (
        <EditHealthParameter
          id={editingId}
          onClose={() => setIsEditOpen(false)}
          onUpdate={() => { fetchParams(); setIsEditOpen(false); setEditingId(null); }}
        />
      )}
    </>
  );
};

export default HealthParameterManagement;
