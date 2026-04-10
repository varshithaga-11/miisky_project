import React, { useEffect, useMemo, useState } from "react";
import { FiEdit, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { createTicketCategory, deleteTicketCategory, getTicketCategoryList, TicketCategory, updateTicketCategory } from "./api";
import { getSupportTickets } from "../SupportTicketRequests/api";
import { toast, ToastContainer } from "react-toastify";

const asArray = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data?.results && Array.isArray(data.results)) return data.results as T[];
  return [];
};

const TicketCategoryPage: React.FC = () => {
  const [items, setItems] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<TicketCategory | null>(null);
  const [name, setName] = useState("");

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => (i.name || "").toLowerCase().includes(s));
  }, [items, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getTicketCategoryList(1, "all", searchTerm);
      setItems(asArray<TicketCategory>(data));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const openAdd = () => {
    setModalMode("add");
    setEditing(null);
    setName("");
  };

  const openEdit = (c: TicketCategory) => {
    setModalMode("edit");
    setEditing(c);
    setName(c.name || "");
  };

  const close = () => {
    setModalMode(null);
    setEditing(null);
    setName("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nm = name.trim();
    if (!nm) return toast.error("Enter category name");
    try {
      if (modalMode === "add") {
        await createTicketCategory({ name: nm });
        toast.success("Category created");
      } else if (modalMode === "edit" && editing?.id) {
        await updateTicketCategory(editing.id, { name: nm });
        toast.success("Category updated");
      }
      close();
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    }
  };

  const onDelete = async (c: TicketCategory) => {
    if (!c.id) return;
    try {
      // Pre-check for dependencies (Support Tickets)
      const ticketRes = await getSupportTickets({ category: c.id, limit: 1 });
      const ticketCount = Array.isArray(ticketRes) ? ticketRes.length : (ticketRes as any).count || 0;
      
      if (ticketCount > 0) {
        toast.error(`Cannot delete category "${c.name}". It has ${ticketCount} associated tickets. Please delete them first.`);
        return;
      }

      if (!confirm(`Delete category "${c.name}"?`)) return;
      await deleteTicketCategory(c.id);
      toast.success("Deleted");
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <PageMeta title="Ticket Categories" description="Manage support ticket categories" />
      <PageBreadcrumb pageTitle="Ticket Categories" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search category..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
        <Button size="sm" onClick={openAdd} className="inline-flex items-center gap-2">
          <FiPlus /> Add Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  #
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-10 text-center text-gray-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="px-5 py-10 text-center text-gray-500">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c, idx) => (
                  <TableRow key={c.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {c.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => openEdit(c)}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => onDelete(c)}>
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

      {modalMode && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-white/[0.05]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {modalMode === "add" ? "Add Category" : "Edit Category"}
              </div>
              <Button variant="outline" size="sm" onClick={close}>
                Close
              </Button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
                  placeholder="e.g. App Issue"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketCategoryPage;

