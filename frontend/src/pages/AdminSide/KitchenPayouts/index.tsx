import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { getKitchenPayouts, KitchenPayoutRow } from "../OrderManagement/api";

export default function KitchenPayoutsPage() {
  const [rows, setRows] = useState<KitchenPayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getKitchenPayouts(page, 20, "");
        setRows(res.results || []);
        setTotalPages(res.total_pages || 0);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <>
      <PageMeta title="Kitchen payouts" description="Order sales and diet plan payout balances per kitchen" />
      <PageBreadcrumb pageTitle="Kitchen payouts" />

      <div className="max-w-6xl mx-auto space-y-4 rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">Diet plan payouts</span> are accrued when
          patients pay for plans; amounts split by day when kitchens change mid-plan. Order commission column is a
          legacy example (10% of delivered order food total), separate from plan payouts.
        </p>

        {loading ? (
          <p className="text-sm text-gray-500 py-8">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                  <TableCell isHeader>Kitchen</TableCell>
                  <TableCell isHeader>Order sales (delivered)</TableCell>
                  <TableCell isHeader>Example 10% on orders</TableCell>
                  <TableCell isHeader>Plan payout pending</TableCell>
                  <TableCell isHeader>Plan payout disbursed</TableCell>
                  <TableCell isHeader>Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No kitchens found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.kitchen_name}</TableCell>
                      <TableCell>₹{r.total_sales.toFixed(2)}</TableCell>
                      <TableCell>₹{r.order_commission_example.toFixed(2)}</TableCell>
                      <TableCell className="text-amber-700 dark:text-amber-400">
                        ₹{r.diet_plan_payout_pending.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-emerald-700 dark:text-emerald-400">
                        ₹{r.diet_plan_payout_disbursed.toFixed(2)}
                      </TableCell>
                      <TableCell>{r.payout_status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex gap-2 justify-end text-sm">
            <button
              type="button"
              disabled={page <= 1}
              className="px-3 py-1 rounded-lg border disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="py-1 text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-lg border disabled:opacity-40"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
