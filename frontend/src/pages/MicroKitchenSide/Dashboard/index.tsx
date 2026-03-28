import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  Package,
  UtensilsCrossed,
  Users,
  Star,
  FileText,
  HelpCircle,
  UserCog,
  RotateCw,
  Zap,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { getMicroKitchenDashboardStats, MicroKitchenDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: any;
  statKey?: keyof MicroKitchenDashboardStats;
  color: string;
  category: "Logistics" | "Patients" | "Management";
};

const microKitchenMenus: DashboardMenuItem[] = [
  // Logistics
  { label: "Daily Prep", path: "/microkitchen/daily-prep", icon: Truck, statKey: "dailyPrep", color: "amber", category: "Logistics" },
  { label: "Manage Orders", path: "/microkitchen/orders", icon: Package, statKey: "orders", color: "indigo", category: "Logistics" },
  { label: "Available Foods", path: "/microkitchen/available-foods", icon: UtensilsCrossed, statKey: "availableFoods", color: "emerald", category: "Logistics" },

  // Patients & Reviews
  { label: "Patients", path: "/microkitchen/patients", icon: Users, statKey: "patients", color: "blue", category: "Patients" },
  { label: "Kitchen Reviews", path: "/microkitchen/reviews", icon: Star, statKey: "kitchenReviews", color: "rose", category: "Patients" },
  { label: "Diet plan payouts", path: "/microkitchen/plan-payouts", icon: Wallet, color: "lime", category: "Patients" },

  // Management
  { label: "Questionnaire", path: "/microkitchen/questionnaire", icon: FileText, statKey: "questionnaire", color: "violet", category: "Management" },
  { label: "Inspection Reports", path: "/microkitchen/inspection-report", icon: FileText, statKey: "inspectionReports", color: "sky", category: "Management" },
  { label: "Support Tickets", path: "/microkitchen/support-tickets", icon: HelpCircle, statKey: "supportTickets", color: "orange", category: "Management" },
  { label: "Profile", path: "/profile-info", icon: UserCog, color: "slate", category: "Management" },
];

export default function MicroKitchenDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MicroKitchenDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMicroKitchenDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load operations data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalLoad = stats ? (stats.orders || 0) + (stats.dailyPrep || 0) : 0;

  const topCards = [
    { title: "Daily Food Prep", value: stats?.dailyPrep ?? 0, icon: Truck, color: "bg-amber-500", textColor: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-900/20", link: "/microkitchen/daily-prep" },
    { title: "Total Orders", value: stats?.orders ?? 0, icon: Package, color: "bg-indigo-600", textColor: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", link: "/microkitchen/orders" },
    { title: "Active Patients", value: stats?.patients ?? 0, icon: Users, color: "bg-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", link: "/microkitchen/patients" },
    { title: "Menu Items", value: stats?.availableFoods ?? 0, icon: UtensilsCrossed, color: "bg-emerald-600", textColor: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", link: "/microkitchen/available-foods" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 lg:px-10 py-10">
      {/* Premium Header */}

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="relative size-20">
            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full animate-ping" />
            <div className="relative size-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Calibrating Kitchen Workflow...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 p-8 rounded-[40px] text-center max-w-xl mx-auto">
          <h3 className="text-rose-600 font-black mb-4 tracking-tight uppercase">System Exception</h3>
          <p className="text-rose-500 text-sm font-medium mb-6">{error}</p>
          <button onClick={fetchStats} className="px-10 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Refresh System</button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {topCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  to={card.link}
                  className="group relative overflow-hidden rounded-[40px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">
                        {card.title}
                      </p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums transition-colors group-hover:text-amber-500">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-3xl ${card.bgColor} transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-sm`}>
                      <Icon className={`h-8 w-8 ${card.textColor}`} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-2 ${card.color} translate-y-full transition-transform group-hover:translate-y-0`} />
                </Link>
              );
            })}
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Order Status */}
            <div className="rounded-[48px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                <Package size={140} />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl">
                    <Zap className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Order Velocity</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { label: "Pending Preparation", value: stats?.ordersPending ?? 0, color: "text-amber-500", key: "pending" },
                  { label: "Completed Logistics", value: stats?.ordersCompleted ?? 0, color: "text-emerald-500", key: "completed" },
                ].map(stat => (
                  <div key={stat.key} className="p-10 rounded-[44px] bg-slate-50 dark:bg-gray-800/50 border border-transparent transition-all hover:border-amber-200 hover:bg-amber-50/30">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{stat.label}</span>
                    <span className={`text-5xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Module Nodes Section */}
          <div className="space-y-20 pb-20">
            {["Logistics", "Patients", "Management"].map((cat) => {
              const items = microKitchenMenus.filter(m => m.category === cat);
              return (
                <section key={cat} className="space-y-10">
                  <div className="flex items-center gap-4 ml-2">
                    <div className={`h-10 w-2 rounded-full ${cat === 'Logistics' ? 'bg-amber-500' : cat === 'Patients' ? 'bg-blue-600' : 'bg-violet-600'}`} />
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.5em] italic">
                      {cat} <span className="text-slate-400 font-medium tracking-normal opacity-60">Operations</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const value = item.statKey ? (loading ? "..." : (stats?.[item.statKey] ?? 0)) : null;

                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="group relative flex flex-col text-left transition-all duration-500 hover:-translate-y-3"
                        >
                          <div className="relative h-full overflow-hidden rounded-[54px] border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-10 shadow-sm group-hover:shadow-2xl group-hover:border-amber-500/40 transition-all backdrop-blur-xl">
                            <div className="absolute -right-8 -top-8 opacity-[0.02] group-hover:opacity-[0.08] transition-all rotate-12 group-hover:rotate-0 duration-700">
                              <Icon size={180} />
                            </div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                              <div className={`p-5 rounded-[28px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                  item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                    item.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                      item.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                        item.color === 'violet' ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' :
                                          item.color === 'sky' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' :
                                            item.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                <Icon size={30} strokeWidth={2.5} />
                              </div>
                            </div>

                            <div className="relative z-10">
                              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">
                                {item.label}
                              </h2>
                              {value !== null ? (
                                <div className="flex items-baseline gap-3">
                                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-amber-500 tabular-nums">
                                    {value}
                                  </p>
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-50">Units</span>
                                </div>
                              ) : (
                                <p className="text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors uppercase tracking-widest leading-none">Access</p>
                              )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                              <span className="text-[11px] font-black uppercase tracking-widest text-amber-500">Execute Module</span>
                              <ChevronRight size={18} className="text-amber-500" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
