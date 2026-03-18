import React, { useEffect, useMemo, useState } from "react";
import { FiEdit, FiPlus, FiSearch, FiTrash2, FiEye } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FoodName, getFoodNameList } from "../FoodName/foodnameapi";

type Paginated<T> = {
  count: number;
  current_page: number;
  total_pages: number;
  next: number | null;
  previous: number | null;
  results: T[];
};

export type FoodNameBasedRow = {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  [key: string]: any;
};

type CrudApi<T extends FoodNameBasedRow> = {
  getList: (page: number, limit: number | "all", search?: string) => Promise<Paginated<T>>;
  getById: (id: number) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  remove: (id: number) => Promise<void>;
};

type FieldDef<T> = {
  key: keyof T & string;
  label: string;
  type?: "number" | "text";
};

interface FoodNameBasedCrudProps<T extends FoodNameBasedRow> {
  title: string;
  description: string;
  breadcrumb: string;
  addLabel: string;
  editLabel: string;
  api: CrudApi<T>;
  fields: FieldDef<T>[];
}

export default function FoodNameBasedCrud<T extends FoodNameBasedRow>(props: FoodNameBasedCrudProps<T>) {
  const { title, description, breadcrumb, addLabel, editLabel, api, fields } = props;

  const [rows, setRows] = useState<T[]>([]);
  const [foodNames, setFoodNames] = useState<FoodName[]>([]);

  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<T | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [formFoodNameId, setFormFoodNameId] = useState<string>("");
  const [formBaseUnit, setFormBaseUnit] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFoodNameList(1, "all")
      .then((res) => setFoodNames(res.results))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getList(currentPage, pageSize, searchTerm);
      setRows(res.results);
      setTotalItems(res.count);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormFoodNameId("");
    setFormBaseUnit("");
    const init: Record<string, string> = {};
    fields.forEach((f) => (init[f.key] = ""));
    setFormValues(init);
  };

  const foodNameOptions = useMemo(
    () => [{ value: "", label: "Select Food Name *" }, ...foodNames.map((f) => ({ value: String(f.id), label: f.name }))],
    [foodNames]
  );

  const openAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openView = async (id: number) => {
    try {
      const data = await api.getById(id);
      setViewData(data);
      setIsViewOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load record details");
    }
  };

  const openEdit = async (id: number) => {
    setSaving(false);
    try {
      const data = await api.getById(id);
      setEditId(id);
      setFormFoodNameId(data.food_name ? String(data.food_name) : "");
      setFormBaseUnit(data.base_unit || "");
      const next: Record<string, string> = {};
      fields.forEach((f) => {
        const v = (data as any)[f.key];
        next[f.key] = v === null || v === undefined ? "" : String(v);
      });
      setFormValues(next);
      setIsEditOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load record");
    }
  };

  const toPayload = () => {
    const payload: Record<string, any> = {
      food_name: formFoodNameId ? Number(formFoodNameId) : null,
      base_unit: formBaseUnit || null,
    };
    fields.forEach((f) => {
      const raw = formValues[f.key];
      if (raw === "" || raw === undefined) payload[f.key] = null;
      else payload[f.key] = f.type === "number" ? Number(raw) : raw;
    });
    return payload;
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFoodNameId) {
      toast.error("Please select a food name");
      return;
    }
    setSaving(true);
    try {
      await api.create(toPayload() as Partial<T>);
      toast.success("Created successfully!");
      setTimeout(() => {
        setIsAddOpen(false);
        fetchData();
      }, 700);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        Object.values(err.response.data).forEach((msg: any) => toast.error(Array.isArray(msg) ? msg[0] : msg));
      } else {
        toast.error(err.message || "Failed to create");
      }
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!formFoodNameId) {
      toast.error("Please select a food name");
      return;
    }
    setSaving(true);
    try {
      await api.update(editId, toPayload() as Partial<T>);
      toast.success("Updated successfully!");
      setTimeout(() => {
        setIsEditOpen(false);
        setEditId(null);
        fetchData();
      }, 700);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        Object.values(err.response.data).forEach((msg: any) => toast.error(Array.isArray(msg) ? msg[0] : msg));
      } else {
        toast.error(err.message || "Failed to update");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.remove(id);
      fetchData();
    } catch {
      alert("Failed to delete record.");
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title={title} description={description} />
      <PageBreadcrumb pageTitle={breadcrumb} />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by food name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button size="sm" className="inline-flex items-center gap-2" onClick={openAdd}>
              <FiPlus /> {addLabel}
            </Button>
            <ImportButton />
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
              <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
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
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Food Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Base Unit
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                      {row.food_name_display || foodNames.find((f) => f.id === row.food_name)?.name || "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">{row.base_unit || "—"}</TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-500 hover:text-gray-700 text-lg transition-colors" title="View Details" onClick={() => openView(row.id!)}>
                          <FiEye />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-lg transition-colors" title="Edit" onClick={() => openEdit(row.id!)}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-lg transition-colors" title="Delete" onClick={() => handleDelete(row.id!)}>
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
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
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

      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl relative mt-24 max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
                setEditId(null);
              }}
              className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{isAddOpen ? addLabel : editLabel}</h2>

            <form onSubmit={isAddOpen ? submitAdd : submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="food_name">Food Name *</Label>
                  <Select value={formFoodNameId} onChange={(val) => setFormFoodNameId(val)} options={foodNameOptions} className="w-full" disabled={saving} />
                </div>
                <div>
                  <Label htmlFor="base_unit">Base Unit</Label>
                  <Input id="base_unit" type="text" value={formBaseUnit} onChange={(e) => setFormBaseUnit(e.target.value)} disabled={saving} placeholder="e.g. 100g" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fields.map((f) => (
                  <div key={f.key}>
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <Input
                      id={f.key}
                      type={f.type === "number" ? "number" : "text"}
                      value={formValues[f.key] ?? ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      disabled={saving}
                      placeholder={f.type === "number" ? "0" : ""}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                    setEditId(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewOpen && viewData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-0 w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiEye className="text-2xl" /> View {title} Details
              </h2>
              <button
                onClick={() => setIsViewOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                   <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Food Item Name</div>
                   <div className="text-lg font-bold text-gray-900 dark:text-white">
                     {viewData.food_name_display || foodNames.find(f => f.id === viewData.food_name)?.name || "N/A"}
                   </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Base Unit</div>
                  <div className="text-md font-medium text-gray-900 dark:text-white">{viewData.base_unit || "—"}</div>
                </div>

                {fields.map((f) => {
                  const val = (viewData as any)[f.key];
                  return (
                    <div key={f.key} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{f.label}</div>
                      <div className="text-md font-bold text-gray-900 dark:text-white">{val === null || val === undefined ? "—" : String(val)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <Button onClick={() => setIsViewOpen(false)} variant="primary" className="px-8 shadow-lg shadow-blue-500/20">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

