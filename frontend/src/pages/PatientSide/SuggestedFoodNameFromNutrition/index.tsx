import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiLoader, FiUser, FiSearch } from "react-icons/fi";
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
  const [searchInput, setSearchInput] = useState("");

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

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const food = r.food_details?.name?.toLowerCase() ?? "";
      const notes = (r.notes || "").toLowerCase();
      const comment = (r.comment || "").toLowerCase();
      const from = r.recommended_by_details
        ? `${r.recommended_by_details.first_name} ${r.recommended_by_details.last_name}`.toLowerCase()
        : "";
      return food.includes(q) || notes.includes(q) || comment.includes(q) || from.includes(q);
    });
  }, [rows, searchInput]);

  const totalItems = filtered.length;

  return (
    <>
      <PageMeta
        title="Food suggestions from your nutritionist"
        description="Foods your nutritionist suggested from the reference catalog."
      />
      <PageBreadcrumb pageTitle="Suggested foods" />
      <ToastContainer position="bottom-right" />

      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Suggested foods</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your nutritionist can recommend foods from the master list with optional portion, meal time, and notes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search food, notes, or nutritionist…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems} {totalItems === 1 ? "entry" : "entries"}
            {searchInput.trim() && ` (filtered)`}
          </div>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="text-black dark:text-white p-6">Loading…</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    #
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Food
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Quantity
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Meal time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Notes
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Message
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    From
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Date
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      {rows.length === 0
                        ? "No food suggestions yet. When your nutritionist adds recommendations, they will appear here."
                        : "No entries match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r, index) => (
                    <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {r.food_details?.name ?? `Food #${r.food}`}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90 font-medium">
                        {r.quantity || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90 font-medium capitalize">
                        {mealLabel(r.meal_time)}
                      </TableCell>
                      <TableCell className="max-w-xs px-5 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                        {r.notes || "—"}
                      </TableCell>
                      <TableCell className="max-w-xs px-5 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                        {r.comment || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-white/90">
                        <span className="inline-flex items-center gap-1.5">
                          <FiUser size={14} className="text-gray-400" />
                          {r.recommended_by_details
                            ? `${r.recommended_by_details.first_name} ${r.recommended_by_details.last_name}`.trim()
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                        {r.recommended_on ? new Date(r.recommended_on).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
};

export default SuggestedFoodNameFromNutritionPage;
