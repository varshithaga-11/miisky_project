import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { fetchNutritionistPlanPayouts, PlanPayoutTrackerRow } from "./api";

function fmtDate(s: string | null) {
  if (!s) return "—";
  return s;
}

export default function NutritionPlanPayoutsPage() {
  const [rows, setRows] = useState<PlanPayoutTrackerRow[]>([]);
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

  const totalRemaining = rows.reduce(
    (acc, r) => acc + parseFloat(String(r.remaining_amount ?? "0")),
    0
  );

  return (
    <>
      <PageMeta title="Plan payouts" description="Your share from verified patient diet plan payments" />
      <PageBreadcrumb pageTitle="Diet plan payouts" />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Each row is a <span className="font-medium">payout tracker</span> for a date range. Admin records actual
            transfers separately; <span className="font-medium">remaining</span> is what is still owed on that tracker.
            Closed rows are kept for history when the plan was resplit after reassignment.
          </p>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Remaining across trackers:{" "}
            <span className="text-amber-600 dark:text-amber-400">₹{totalRemaining.toFixed(2)}</span>
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
                  <TableCell isHeader>Total</TableCell>
                  <TableCell isHeader>Paid</TableCell>
                  <TableCell isHeader>Remaining</TableCell>
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
                    <TableCell>₹{parseFloat(r.total_amount).toFixed(2)}</TableCell>
                    <TableCell>₹{parseFloat(r.paid_amount).toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">₹{parseFloat(r.remaining_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          r.status === "paid"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : r.status === "closed"
                              ? "text-gray-500"
                              : "text-amber-700 dark:text-amber-400"
                        }
                      >
                        {r.status}
                        {r.is_closed && r.status !== "closed" ? " (closed)" : ""}
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
