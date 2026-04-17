import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiLoader, FiSearch, FiCalendar, FiUser, FiPhone, FiMoreVertical, FiPackage } from "react-icons/fi";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { Modal } from "../../../components/ui/modal";
import {
  fetchMicroKitchenTeamLeaves,
  fetchMealAllotmentCheckForLeave,
  type MealAllotmentCheckResponse,
} from "./api";
import { SupplyChainLeave } from "../../SupplyChain/api";
import type { OrderDatePeriod } from "../../NonPatient/orderapi";

const LEAVE_MENU_WIDTH_PX = 240;

const PERIOD_OPTIONS: { value: OrderDatePeriod; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "next_month", label: "Next month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "this_year", label: "This year" },
  { value: "custom_range", label: "Custom range" },
];

function formatLeaveRange(r: SupplyChainLeave): string {
  if (r.leave_type === "partial") {
    const st = r.start_time || "—";
    const et = r.end_time || "—";
    return `${r.start_date} (${st} – ${et})`;
  }
  return r.start_date === r.end_date ? r.start_date : `${r.start_date} → ${r.end_date}`;
}

function formatCreatedOn(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const MicroKitchenPlannedLeavePage: React.FC = () => {
  const [rows, setRows] = useState<SupplyChainLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<OrderDatePeriod>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  /** Fixed-position menu anchored to the ⋮ button (portal avoids table/overflow clipping). */
  const [menuState, setMenuState] = useState<{ leaveId: number; top: number; left: number } | null>(null);
  const menuPortalRef = useRef<HTMLDivElement>(null);
  const [mealCheck, setMealCheck] = useState<{
    open: boolean;
    loading: boolean;
    data: MealAllotmentCheckResponse | null;
    error: string | null;
  }>({ open: false, loading: false, data: null, error: null });

  useEffect(() => {
    if (!menuState) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (menuPortalRef.current?.contains(t)) return;
      if (t.closest("[data-planned-leave-menu-trigger]")) return;
      setMenuState(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuState]);

  useEffect(() => {
    if (!menuState) return;
    const close = () => setMenuState(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menuState]);

  const openOrToggleMenu = (leaveId: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (menuState?.leaveId === leaveId) {
      setMenuState(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const w = LEAVE_MENU_WIDTH_PX;
    const left = Math.max(8, Math.min(rect.right - w, window.innerWidth - w - 8));
    const menuHeightEst = 52;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const placeBelow = spaceBelow >= menuHeightEst || rect.top < menuHeightEst + gap;
    const top = placeBelow ? rect.bottom + gap : Math.max(gap, rect.top - menuHeightEst - gap);
    setMenuState({ leaveId, top, left });
  };

  const runMealAllotmentCheck = async (leaveId: number) => {
    setMenuState(null);
    setMealCheck({ open: true, loading: true, data: null, error: null });
    try {
      const data = await fetchMealAllotmentCheckForLeave(leaveId);
      setMealCheck({ open: true, loading: false, data, error: null });
    } catch (e) {
      console.error(e);
      setMealCheck({
        open: true,
        loading: false,
        data: null,
        error: "Could not load meal allotment check. Try again.",
      });
    }
  };

  const load = async () => {
    if (period === "custom_range" && (!customStart || !customEnd)) {
      setRows([]);
      setTotalItems(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMicroKitchenTeamLeaves(
        currentPage,
        pageSize,
        search,
        period,
        period === "custom_range" ? customStart : undefined,
        period === "custom_range" ? customEnd : undefined
      );
      setRows(data.results || []);
      setTotalItems(data.count || 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      console.error(e);
      toast.error("Could not load planned leave.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [currentPage, pageSize, search, period, customStart, customEnd]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, period, customStart, customEnd, pageSize]);

  const memberLabel = (r: SupplyChainLeave) => {
    const u = r.user_details;
    if (!u) return "—";
    const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    return name || u.username || `#${r.user}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta
        title="Team planned leave"
        description="Planned time off for delivery team members linked to your kitchen (filtered by when the leave was recorded)."
      />
      <PageBreadcrumb pageTitle="Team planned leave" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Team planned leave
          </h1>
          <p className="text-gray-500 mt-1 font-medium max-w-2xl">
            Leave entries filed by supply-chain staff who deliver for your kitchen. Date filters use{" "}
            <strong>recorded date</strong> (<span className="font-mono text-xs">created_on</span>), aligned with{" "}
            <span className="font-mono text-xs">date_utils.get_period_range</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-8">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, username, notes, or leave ID…"
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <Label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1 mb-1">
              <FiCalendar size={12} /> Recorded in period
            </Label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as OrderDatePeriod)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {period === "custom_range" && (
            <>
              <div>
                <Label className="text-[10px] font-black text-gray-400 uppercase block mb-1">From</Label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] font-black text-gray-400 uppercase block mb-1">To</Label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
                />
              </div>
            </>
          )}
          <div>
            <Label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Rows</Label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm font-bold text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[40px]">
            <FiLoader className="animate-spin text-indigo-500 mb-4" size={40} />
            <p className="text-gray-400 font-bold text-sm">Loading planned leave…</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-900/40">
                    <TableCell isHeader className="px-6 py-4">
                      Team member
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Mobile
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Type
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Unavailable (dates / times)
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Notes
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4">
                      Recorded
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 w-[72px] text-right">
                      <span className="sr-only">Actions</span>
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-6 py-16 text-center text-gray-500 font-medium">
                        {period === "custom_range" && (!customStart || !customEnd)
                          ? "Choose both dates for a custom range."
                          : "No planned leave entries for this filter."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow
                        key={r.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <span className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                            <FiUser className="text-indigo-500 shrink-0" size={16} />
                            {memberLabel(r)}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <span className="inline-flex items-center gap-1.5">
                            <FiPhone className="text-gray-400 shrink-0" size={14} />
                            {r.user_details?.mobile?.trim() || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
                            {r.leave_type === "partial" ? "Partial" : "Full day"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {formatLeaveRange(r)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[220px] truncate">
                          <span title={r.notes || ""}>{r.notes?.trim() || "—"}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {formatCreatedOn(r.created_on)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              data-planned-leave-menu-trigger
                              aria-label="More actions"
                              aria-expanded={menuState?.leaveId === r.id}
                              onClick={(e) => openOrToggleMenu(r.id, e)}
                              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <FiMoreVertical size={20} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-gray-400 font-bold">
                Showing{" "}
                <span className="text-gray-900 dark:text-white">
                  {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="text-gray-900 dark:text-white">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of <span className="text-gray-900 dark:text-white">{totalItems}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="!rounded-xl h-10 px-4"
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-500 px-2">
                  Page {currentPage} / {Math.max(1, totalPages)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="!rounded-xl h-10 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {typeof document !== "undefined" &&
        menuState &&
        createPortal(
          <div
            ref={menuPortalRef}
            role="menu"
            className="fixed z-[9999] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 shadow-2xl py-1 ring-1 ring-black/5 dark:ring-white/10"
            style={{
              top: menuState.top,
              left: menuState.left,
              width: LEAVE_MENU_WIDTH_PX,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => void runMealAllotmentCheck(menuState.leaveId)}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
            >
              <FiPackage className="text-indigo-500 shrink-0" size={16} />
              Check meals on leave days
            </button>
          </div>,
          document.body
        )}

      <Modal
        isOpen={mealCheck.open}
        onClose={() => setMealCheck({ open: false, loading: false, data: null, error: null })}
        className="max-w-lg p-0 overflow-hidden"
      >
        <div className="p-8">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
            Meal allotments on leave
          </h3>
          {mealCheck.loading && (
            <div className="flex flex-col items-center py-12">
              <FiLoader className="animate-spin text-indigo-500 mb-3" size={36} />
              <p className="text-sm text-gray-500 font-medium">Checking deliveries for this kitchen…</p>
            </div>
          )}
          {!mealCheck.loading && mealCheck.error && (
            <p className="text-red-600 dark:text-red-400 font-medium text-sm">{mealCheck.error}</p>
          )}
          {!mealCheck.loading && mealCheck.data && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Leave window:{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {mealCheck.data.start_date}
                  {mealCheck.data.end_date !== mealCheck.data.start_date
                    ? ` → ${mealCheck.data.end_date}`
                    : ""}
                </span>
              </p>
              {mealCheck.data.partial_day_note && (
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                  {mealCheck.data.partial_day_note}
                </p>
              )}
              <div
                className={`rounded-2xl p-5 border ${
                  mealCheck.data.has_meals_allotted
                    ? "border-amber-200 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-900/10"
                    : "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-900/10"
                }`}
              >
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {mealCheck.data.has_meals_allotted
                    ? "Meals are allotted to this delivery person on one or more of these days."
                    : "No meal deliveries assigned to this person for your kitchen in this leave window."}
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                  {mealCheck.data.total_meal_deliveries}{" "}
                  <span className="text-sm font-bold text-gray-500">total delivery row(s)</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Outstanding (not delivered / failed):{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {mealCheck.data.outstanding_deliveries}
                  </span>
                </p>
              </div>
              {mealCheck.data.by_date.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">By date</p>
                  <ul className="max-h-40 overflow-y-auto space-y-1 text-sm">
                    {mealCheck.data.by_date.map((row) => (
                      <li
                        key={row.date}
                        className="flex justify-between items-center gap-4 py-1 px-2 rounded-lg bg-gray-50 dark:bg-white/5"
                      >
                        <span className="font-mono text-gray-800 dark:text-gray-200">{row.date}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{row.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Object.keys(mealCheck.data.by_status).length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">By delivery status</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(mealCheck.data.by_status).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200"
                      >
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MicroKitchenPlannedLeavePage;
