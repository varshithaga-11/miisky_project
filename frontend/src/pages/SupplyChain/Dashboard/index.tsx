import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  CalendarRange,
  Truck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { getMyAssignments } from "../Assignments/api";

export default function SupplyChainDashboardPage() {
  const [pending, setPending] = useState<number | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getMyAssignments();
        if (cancelled) return;
        const today = new Date().toISOString().slice(0, 10);
        const todayRows = rows.filter((r) => r.scheduled_date === today);
        const p = todayRows.filter((r) => r.status !== "delivered" && r.status !== "failed").length;
        const d = todayRows.filter((r) => r.status === "delivered").length;
        setPending(p);
        setDone(d);
      } catch {
        if (!cancelled) {
          setPending(0);
          setDone(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subtitle = useMemo(() => {
    if (loading) return "Loading today’s delivery snapshot…";
    return `Today’s deliveries: ${pending ?? 0} pending, ${done ?? 0} completed.`;
  }, [loading, pending, done]);

  return (
    <>
      <PageMeta
        title="Supply chain dashboard | Miisky"
        description="Overview of your delivery work, earnings, and planned leave"
      />
      <PageBreadcrumb pageTitle="Dashboard" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-5xl mx-auto space-y-8">
        <header className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Supply chain</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
          <Link
            to="/supplychain/daily-work"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 shadow-sm shrink-0"
          >
            <Truck className="w-4 h-4" />
            Open daily work
          </Link>
        </header>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/supplychain/daily-work"
            className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex items-start justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                All daily work
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Your meal deliveries for today and upcoming days — update status as you pick up and deliver.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
          </Link>

          <Link
            to="/supplychain/earnings"
            className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex items-start justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Earnings
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                See completed deliveries and a simple summary (payout rules depend on your admin / kitchen).
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
          </Link>

          <Link
            to="/supplychain/planned-leave"
            className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex items-start justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors sm:col-span-2"
          >
            <div>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                <CalendarRange className="w-5 h-5 text-amber-600" />
                Planned leave
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Tell micro kitchens which days you will be away so they can reassign meals to another delivery
                person.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
          </Link>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 bg-white/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Quick tip
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Use <strong>Planned leave</strong> before time off. Kitchen staff use{" "}
            <strong>Delivery management → Daily reassignment</strong> to move meals when you are unavailable.
          </p>
        </div>
      </div>
    </>
  );
}
