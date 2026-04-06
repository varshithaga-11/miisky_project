import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Package, CheckCircle2, ArrowLeft } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { getMyAssignments } from "../Assignments/api";

export default function SupplyChainEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [deliveredThisMonth, setDeliveredThisMonth] = useState(0);
  const [totalActive, setTotalActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getMyAssignments();
        if (cancelled) return;
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const monthRows = rows.filter((r) => r.scheduled_date.startsWith(ym));
        setDeliveredThisMonth(monthRows.filter((r) => r.status === "delivered").length);
        setTotalActive(rows.filter((r) => r.status !== "delivered" && r.status !== "failed").length);
      } catch {
        if (!cancelled) {
          setDeliveredThisMonth(0);
          setTotalActive(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date());
  }, []);

  return (
    <>
      <PageMeta title="Earnings | Supply chain" description="Delivery completion summary" />
      <PageBreadcrumb pageTitle="Earnings" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-3xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center gap-4">
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
            <span className="text-xs font-semibold uppercase tracking-wide">How much you earned</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings summary</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Exact payment amounts are configured by your organization. Here you can see how many deliveries you
            completed in <strong>{monthLabel}</strong>.
          </p>
        </header>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading…</div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed deliveries ({monthLabel})</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{deliveredThisMonth}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open / in-progress deliveries (all dates)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalActive}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
              Rupee amounts and payout schedules are not shown here yet. Contact your micro kitchen or admin for
              payout details.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
