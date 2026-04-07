import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiLoader, FiUser } from "react-icons/fi";
import { fetchMyFoodRecommendationsFromNutrition, PatientFoodRecommendation } from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";

const mealLabel = (m: string | null) => {
  if (!m) return "—";
  const map: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  };
  return map[m] || m;
};

const SuggestedFoodNameFromNutritionPage: React.FC = () => {
  const [rows, setRows] = useState<PatientFoodRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMyFoodRecommendationsFromNutrition();
        setRows(data);
      } catch {
        toast.error("Could not load food suggestions.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <PageMeta
        title="Food suggestions from your nutritionist"
        description="Foods your nutritionist suggested from the reference catalog."
      />
      <PageBreadcrumb pageTitle="Suggested foods" />
      <ToastContainer position="bottom-right" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Suggested foods</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Your nutritionist can recommend foods (from the master food list) with optional portion, meal time, and notes.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 dark:border-white/10 dark:bg-gray-900">
          <FiLoader className="mb-3 animate-spin text-brand-500" size={36} />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
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
                  Meal time
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Notes
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Message
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  From
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No food suggestions yet. When your nutritionist adds recommendations, they will appear here.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} className="border-b border-gray-100 dark:border-white/5">
                    <TableCell className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {r.food_details?.name ?? `Food #${r.food}`}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.quantity || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 dark:text-gray-300">{mealLabel(r.meal_time)}</TableCell>
                    <TableCell className="max-w-xs px-4 py-3 text-gray-600 dark:text-gray-400">{r.notes || "—"}</TableCell>
                    <TableCell className="max-w-xs px-4 py-3 text-gray-600 dark:text-gray-400">{r.comment || "—"}</TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <FiUser size={14} className="opacity-60" />
                        {r.recommended_by_details
                          ? `${r.recommended_by_details.first_name} ${r.recommended_by_details.last_name}`.trim()
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {r.recommended_on ? new Date(r.recommended_on).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SuggestedFoodNameFromNutritionPage;
