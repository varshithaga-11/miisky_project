import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit, FiSearch, FiFileText, FiLink } from "react-icons/fi";
import { getPatentList, deletePatent, Patent } from "./patentapi";
import AddPatent from "./AddPatent";
import EditPatent from "./EditPatent";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const PatentList: React.FC = () => {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatent, setEditingPatent] = useState<Patent | null>(null);

  const fetchPatents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatentList(currentPage, pageSize, search);
      setPatents(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error("Failed to load patents");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatents();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPatents]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patent?")) return;
    try {
      await deletePatent(id);
      toast.success("Patent deleted!");
      fetchPatents();
    } catch (error) {
      toast.error("Failed to delete patent");
    }
  };

  return (
    <>
      <PageMeta title="Intellectual Property" description="Manage core patents and technical innovations" />
      <PageBreadcrumb pageTitle="Patent Registry" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, number or inventors..."
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
              <FiPlus /> New Patent
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patent Info</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status & Date</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Deployment</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Docs</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && patents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Retrieving IP records...</TableCell>
                </TableRow>
              ) : patents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No patent records found</TableCell>
                </TableRow>
              ) : (
                patents.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">
                        <div className="max-w-[250px]">
                           <div className="font-bold text-gray-900 text-theme-sm dark:text-white uppercase tracking-tight leading-tight line-clamp-2">
                             {p.title}
                           </div>
                           <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase">
                             REF: {p.patent_number || p.application_number || "PENDING_ASSIGNMENT"}
                           </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           p.status === 'granted' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                           p.status === 'pending' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                           'bg-gray-100 text-gray-600 dark:bg-gray-800'
                         }`}>
                           {p.status}
                         </span>
                         <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase italic">
                           Filing: {p.filing_date || "N/A"}
                         </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                         <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight line-clamp-1">
                            {p.device_name || p.technology_area || "N/A"}
                         </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="flex gap-3 text-lg text-gray-400">
                          {p.patent_document && (
                            <a href={p.patent_document as any} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                              <FiFileText />
                            </a>
                          )}
                          {p.external_link && (
                            <a href={p.external_link} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                              <FiLink />
                            </a>
                          )}
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => setEditingPatent(p)}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(p.id!)}><FiTrash2 /></button>
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

      {isAddModalOpen && <AddPatent onSuccess={() => fetchPatents()} onClose={() => setIsAddModalOpen(false)} />}
      {editingPatent && <EditPatent patent={editingPatent} onSuccess={() => fetchPatents()} onClose={() => setEditingPatent(null)} />}
    </>
  );
};

export default PatentList;

