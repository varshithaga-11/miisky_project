import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiLoader, FiUser, FiSearch, FiEye } from "react-icons/fi";
import {
  fetchMyFoodRecommendationsFromNutrition,
  fetchFoodNameNutritionDetail,
  PatientFoodRecommendation,
  PatientFoodRecommendationListResponse,
  FoodNameNutritionDetail,
} from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import DatePicker2 from "../../../components/form/date-picker2";

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

const COMPOSITION_SECTIONS: { key: keyof FoodNameNutritionDetail; label: string }[] = [
  { key: "proximate", label: "Proximate principles & dietary fiber" },
  { key: "water_soluble_vitamins", label: "Water-soluble vitamins" },
  { key: "fat_soluble_vitamins", label: "Fat-soluble vitamins" },
  { key: "carotenoids", label: "Carotenoids" },
  { key: "minerals", label: "Minerals & trace elements" },
  { key: "sugars", label: "Starch & sugars" },
  { key: "amino_acids", label: "Amino acid profile" },
  { key: "organic_acids", label: "Organic acids" },
  { key: "polyphenols", label: "Polyphenols" },
  { key: "phytochemicals", label: "Oligosaccharides, phytosterols, phytate & saponin" },
  { key: "fatty_acid_profile", label: "Fatty acid profile" },
];

function formatFieldLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function CompositionBlock({ data }: { data: Record<string, unknown> | null | undefined }) {
  if (!data || typeof data !== "object") {
    return <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">No composition row in catalog.</p>;
  }
  const rows = Object.entries(data).filter(([k, v]) => {
    if (k === "id") return false;
    if (v === null || v === undefined || v === "") return false;
    return true;
  });
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">All fields empty for this section.</p>;
  }
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col sm:flex-row sm:gap-2 border-b border-gray-100 dark:border-white/10 pb-2 last:border-0">
          <dt className="text-gray-500 dark:text-gray-400 shrink-0 sm:w-48">{formatFieldLabel(k)}</dt>
          <dd className="text-gray-900 dark:text-white font-medium break-words">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

const SuggestedFoodNameFromNutritionPage: React.FC = () => {
  const PAGE_SIZE = 10;
  const [rows, setRows] = useState<PatientFoodRecommendation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailFoodId, setDetailFoodId] = useState<number | null>(null);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailData, setDetailData] = useState<FoodNameNutritionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [period, startDate, endDate, searchQuery]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filters: { period?: string; start_date?: string; end_date?: string; search?: string; page: number; limit: number } = {
          page: currentPage,
          limit: PAGE_SIZE,
        };
        if (period === "custom_range") {
          if (startDate && endDate) {
            filters.period = period;
            filters.start_date = startDate;
            filters.end_date = endDate;
          }
        } else if (period !== "all") {
          filters.period = period;
        }
        if (searchQuery) {
          filters.search = searchQuery;
        }
        const data: PatientFoodRecommendationListResponse = await fetchMyFoodRecommendationsFromNutrition(filters);
        setRows(data.results);
        setTotalCount(data.count);
      } catch {
        toast.error("Could not load food suggestions.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [period, startDate, endDate, searchQuery, currentPage]);

  const openNutritionDetail = useCallback(async (foodId: number, foodLabel: string) => {
    setDetailOpen(true);
    setDetailFoodId(foodId);
    setDetailTitle(foodLabel);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const data = await fetchFoodNameNutritionDetail(foodId);
      setDetailData(data);
    } catch {
      toast.error("Could not load nutrition details.");
      setDetailOpen(false);
      setDetailFoodId(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setDetailFoodId(null);
    setDetailData(null);
    setDetailTitle("");
  }, []);

  const totalItems = totalCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = totalCount === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalCount);

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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="this_week">This week</option>
              <option value="last_week">Last week</option>
              <option value="this_month">This month</option>
              <option value="last_month">Last month</option>
              <option value="this_year">This year</option>
              <option value="custom_range">Custom range</option>
            </select>
            {period === "custom_range" && (
              <>
                <DatePicker2
                  id="suggested-food-start-date"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    if (endDate && date > endDate) {
                      setEndDate("");
                    }
                  }}
                  placeholder="Start date"
                  maxDate={endDate || undefined}
                  className="w-full sm:w-40"
                />
                <DatePicker2
                  id="suggested-food-end-date"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="End date"
                  minDate={startDate || undefined}
                  className="w-full sm:w-40"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {startItem}-{endItem} of {totalItems} {totalItems === 1 ? "entry" : "entries"}
            {(searchInput.trim() || period !== "all") && ` (filtered)`}
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
                    className="px-3 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-14"
                  >
                    Info
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
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchQuery || period !== "all"
                        ? "No entries match your filters."
                        : "No food suggestions yet. When your nutritionist adds recommendations, they will appear here."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, index) => {
                    const foodId = r.food_details?.id ?? r.food;
                    const foodLabel = r.food_details?.name ?? `Food #${r.food}`;
                    const canShowDetail = typeof foodId === "number" && Number.isFinite(foodId);
                    return (
                      <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {foodLabel}
                        </TableCell>
                        <TableCell className="px-3 py-4 text-center">
                          {canShowDetail ? (
                            <button
                              type="button"
                              title="View full nutrition composition"
                              onClick={() => openNutritionDetail(foodId, foodLabel)}
                              className="inline-flex items-center justify-center rounded-lg p-2 text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-400 dark:hover:bg-sky-500/25"
                              aria-label={`Nutrition details for ${foodLabel}`}
                            >
                              {detailLoading && detailFoodId === foodId ? (
                                <FiLoader className="animate-spin" size={18} />
                              ) : (
                                <FiEye size={18} />
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
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
                          {r.recommended_on ? new Date(r.recommended_on).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {!loading && totalCount > 0 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-white"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-white"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={detailOpen}
        onClose={closeDetail}
        showCloseButton={false}
        className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl"
      >
        <div className="flex flex-col max-h-[min(90vh,800px)]">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-start gap-4 shrink-0">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nutrition composition</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate" title={detailTitle}>
                {detailTitle}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={closeDetail}>
              Close
            </Button>
          </div>
          <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
            {detailLoading && !detailData ? (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 py-8">
                <FiLoader className="animate-spin" />
                Loading nutrition data…
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-gray-900/30 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Food</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Name:</span> {detailData.name}
                  </p>
                  {detailData.code ? (
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                      <span className="font-medium">Code:</span> {detailData.code}
                    </p>
                  ) : null}
                  {detailData.food_group_detail ? (
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                      <span className="font-medium">Group:</span> {detailData.food_group_detail.name}
                    </p>
                  ) : null}
                </div>
                {COMPOSITION_SECTIONS.map(({ key, label }) => {
                  const block = detailData[key];
                  return (
                    <details
                      key={key}
                      className="group rounded-xl border border-gray-200 dark:border-white/10 open:bg-white dark:open:bg-gray-900/20"
                    >
                      <summary className="cursor-pointer list-none px-4 py-3 font-medium text-gray-900 dark:text-white flex items-center justify-between gap-2">
                        <span>{label}</span>
                        <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-white/10">
                        <CompositionBlock data={block as Record<string, unknown> | null | undefined} />
                      </div>
                    </details>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuggestedFoodNameFromNutritionPage;
