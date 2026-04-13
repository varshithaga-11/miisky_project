import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import SearchableSelect, { Option } from "../../../components/form/SearchableSelect";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { FiTrash2, FiPlus } from "react-icons/fi";

import { getMyPatients, MappedPatientResponse } from "../UploadedDocumentsByPatient/api";
import { getFoodNameList } from "../../AdminSide/FoodName/foodnameapi";
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


  const selectedPatient = useMemo(
    () => patients.find((p) => p.user.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const loadFoodOptions = useCallback(async (search: string) => {
    try {
      const res = await getFoodNameList(1, 80, search || undefined);
      const list = res.results ?? [];
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyPatients();
        setPatients(data);
        if (data.length && selectedPatientId === undefined) {
          setSelectedPatientId(data[0].user.id);
        }
        const mtRes = await getMealTypeList(1, "all");
        const mts = mtRes.results || [];
        setMealTypes(mts);
        setMealTypeOptions(mts.map(m => ({ value: m.id as number, label: m.name })));
      } catch {
        toast.error("Failed to load allotted patients or meal types.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    void loadFoodOptions("");
  }, [loadFoodOptions]);

  useEffect(() => {
    if (!selectedPatientId) {
      setRows([]);
      return;
    }
    const loadRows = async () => {
      try {
        const data = await fetchFoodRecommendationsForPatient(selectedPatientId);
        setRows(data);
      } catch {
        toast.error("Failed to load recommendations.");
      }
    };
    void loadRows();
  }, [selectedPatientId]);

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
      setRows((prev) => [created, ...prev]);
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
      setRows((prev) => prev.filter((r) => r.id !== itemToDelete));
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
                <select
                  value={selectedPatientId ?? ""}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value) || undefined)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {patients.map((p) => (
                    <option key={p.user.id} value={p.user.id}>
                      {`${p.user.first_name || ""} ${p.user.last_name || ""}`.trim() || p.user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Food (catalog)</label>
                <SearchableSelect<number>
                  options={foodOptions}
                  value={selectedFoodId}
                  onChange={(v) => setSelectedFoodId(v)}
                  onSearch={(q) => void loadFoodOptions(q)}
                  onFocus={() => void loadFoodOptions("")}
                  placeholder="Search food name…"
                  required
                />
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
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Suggestions for{" "}
              {`${selectedPatient.user.first_name || ""} ${selectedPatient.user.last_name || ""}`.trim() ||
                selectedPatient.user.email}
            </h2>
          </div>
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-white/10">
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
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No food suggestions yet for this patient.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} className="border-b border-gray-100 dark:border-white/5">
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
