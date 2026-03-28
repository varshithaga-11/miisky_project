import { Fragment, useEffect, useState } from "react";
import { FiChevronDown, FiChevronRight, FiSearch } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { toast } from "react-toastify";
import { fetchPlanPaymentsOverview, PlanPaymentOverviewRow, PayoutTrackerLine } from "./api";

const COL_SPAN = 8;

function fmtMoney(s: string) {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n.toFixed(2) : s;
}

function statusBadge(status: string) {
  const base = "inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize";
  if (status === "active" || status === "verified") return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300`;
  if (status === "completed") return `${base} bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200`;
  if (status === "payment_pending" || status === "uploaded") return `${base} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`;
  return `${base} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`;
}

function payoutTypeLabel(t: string) {
  if (t === "platform") return "Platform";
  if (t === "nutritionist") return "Nutritionist";
  if (t === "kitchen") return "Kitchen";
  return t;
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200/90 dark:border-gray-600 bg-slate-50/80 dark:bg-gray-800/50 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-2">{title}</h4>
      <div className="text-sm space-y-1.5">{children}</div>
    </div>
  );
}

function RowDetail({ r }: { r: PlanPaymentOverviewRow }) {
  const trackers = r.payout_trackers || [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 text-gray-800 dark:text-gray-200">
      <DetailBlock title="Snapshot (frozen at verification)">
        <p>
          <span className="text-gray-500 dark:text-gray-400">Gross total:</span>{" "}
          <span className="font-semibold">₹{fmtMoney(r.total_amount)}</span>
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Split % — platform / nutrition / kitchen: {fmtMoney(r.platform_percent)} / {fmtMoney(r.nutrition_percent)} /{" "}
          {fmtMoney(r.kitchen_percent)}
        </p>
        <p className="text-xs">
          ₹ Platform: {fmtMoney(r.platform_amount)} · ₹ Nutrition: {fmtMoney(r.nutrition_amount)} · ₹ Kitchen:{" "}
          {fmtMoney(r.kitchen_amount)}
        </p>
      </DetailBlock>

      <DetailBlock title="Enrolment & plan">
        <p>
          <span className="text-gray-500">User diet plan ID:</span> #{r.user_diet_plan}
        </p>
        <p>
          <span className="text-gray-500">Plan status:</span>{" "}
          <span className={statusBadge(r.user_diet_plan_status)}>{r.user_diet_plan_status}</span>
        </p>
        <p className="text-xs">
          Dates: {r.plan_start_date || "—"} → {r.plan_end_date || "—"}
        </p>
        <p className="text-xs">
          Nutritionist: {r.nutritionist?.name || "—"}
          <br />
          Kitchen: {r.micro_kitchen?.brand_name || "—"}
        </p>
      </DetailBlock>

      <DetailBlock title="Patient-reported payment">
        <p>
          <span className="text-gray-500">Payment status:</span> {r.payment_status || "—"}
        </p>
        <p>
          <span className="text-gray-500">Amount reported:</span>{" "}
          {r.amount_paid_reported != null ? `₹${fmtMoney(r.amount_paid_reported)}` : "—"}
        </p>
        <p className="text-xs font-mono break-all">
          <span className="text-gray-500">Transaction / ref:</span> {r.transaction_id || "—"}
        </p>
        <p className="text-xs">
          Marked verified on record: {r.is_payment_verified ? "Yes" : "No"}
        </p>
      </DetailBlock>

      <DetailBlock title="Admin verification">
        <p className="text-xs">
          {r.verified_on ? (
            <>
              <span className="text-gray-500">Verified at:</span> {new Date(r.verified_on).toLocaleString()}
              <br />
              <span className="text-gray-500">By:</span> {r.verified_by_name || "—"}
            </>
          ) : (
            "—"
          )}
        </p>
      </DetailBlock>

      <DetailBlock title="Disbursements vs snapshot">
        <p>
          <span className="text-gray-500">Total recorded as paid (trackers):</span>{" "}
          <span className="font-medium">₹{fmtMoney(r.total_disbursed)}</span>
        </p>
        <p>
          <span className="text-gray-500">Outstanding (sum of remaining per tracker):</span>{" "}
          <span className="font-medium">₹{fmtMoney(r.total_outstanding)}</span>
        </p>
      </DetailBlock>

      <div className="sm:col-span-2 xl:col-span-3">
        <DetailBlock title="Payout trackers (platform, nutritionist, kitchen)">
          {trackers.length === 0 ? (
            <p className="text-sm text-gray-500">No payout trackers linked to this snapshot yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-600">
                    <th className="py-1.5 pr-2">Type</th>
                    <th className="py-1.5 pr-2">Recipient</th>
                    <th className="py-1.5 pr-2 whitespace-nowrap">Period</th>
                    <th className="py-1.5 pr-2 text-right">Total ₹</th>
                    <th className="py-1.5 pr-2 text-right">Paid ₹</th>
                    <th className="py-1.5 pr-2 text-right">Remaining ₹</th>
                    <th className="py-1.5 pr-2">Status</th>
                    <th className="py-1.5">Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {trackers.map((t: PayoutTrackerLine) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-gray-700/80">
                      <td className="py-1.5 pr-2">{payoutTypeLabel(t.payout_type)}</td>
                      <td className="py-1.5 pr-2 max-w-[180px]">{t.recipient_label}</td>
                      <td className="py-1.5 pr-2 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {t.period_from || "—"} → {t.period_to || "—"}
                      </td>
                      <td className="py-1.5 pr-2 text-right font-mono">{fmtMoney(t.total_amount)}</td>
                      <td className="py-1.5 pr-2 text-right font-mono">{fmtMoney(t.paid_amount)}</td>
                      <td className="py-1.5 pr-2 text-right font-mono">{fmtMoney(t.remaining_amount)}</td>
                      <td className="py-1.5 pr-2 capitalize">{t.status}</td>
                      <td className="py-1.5 text-xs">
                        {t.is_closed ? `Yes${t.closed_reason ? ` — ${t.closed_reason}` : ""}` : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DetailBlock>
      </div>
    </div>
  );
}

export default function PlanPaymentsOverviewPage() {
  const [rows, setRows] = useState<PlanPaymentOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const load = async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await fetchPlanPaymentsOverview(p, 12, q);
      setRows(res.results || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.count || 0);
    } catch {
      toast.error("Failed to load plan payments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, search);
  }, [page, search]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <PageMeta
        title="Plan payments overview"
        description="All verified diet plan payments with split amounts and patient context"
      />
      <PageBreadcrumb pageTitle="Plan payments overview" />

      <div className="max-w-[1400px] mx-auto space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each row is a <strong>payment snapshot</strong> created when admin verifies a patient&apos;s plan payment.
          Amounts and percentages are frozen at verification. Use the row control to expand and see frozen splits,
          enrolment, patient-reported payment, verification, and per-recipient payout trackers.{" "}
          <strong>Total disbursed</strong> is the sum of amounts recorded on linked payout trackers;{" "}
          <strong>outstanding</strong> is what remains to pay per tracker.
        </p>

        <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10"
              placeholder="Patient name, email, plan title, code, transaction id…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
            <span>
              {totalCount} snapshot{totalCount === 1 ? "" : "s"}
              {search ? ` matching “${search}”` : ""}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 py-12 text-center">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500 py-12 text-center">No verified plan payments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell isHeader className="w-10 px-2" aria-label="Expand row">
                    <span className="sr-only">Expand</span>
                  </TableCell>
                  <TableCell isHeader className="whitespace-nowrap text-xs">
                    Snapshot
                  </TableCell>
                  <TableCell isHeader>Patient</TableCell>
                  <TableCell isHeader>Plan</TableCell>
                  <TableCell isHeader className="whitespace-nowrap">
                    Gross ₹
                  </TableCell>
                  <TableCell isHeader>Plan status</TableCell>
                  <TableCell isHeader className="whitespace-nowrap">
                    Disbursed ₹
                  </TableCell>
                  <TableCell isHeader className="whitespace-nowrap">
                    Outstanding ₹
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const isOpen = expanded.has(r.id);
                  return (
                    <Fragment key={r.id}>
                      <TableRow>
                        <TableCell className="align-top px-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                            aria-expanded={isOpen}
                            aria-label={isOpen ? "Collapse details" : "Expand details"}
                            onClick={() => toggleExpand(r.id)}
                          >
                            {isOpen ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
                          </button>
                        </TableCell>
                        <TableCell className="align-top text-xs font-mono text-gray-600 dark:text-gray-400">
                          #{r.id}
                          <div className="text-[11px] text-gray-400 mt-0.5">UDP #{r.user_diet_plan}</div>
                        </TableCell>
                        <TableCell className="align-top min-w-[140px]">
                          <div className="font-medium text-sm">{r.patient?.name || "—"}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[180px]">{r.patient?.email || ""}</div>
                        </TableCell>
                        <TableCell className="align-top min-w-[120px] text-sm">
                          <div>{r.diet_plan?.title || "—"}</div>
                          {r.diet_plan?.code && <div className="text-xs text-gray-500">{r.diet_plan.code}</div>}
                        </TableCell>
                        <TableCell className="align-top font-semibold whitespace-nowrap">₹{fmtMoney(r.total_amount)}</TableCell>
                        <TableCell className="align-top">
                          <span className={statusBadge(r.user_diet_plan_status)}>{r.user_diet_plan_status}</span>
                        </TableCell>
                        <TableCell className="align-top text-xs font-medium whitespace-nowrap">
                          ₹{fmtMoney(r.total_disbursed)}
                        </TableCell>
                        <TableCell className="align-top text-xs font-medium whitespace-nowrap">
                          ₹{fmtMoney(r.total_outstanding)}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="bg-slate-50/50 dark:bg-gray-800/30">
                          <TableCell colSpan={COL_SPAN} className="p-4 sm:p-5 border-t border-slate-200 dark:border-gray-700">
                            <RowDetail r={r} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="py-1.5 text-gray-600 dark:text-gray-400">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
