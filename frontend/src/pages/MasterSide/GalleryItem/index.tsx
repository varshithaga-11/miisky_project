import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit, FiSearch } from "react-icons/fi";
import { getGalleryItemList, deleteGalleryItem, GalleryItem } from "./galleryitemapi";
import { getGalleryCategoryList } from "../GalleryCategory/gallerycategoryapi";
import AddGalleryItem from "./AddGalleryItem";
import EditGalleryItem from "./EditGalleryItem";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const GalleryItemPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGalleryItemList(currentPage, pageSize, search);
      setItems(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error("Failed to load gallery assets");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getGalleryCategoryList(1, 100);
      setCategories(data.results);
    } catch (error) {
      console.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Permanently delete this visual asset?")) return;
    try {
      await deleteGalleryItem(id);
      toast.success("Asset purged!");
      fetchItems();
    } catch (error) {
      toast.error("Purge failed");
    }
  };

  return (
    <>
      <PageMeta title="Gallery Management" description="Manage gallery assets effectively" />
      <PageBreadcrumb pageTitle="Visual Assets" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
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
              <FiPlus /> Bulk Ingest
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Preview</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Identity Manifest</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Syncing Asset Matrix...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No visual assets detected</TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors group">
                    <TableCell className="px-5 py-4">
                        <div className="relative w-20 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm transition-transform group-hover:scale-105 dark:bg-gray-800 dark:border-gray-700">
                             <img 
                              src={(item.image_url || item.image) as string} 
                              alt={item.title} 
                              className="w-full h-full object-cover" 
                             />
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <div className="font-bold text-gray-900 text-theme-sm dark:text-white uppercase tracking-tight">{item.title}</div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight dark:text-gray-500">
                           {categories.find(c => c.id === item.category)?.name || "External Link"}
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.is_active ? "bg-green-50 text-green-600 dark:bg-green-900/30" : "bg-red-50 text-red-600 dark:bg-red-900/30"
                        }`}>
                            {item.is_active ? "Visible" : "Hidden"}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => setEditingId(item.id!)}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(item.id!)}><FiTrash2 /></button>
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
        <AddGalleryItem 
          categories={categories}
          onSuccess={() => fetchItems()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditGalleryItem 
          id={editingId} 
          categories={categories}
          onSuccess={() => fetchItems()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </>
  );
};

export default GalleryItemPage;

