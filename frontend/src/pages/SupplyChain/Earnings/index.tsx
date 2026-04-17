import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Upload, Wallet } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import DatePicker2 from "../../../components/form/date-picker2";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import {
  getSupplyChainPayoutEarnings,
  SupplyChainEarningsFilters,
  SupplyChainPayoutRow,
  upsertSupplyChainPayoutProof,
} from "./api";

const fmtMoney = (s: string | undefined | null) => {
  const n = Number(s);
  if (!Number.isFinite(n)) return "₹0.00";
  return `₹${n.toFixed(2)}`;
};

export default function SupplyChainEarningsPage() {
  const [rows, setRows] = useState<SupplyChainPayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState<number | "">("");
  const [periodFilter, setPeriodFilter] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortField, setSortField] = useState<"amount" | "created_at" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [totalAmount, setTotalAmount] = useState<string>("0");
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [pendingAmount, setPendingAmount] = useState<string>("0");
  const [proofRow, setProofRow] = useState<SupplyChainPayoutRow | null>(null);
  const [proofTxRef, setProofTxRef] = useState("");
  const [proofScreenshot, setProofScreenshot] = useState<File | null>(null);
  const [savingProof, setSavingProof] = useState(false);
  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This week" },
    { value: "last_week", label: "Last week" },
    { value: "this_month", label: "This month" },
    { value: "last_month", label: "Last month" },
    { value: "this_year", label: "This year" },
    { value: "custom_range", label: "Custom range" },
  ];

  const uniquePatients = useMemo(() => {
    const map = new Map<number, string>();
    rows.forEach((r) => {
      if (r.patient) map.set(r.patient, r.patient_name || `Patient #${r.patient}`);
    });
    return [...map.entries()].map(([id, label]) => ({ id, label }));
  }, [rows]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchInput.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, searchInput ? 400 : 0);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const filters: SupplyChainEarningsFilters = {
          status: statusFilter || undefined,
          patient_id: patientFilter,
          period: periodFilter,
          start_date: periodFilter === "custom_range" ? startDate || undefined : undefined,
          end_date: periodFilter === "custom_range" ? endDate || undefined : undefined,
        };
        const data = await getSupplyChainPayoutEarnings(page, pageSize, debouncedSearch, filters);
        if (cancelled) return;
        setRows(data.results ?? []);
        setTotalPages(data.total_pages ?? 1);
        setTotalCount(data.count ?? 0);
        setTotalAmount(data.total_amount || "0");
        setPaidAmount(data.paid_amount || "0");
        setPendingAmount(data.pending_amount || "0");
      } catch {
        if (!cancelled) {
          toast.error("Failed to load payout earnings");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, statusFilter, patientFilter, periodFilter, startDate, endDate]);

  const handleSort = (field: "amount" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" ? "desc" : "asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    const sorted = [...rows].sort((a, b) => {
      if (sortField === "amount") {
        const av = Number(a.amount || 0);
        const bv = Number(b.amount || 0);
        return sortDirection === "asc" ? av - bv : bv - av;
      }
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? at - bt : bt - at;
    });
    return sorted;
  }, [rows, sortField, sortDirection]);

  const openProofModal = (row: SupplyChainPayoutRow) => {
    setProofRow(row);
    setProofTxRef(row.transaction_reference || "");
    setProofScreenshot(null);
  };

  const closeProofModal = () => {
    setProofRow(null);
    setProofTxRef("");
    setProofScreenshot(null);
  };

  const submitProof = async () => {
    if (!proofRow) return;
    setSavingProof(true);
    try {
      await upsertSupplyChainPayoutProof(proofRow.id, proofTxRef, proofScreenshot);
      toast.success("Proof details updated");
      closeProofModal();
      const filters: SupplyChainEarningsFilters = {
        status: statusFilter || undefined,
        patient_id: patientFilter,
        period: periodFilter,
        start_date: periodFilter === "custom_range" ? startDate || undefined : undefined,
        end_date: periodFilter === "custom_range" ? endDate || undefined : undefined,
      };
      const data = await getSupplyChainPayoutEarnings(page, pageSize, debouncedSearch, filters);
      setRows(data.results ?? []);
      setTotalPages(data.total_pages ?? 1);
      setTotalCount(data.count ?? 0);
      setTotalAmount(data.total_amount || "0");
      setPaidAmount(data.paid_amount || "0");
      setPendingAmount(data.pending_amount || "0");
    } catch {
      toast.error("Could not update proof details");
    } finally {
      setSavingProof(false);
    }
  };

  return (
    <>
      <PageMeta title="Earnings | Supply chain" description="Payout records from micro kitchen" />
      <PageBreadcrumb pageTitle="Earnings" />
      <ToastContainer position="bottom-right" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/supplychain/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <header className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <Wallet className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wide">Micro kitchen payouts</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supply-chain earnings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This section shows payout records created by micro kitchens for your diet-plan deliveries.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-sm text-gray-500">Total amount</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{fmtMoney(totalAmount)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-sm text-gray-500">Paid amount</p>
            <p className="text-3xl font-bold text-emerald-600">{fmtMoney(paidAmount)}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-sm text-gray-500">Pending amount</p>
            <p className="text-3xl font-bold text-amber-600">{fmtMoney(pendingAmount)}</p>
          </div>
        </div>

        <div className="mb-2 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search kitchen, patient, plan, or id..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-900"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={patientFilter}
              onChange={(e) => {
                const v = e.target.value;
                setPatientFilter(v ? Number(v) : "");
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              <option value="">All patients</option>
              {uniquePatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                if (e.target.value !== "custom_range") {
                  setStartDate("");
                  setEndDate("");
                }
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-900"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {periodFilter === "custom_range" ? (
              <div className="grid grid-cols-2 gap-2">
                <DatePicker2
                  id="supply-earnings-filter-start-date"
                  value={startDate}
                  onChange={(d) => {
                    setStartDate(d);
                    setPage(1);
                  }}
                  maxDate={endDate || undefined}
                  placeholder="From date"
                />
                <DatePicker2
                  id="supply-earnings-filter-end-date"
                  value={endDate}
                  onChange={(d) => {
                    setEndDate(d);
                    setPage(1);
                  }}
                  minDate={startDate || undefined}
                  placeholder="To date"
                />
              </div>
            ) : (
              <div />
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
            {totalCount} entries
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Kitchen</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patient</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Plan</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Period</TableCell>
                  <TableCell
                    isHeader
                    onClick={() => handleSort("amount")}
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    Amount {sortField === "amount" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell
                    isHeader
                    onClick={() => handleSort("created_at")}
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    Created {sortField === "created_at" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Transaction ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Screenshot</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Paid on</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      No payout records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedRows.map((r, i) => (
                    <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(page - 1) * pageSize + i + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                        {r.micro_kitchen_name || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                        {r.patient_name || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                        {r.plan_name || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                        {r.period_from || "—"} to {r.period_to || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                        {fmtMoney(r.amount)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            r.status === "paid"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                          }`}
                        >
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-700 text-theme-sm dark:text-gray-300">
                        {r.transaction_reference || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-700 text-theme-sm dark:text-gray-300">
                        {r.payment_screenshot_url ? (
                          <a
                            href={r.payment_screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                        {r.paid_on ? new Date(r.paid_on).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <Button size="sm" variant="outline" onClick={() => openProofModal(r)}>
                          <Upload className="w-4 h-4 mr-1" />
                          Proof
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      page === pageNum
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</div>
          </div>
        )}
      </div>
      {proofRow && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          onClick={closeProofModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload payment proof</h2>
            <p className="text-sm text-gray-500 mb-4">Order payout row #{proofRow.id}. Both fields are optional.</p>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Transaction ID</label>
            <input
              type="text"
              value={proofTxRef}
              onChange={(e) => setProofTxRef(e.target.value)}
              placeholder="e.g. UPI/Bank reference"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm mb-4"
            />
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofScreenshot(e.target.files?.[0] ?? null)}
              className="w-full text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={closeProofModal} disabled={savingProof}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void submitProof()} disabled={savingProof}>
                {savingProof ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
