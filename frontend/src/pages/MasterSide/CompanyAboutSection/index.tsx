import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit, FiSearch } from "react-icons/fi";
import { getAboutSectionList, deleteAboutSection, CompanyAboutSection } from "./companyaboutsectionapi";
import AddAboutSection from "./AddAboutSection";
import EditAboutSection from "./EditAboutSection";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const CompanyAboutSectionList: React.FC = () => {
  const [sections, setSections] = useState<CompanyAboutSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CompanyAboutSection | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAboutSectionList(currentPage, pageSize, search);
      setSections(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error("Failed to load about sections");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await deleteAboutSection(id);
      toast.success("Section deleted!");
      fetchSections();
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  return (
    <>
      <PageMeta title="Company About Management" description="Manage company about sections efficiently" />
      <PageBreadcrumb pageTitle="About Sections" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button 
                size="sm" 
                className="inline-flex items-center gap-2"
                onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus /> Add Section
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title & Subtitle</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Order</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Loading sections...</TableCell>
                </TableRow>
              ) : sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No sections found</TableCell>
                </TableRow>
              ) : (
                sections.map((section, index) => (
                  <TableRow key={section.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="font-bold text-gray-800 dark:text-white">{section.title}</div>
                        <div className="text-xs text-gray-400 line-clamp-1 italic">{section.subtitle || "-"}</div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium dark:bg-indigo-900/30 dark:text-indigo-400">
                            {section.section_type.replace(/_/g, " ")}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-mono text-sm text-gray-400">
                        {section.position}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            section.is_active ? "bg-green-50 text-green-600 dark:bg-green-900/30" : "bg-red-50 text-red-600 dark:bg-red-900/30"
                        }`}>
                            {section.is_active ? "Live" : "Draft"}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => setEditingSection(section)}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(section.id!)}><FiTrash2 /></button>
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
        <AddAboutSection 
          onSuccess={() => fetchSections()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingSection && (
        <EditAboutSection 
          section={editingSection} 
          onSuccess={() => fetchSections()} 
          onClose={() => setEditingSection(null)} 
        />
      )}
    </>
  );
};

export default CompanyAboutSectionList;

