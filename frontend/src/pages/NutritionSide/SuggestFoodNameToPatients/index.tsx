import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import SearchableSelect, { Option } from "../../../components/form/SearchableSelect";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { FiTrash2, FiPlus } from "react-icons/fi";

import { getMyPatients, MappedPatientResponse } from "../UploadedDocumentsByPatient/api";
import { getFoodNameList, getFoodNameById } from "../../AdminSide/FoodName/foodnameapi";
import {
  createFoodRecommendation,
  deleteFoodRecommendation,
  fetchFoodRecommendationsForPatient,
  getMealTypeList,
  MealType,
  PatientFoodRecommendation,
} from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";



const SuggestFoodNameToPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<MappedPatientResponse[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<PatientFoodRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [foodOptions, setFoodOptions] = useState<Option<number>[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState("");
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [mealTypeOptions, setMealTypeOptions] = useState<Option<number>[]>([]);
  const [selectedMealTypeId, setSelectedMealTypeId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [comment, setComment] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Food dropdown pagination state
  const [foodPage, setFoodPage] = useState(1);
  const [hasMoreFood, setHasMoreFood] = useState(true);
  const [isLoadingMoreFood, setIsLoadingMoreFood] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const [selectedFoodImage, setSelectedFoodImage] = useState<string | null>(null);


  const selectedPatient = useMemo(
    () => patients.find((p) => p.user.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const patientOptions = useMemo(() => {
    return patients.map((p) => ({
      value: p.user.id,
      label: `${p.user.first_name || ""} ${p.user.last_name || ""}`.trim() || p.user.email,
    }));
  }, [patients]);

  const selectedFood = useMemo(
    () => foodOptions.find((f) => f.value === selectedFoodId),
    [foodOptions, selectedFoodId]
  );

  const loadFoodOptions = useCallback(async (search: string) => {
    setLastSearch(search);
    setFoodPage(1);
    try {
      const res = await getFoodNameList(1, 10, search || undefined);
      const list = res.results ?? [];
      setHasMoreFood(!!res.next);
      setFoodOptions(
        list.map((f) => ({
          value: f.id as number,
          label: f.name + (f.code ? ` (${f.code})` : ""),
        }))
      );
    } catch {
      setFoodOptions([]);
    }
  }, []);

  const loadMoreFood = useCallback(async () => {
    if (!hasMoreFood || isLoadingMoreFood) return;
    setIsLoadingMoreFood(true);
    try {
      const nextPage = foodPage + 1;
      const res = await getFoodNameList(nextPage, 10, lastSearch || undefined);
      const list = res.results ?? [];
      setHasMoreFood(!!res.next);
      setFoodPage(nextPage);
      setFoodOptions((prev) => [
        ...prev,
        ...list.map((f) => ({
          value: f.id as number,
          label: f.name + (f.code ? ` (${f.code})` : ""),
        })),
      ]);
    } catch (err) {
      console.error("Error loading more food:", err);
    } finally {
      setIsLoadingMoreFood(false);
    }
  }, [foodPage, hasMoreFood, isLoadingMoreFood, lastSearch]);

  const loadMealTypeOptions = useCallback(async (search: string) => {
    try {
      const res = await getMealTypeList(1, "all", search || undefined);
      const list = res.results ?? [];
      setMealTypeOptions(
        list.map((m) => ({
          value: m.id as number,
          label: m.name,
        }))
      );
    } catch {
      setMealTypeOptions([]);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyPatients();
        setPatients(data);
      } catch {
        toast.error("Failed to load allotted patients.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // Only load patients once on mount

  useEffect(() => {
    if (!selectedFoodId) {
      setSelectedFoodImage(null);
      return;
    }
    const fetchImage = async () => {
      try {
        const data = await getFoodNameById(selectedFoodId);
        setSelectedFoodImage(data.image || null);
      } catch (err) {
        console.error("Error fetching food image:", err);
      }
    };
    fetchImage();
  }, [selectedFoodId]);


  useEffect(() => {
    if (!selectedPatientId) {
      setRows([]);
      setTotalItems(0);
      setTotalPages(1);
      return;
    }
    const loadRows = async () => {
      setRowsLoading(true);
      try {
        const data = await fetchFoodRecommendationsForPatient(
          selectedPatientId,
          currentPage,
          rowsPerPage
        );
        setRows(data.results || []);
        setTotalItems(data.count || 0);
        setTotalPages(data.total_pages || 1);
      } catch {
        toast.error("Failed to load recommendations.");
        setRows([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setRowsLoading(false);
      }
    };
    void loadRows();
  }, [selectedPatientId, currentPage, rowsPerPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || selectedFoodId == null) {
      toast.error("Select a patient and a food from the catalog.");
      return;
    }
    setSaving(true);
    try {
      const created = await createFoodRecommendation({
        patient: selectedPatientId!,
        food: selectedFoodId!,
        quantity: quantity.trim() || null,
        meal_time: selectedMealTypeId ?? null,
        notes: notes.trim() || null,
        comment: comment.trim() || null,
      });
      setCurrentPage(1);
      const data = await fetchFoodRecommendationsForPatient(selectedPatientId!, 1, rowsPerPage);
      setRows(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(data.total_pages || 1);
      setSelectedFoodId(undefined);
      setQuantity("");
      setSelectedMealTypeId(undefined);
      setNotes("");
      setComment("");
      toast.success("Food suggestion saved.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: Record<string, string[] | string> } })?.response?.data;
      const detail =
        typeof msg?.detail === "string"
          ? msg.detail
          : msg?.patient
            ? String((msg.patient as string[])[0] || msg.patient)
            : "Could not save.";
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteFoodRecommendation(itemToDelete);
      const targetPage = currentPage > 1 && rows.length === 1 ? currentPage - 1 : currentPage;
      const data = await fetchFoodRecommendationsForPatient(
        selectedPatientId!,
        targetPage,
        rowsPerPage
      );
      setCurrentPage(targetPage);
      setRows(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(data.total_pages || 1);
      toast.success("Removed.");
    } catch {
      toast.error("Could not remove.");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta
        title="Suggest foods to patients"
        description="Recommend foods from the reference catalog to your allotted patients."
      />
      <PageBreadcrumb pageTitle="Suggest foods to patients" />
      <ToastContainer position="bottom-right" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Suggest foods</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Choose an allotted patient, pick a food from the master list, and add optional portion, meal time, and notes.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading patients…</p>
        ) : patients.length === 0 ? (
          <p className="mt-6 text-sm text-amber-700 dark:text-amber-400">You have no allotted patients yet.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Patient</label>
                <SearchableSelect<number>
                  options={patientOptions}
                  value={selectedPatientId}
                  onChange={(val) => {
                    setSelectedPatientId(val || undefined);
                    setCurrentPage(1);
                  }}
                  placeholder="Search and select a patient"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Food (catalog)</label>
                <SearchableSelect<number>
                  options={foodOptions}
                  value={selectedFoodId}
                  onChange={(v) => setSelectedFoodId(v)}
                  onSearch={(q) => void loadFoodOptions(q)}
                  onFocus={() => void loadFoodOptions("")}
                  onLoadMore={loadMoreFood}
                  isLoadingMore={isLoadingMoreFood}
                  placeholder="Search food name…"
                  required
                />
                {selectedFoodImage && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 animate-in fade-in slide-in-from-top-1 duration-200">
                    <img src={selectedFoodImage} alt={selectedFood?.label} className="h-16 w-16 object-cover rounded-md shadow-sm border border-white dark:border-gray-700" />
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Selected Food</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedFood?.label || "Loading..."}</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Quantity <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 1 bowl, 100g"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Meal time</label>
                <SearchableSelect<number>
                  options={mealTypeOptions}
                  value={selectedMealTypeId}
                  onChange={(v) => setSelectedMealTypeId(v)}
                  onSearch={(q) => void loadMealTypeOptions(q)}
                  onFocus={() => void loadMealTypeOptions("")}
                  placeholder="Select meal time..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Clinical or dietary notes for the patient"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Comment <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="Short comment visible to the patient"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving || !selectedPatientId} className="inline-flex items-center gap-2">
              <FiPlus size={18} />
              {saving ? "Saving…" : "Add suggestion"}
            </Button>
          </form>
        )}
      </div>

      {selectedPatient && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Suggestions for{" "}
                {`${selectedPatient.user.first_name || ""} ${selectedPatient.user.last_name || ""}`.trim() ||
                  selectedPatient.user.email}
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-300">Show</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value) || 10);
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-white/10">
                <TableCell isHeader className="px-4 py-3">
                  Image
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Food
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Quantity
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Meal
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Notes / comment
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Suggested on
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading suggestions...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No food suggestions yet for this patient.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                   <TableRow key={r.id} className="border-b border-gray-100 dark:border-white/5">
                    <TableCell className="px-4 py-3">
                      {r.food_details?.image ? (
                        <img src={r.food_details.image} alt={r.food_details.name} className="h-10 w-10 object-cover rounded-lg" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-[10px] text-gray-400">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {r.food_details?.name ?? `#${r.food}`}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.quantity || "—"}</TableCell>
                    <TableCell className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">
                      {r.meal_time_details?.name || "—"}
                    </TableCell>
                    <TableCell className="max-w-xs px-4 py-3 text-gray-600 dark:text-gray-400">
                      <div className="line-clamp-2">{r.notes || r.comment || "—"}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {r.recommended_on ? new Date(r.recommended_on).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDelete(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FiTrash2 size={14} /> Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!rowsLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-white/10">
              <p className="text-xs text-gray-500">
                Showing {(currentPage - 1) * rowsPerPage + 1}-
                {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Remove Food Suggestion?"
        message="Are you sure you want to remove this food suggestion from the patient's valid recommendations?"
        confirmText="Remove Food"
      />
    </div>
  );
};

export default SuggestFoodNameToPatientsPage;
