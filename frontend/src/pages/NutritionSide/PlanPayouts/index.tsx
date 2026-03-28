import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { fetchNutritionistPlanPayouts, PlanPayoutRecord } from "./api";

function fmtDate(s: string | null) {
  if (!s) return "—";
  return s;
}

export default function NutritionPlanPayoutsPage() {
  const [rows, setRows] = useState<PlanPayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchNutritionistPlanPayouts();
        setRows(data);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pending = rows.filter((r) => r.status === "pending");
  const totalPending = pending.reduce((acc, r) => acc + parseFloat(r.amount || "0"), 0);

  return (
    <>
      <PageMeta title="Plan payouts" description="Your share from verified patient diet plan payments" />
      <PageBreadcrumb pageTitle="Diet plan payouts" />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Amounts are calculated when admin verifies payment. If you were reassigned mid-plan, rows are split by
            calendar days in each segment. Status <span className="font-medium">pending</span> means not yet marked
            disbursed by operations.
          </p>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending total:{" "}
            <span className="text-amber-600 dark:text-amber-400">₹{totalPending.toFixed(2)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm overflow-x-auto">
          {loading ? (
            <p className="text-sm text-gray-500 py-8">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500 py-8">No plan payouts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell isHeader>Patient</TableCell>
                  <TableCell isHeader>Plan</TableCell>
                  <TableCell isHeader>Period</TableCell>
                  <TableCell isHeader>Amount</TableCell>
                  <TableCell isHeader>Reason</TableCell>
                  <TableCell isHeader>Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.patient_name || "—"}</TableCell>
                    <TableCell>{r.plan_title || "—"}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {fmtDate(r.period_from)} → {fmtDate(r.period_to)}
                    </TableCell>
                    <TableCell className="font-semibold">₹{parseFloat(r.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-xs capitalize">{r.reason.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <span
                        className={
                          r.status === "pending"
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-emerald-700 dark:text-emerald-400"
                        }
                      >
                        {r.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
