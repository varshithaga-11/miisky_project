import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  Video,
  Layers,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  ShoppingCart,
  Package,
  HelpCircle,
  UserCog,
  CheckCircle,
  Activity,
  RotateCw,
  TrendingUp,
  Calendar,
  ChevronRight,
  Heart,
} from "lucide-react";
import { getPatientDashboardStats, PatientDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: any;
  statKey?: keyof PatientDashboardStats;
  color: string;
  category: "Medical" | "Dietary" | "Shopping" | "Account";
};

const patientMenus: DashboardMenuItem[] = [
  // Medical
  { label: "Questionnaire", path: "/patient/questionnaire", icon: FileText, statKey: "questionnaire", color: "blue", category: "Medical" },
  { label: "Health Reports", path: "/patient/health-reports", icon: FileText, statKey: "healthReports", color: "sky", category: "Medical" },
  { label: "Nutritionist", path: "/patient/allotted-nutritionist", icon: Users, statKey: "nutritionistAllotted", color: "violet", category: "Medical" },
  { label: "Consultation", path: "/patient/consultation", icon: Video, statKey: "consultations", color: "rose", category: "Medical" },

  // Dietary
  { label: "Diet Plans", path: "/patient/diet-plans", icon: FileText, statKey: "dietPlans", color: "emerald", category: "Dietary" },
  { label: "Suggestions", path: "/patient/suggested-plans", icon: Sparkles, statKey: "suggestedPlans", color: "amber", category: "Dietary" },
  { label: "Meals Allotted", path: "/patient/meals-allotted", icon: Layers, statKey: "mealsAllotted", color: "teal", category: "Dietary" },

  // Shopping
  { label: "Foods", path: "/patient/foods", icon: ShoppingBag, statKey: "foods", color: "emerald", category: "Shopping" },
  { label: "Micro Kitchens", path: "/patient/discover-kitchens", icon: UtensilsCrossed, statKey: "microKitchens", color: "indigo", category: "Shopping" },
  { label: "My Cart", path: "/patient/cart", icon: ShoppingCart, statKey: "cartItems", color: "rose", category: "Shopping" },
  { label: "My Bookings", path: "/patient/orders", icon: Package, statKey: "bookings", color: "blue", category: "Shopping" },

  // Account
  { label: "Support", path: "/patient/support-tickets", icon: HelpCircle, statKey: "supportTickets", color: "orange", category: "Account" },
  { label: "Profile", path: "/profile-info", icon: UserCog, color: "slate", category: "Account" },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPatientDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load your health statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const progressCount = stats ? (stats.questionnaire > 0 ? 1 : 0) + (stats.healthReports > 0 ? 1 : 0) + (stats.nutritionistAllotted > 0 ? 1 : 0) : 0;

  const topCards = [
    { title: "Health Records", value: stats?.healthReports ?? 0, icon: FileText, color: "bg-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", link: "/patient/health-reports" },
    { title: "Diet Plans", value: stats?.dietPlans ?? 0, icon: Sparkles, color: "bg-emerald-600", textColor: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", link: "/patient/diet-plans" },
    { title: "Consultations", value: stats?.consultations ?? 0, icon: Video, color: "bg-rose-600", textColor: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-900/20", link: "/patient/consultation" },
    { title: "Kitchen Units", value: stats?.microKitchens ?? 0, icon: UtensilsCrossed, color: "bg-indigo-600", textColor: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", link: "/patient/discover-kitchens" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 lg:px-10 py-10">

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="size-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Your Records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 p-10 rounded-[44px] text-center max-w-xl mx-auto shadow-sm">
          <h3 className="text-rose-600 font-black mb-4 uppercase tracking-tighter">Wellness Sync Error</h3>
          <p className="text-rose-500 text-sm font-medium mb-8 leading-relaxed">{error}</p>
          <button onClick={fetchStats} className="px-12 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 hover:scale-105 transition-transform">Retry Recovery</button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {topCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  to={card.link}
                  className="group relative overflow-hidden rounded-[44px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">
                        {card.title}
                      </p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums transition-colors group-hover:text-rose-500">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-[24px] ${card.bgColor} transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                      <Icon className={`h-8 w-8 ${card.textColor}`} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-2 ${card.color} translate-y-full transition-transform group-hover:translate-y-0`} />
                </Link>
              );
            })}
          </div>

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
            {/* Plan Progress Flow */}
            <div className="rounded-[48px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                <Activity size={140} />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Dietary Pipeline</h2>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 relative z-10">
                {[
                  { label: "Payment Pending", value: stats?.plansPaymentPending ?? 0, color: "text-amber-500", key: "pending" },
                  { label: "Active Mode", value: stats?.plansActive ?? 0, color: "text-blue-600", key: "active" },
                  { label: "Accomplished", value: stats?.plansCompleted ?? 0, color: "text-emerald-500", key: "completed" },
                ].map(stat => (
                  <div key={stat.key} className="p-8 rounded-[40px] bg-slate-50 dark:bg-gray-800/50 text-center transition-all hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 leading-tight">{stat.label}</span>
                    <span className={`text-4xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultation Queue */}
            <div className="rounded-[48px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                <Video size={140} />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-3xl">
                    <Calendar className="h-6 w-6 text-rose-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Meeting Queue</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { label: "Awaiting Session", value: stats?.consultationsPending ?? 0, color: "text-rose-500", key: "pending" },
                  { label: "Successful Meetings", value: stats?.consultations ?? 0, color: "text-sky-500", key: "total" },
                ].map(stat => (
                  <div key={stat.key} className="p-8 rounded-[40px] bg-slate-50 dark:bg-gray-800/50 text-center transition-all hover:bg-rose-50/50 dark:hover:bg-rose-900/10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 leading-tight">{stat.label}</span>
                    <span className={`text-5xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module Grid Section */}
          <div className="space-y-20 pb-20">
            {["Medical", "Dietary", "Shopping", "Account"].map((category) => {
              const topPaths = topCards.map(c => c.link);
              const items = patientMenus.filter(m => m.category === category && !topPaths.includes(m.path));
              if (items.length === 0) return null;
              return (
                <section key={category} className="space-y-10">
                  <div className="flex items-center gap-4 ml-2">
                    <div className={`h-10 w-2 rounded-full ${category === 'Medical' ? 'bg-blue-600' :
                      category === 'Dietary' ? 'bg-emerald-500' :
                        category === 'Shopping' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.5em] italic">
                      {category === 'Medical' ? 'Care Domain' : category === 'Dietary' ? 'Dietary Engine' : category === 'Shopping' ? 'Wellness Market' : 'Account Hub'}
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
                          <div className="relative h-full overflow-hidden rounded-[54px] border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-10 shadow-sm group-hover:shadow-2xl group-hover:border-rose-500/40 transition-all backdrop-blur-xl">
                            <div className="absolute -right-8 -top-8 opacity-[0.02] group-hover:opacity-[0.08] transition-all rotate-12 group-hover:rotate-0 duration-700">
                              <Icon size={180} />
                            </div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                              <div className={`p-5 rounded-[28px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                item.color === 'sky' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' :
                                  item.color === 'violet' ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' :
                                    item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                      item.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                        item.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                          item.color === 'teal' ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' :
                                            item.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                              item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                <Icon size={28} strokeWidth={2.5} />
                              </div>
                            </div>

                            <div className="relative z-10">
                              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">
                                {item.label}
                              </h2>
                              {value !== null ? (
                                <div className="flex items-baseline gap-3">
                                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-rose-500 tabular-nums">
                                    {value}
                                  </p>
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-50">Units</span>
                                </div>
                              ) : (
                                <p className="text-xl font-black text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors uppercase tracking-widest leading-none">Access</p>
                              )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                              <span className="text-[11px] font-black uppercase tracking-widest text-rose-500">Open Module</span>
                              <ChevronRight size={18} className="text-rose-500" />
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
