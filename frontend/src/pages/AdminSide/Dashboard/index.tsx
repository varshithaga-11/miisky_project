import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserCog,
  ShieldCheck,
  UtensilsCrossed,
  HelpCircle,
  Briefcase,
  Package,
  Layers,
  Activity,
  RotateCw,
  ChevronRight,
  TrendingUp,
  FileText,
  MapPin,
} from "lucide-react";
import { getAdminDashboardStats, AdminDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: any;
  statKey?: keyof AdminDashboardStats;
  color: string;
  category: "Care" | "Food" | "Composition" | "Logistics" | "System";
};

const adminMenus: DashboardMenuItem[] = [
  // Care Management
  { label: "Users", path: "/admin/usermanagement", icon: UserCog, statKey: "users", color: "blue", category: "Care" },
  { label: "Patients", path: "/admin/patients-overview", icon: Users, statKey: "patients", color: "indigo", category: "Care" },
  { label: "Nutritionists", path: "/admin/nutrition-information", icon: Users, statKey: "nutritionists", color: "violet", category: "Care" },
  { label: "Allotments", path: "/admin/user-nutrition-mapping", icon: Briefcase, statKey: "allottedPatients", color: "rose", category: "Care" },
  { label: "Verification", path: "/admin/patient-payment-verification", icon: ShieldCheck, statKey: "verifications", color: "emerald", category: "Care" },

  // Food Management
  { label: "Micro Kitchens", path: "/admin/micro-kitchen-information", icon: UtensilsCrossed, statKey: "microKitchens", color: "amber", category: "Food" },
  { label: "Meal Types", path: "/admin/meal-type", icon: Layers, statKey: "mealTypes", color: "orange", category: "Food" },
  { label: "Cuisine Types", path: "/admin/cuisine-type", icon: Layers, statKey: "cuisineTypes", color: "orange", category: "Food" },
  { label: "Packaging", path: "/admin/packaging-material", icon: Package, statKey: "packaging", color: "slate", category: "Food" },
  { label: "Recipes", path: "/admin/recipe-creator", icon: FileText, statKey: "recipes", color: "teal", category: "Food" },

  // Food Composition
  { label: "Food Groups", path: "/admin/food-group", icon: Layers, statKey: "foodGroups", color: "sky", category: "Composition" },
  { label: "Food Names", path: "/admin/food-name", icon: FileText, statKey: "foodNames", color: "sky", category: "Composition" },
  { label: "Nutrients", path: "/admin/food-proximate", icon: Activity, statKey: "nutrients", color: "sky", category: "Composition" },

  // Logistics
  { label: "Countries", path: "/admin/country", icon: MapPin, statKey: "countries", color: "emerald", category: "Logistics" },
  { label: "States", path: "/admin/state", icon: MapPin, statKey: "states", color: "teal", category: "Logistics" },
  { label: "Cities", path: "/admin/city", icon: MapPin, statKey: "cities", color: "cyan", category: "Logistics" },

  // System Tools
  { label: "Support", path: "/admin/support-ticket-requests", icon: HelpCircle, statKey: "supportTickets", color: "orange", category: "System" },
  { label: "Health Params", path: "/admin/health-parameter", icon: FileText, statKey: "healthParameters", color: "sky", category: "System" },
  { label: "Diet Plans", path: "/admin/diet-plan", icon: Briefcase, statKey: "dietPlans", color: "indigo", category: "System" },
  { label: "Patents", path: "/master/patent", icon: ShieldCheck, statKey: "patents", color: "slate", category: "System" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load platform statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const topStatCards = [
    { title: "Total Users", value: stats?.users ?? 0, icon: Users, color: "bg-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", link: "/admin/usermanagement" },
    { title: "Active Patients", value: stats?.patients ?? 0, icon: Users, color: "bg-indigo-600", textColor: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", link: "/admin/patients-overview" },
    { title: "Nutritionists", value: stats?.nutritionists ?? 0, icon: UserCog, color: "bg-violet-600", textColor: "text-violet-600", bgColor: "bg-violet-50 dark:bg-violet-900/20", link: "/admin/nutrition-information" },
    { title: "Kitchen Units", value: stats?.microKitchens ?? 0, icon: UtensilsCrossed, color: "bg-amber-600", textColor: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-900/20", link: "/admin/micro-kitchen-information" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">
            Miisky <span className="text-blue-600">Command Center</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">
            Comprehensive platform oversight and resource management
          </p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative size-16">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Hydrating Dashboard...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-red-500" />
             <p className="text-red-800 dark:text-red-400 font-bold">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Summary Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {topStatCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link 
                  key={idx} 
                  to={card.link}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                        {card.title}
                      </p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums transition-colors group-hover:text-blue-600">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-2xl ${card.bgColor} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className={`h-6 w-6 ${card.textColor}`} />
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${card.color} translate-y-full transition-transform group-hover:translate-y-0`} />
                </Link>
              );
            })}
          </div>

          {/* Activity & Health Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
             {/* Care Operations Status */}
             <div className="rounded-[40px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                         <Activity className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Diet Plan Activity</h2>
                   </div>
                   <Link to="/admin/patient-payment-verification" className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">Verify Payments</Link>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                   {[
                      { label: "Payment Pending", value: stats?.plansPaymentPending ?? 0, color: "text-amber-500", key: "pending" },
                      { label: "Active Plans", value: stats?.plansActive ?? 0, color: "text-blue-600", key: "active" },
                      { label: "Completed", value: stats?.plansCompleted ?? 0, color: "text-emerald-500", key: "completed" },
                   ].map(stat => (
                      <div key={stat.key} className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 text-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">{stat.label}</span>
                         <span className={`text-3xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Support Traffic */}
             <div className="rounded-[40px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                         <HelpCircle className="h-6 w-6 text-orange-600" />
                      </div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Support Traffic</h2>
                   </div>
                   <Link to="/admin/support-ticket-requests" className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">Manage Tickets</Link>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                   {[
                      { label: "Open Tickets", value: stats?.ticketsOpen ?? 0, color: "text-rose-500", key: "open" },
                      { label: "In Progress", value: stats?.ticketsInProgress ?? 0, color: "text-amber-500", key: "progress" },
                      { label: "Resolved", value: stats?.ticketsResolved ?? 0, color: "text-emerald-500", key: "resolved" },
                   ].map(stat => (
                      <div key={stat.key} className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 text-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">{stat.label}</span>
                         <span className={`text-3xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Management Nodes Section */}
          <div className="space-y-16 pb-20">
            {["Care", "Food", "Composition", "Logistics", "System"].map((category) => {
              const items = adminMenus.filter(m => m.category === category);
              return (
                <section key={category} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4">
                    <div className={`h-8 w-1.5 rounded-full ${
                      category === 'Care' ? 'bg-blue-600' : 
                      category === 'Food' ? 'bg-amber-500' : 
                      category === 'Composition' ? 'bg-sky-500' : 
                      category === 'Logistics' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-300 uppercase tracking-[0.4em] italic">
                      {category} <span className="text-gray-400 font-medium">Domain</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const value = item.statKey ? (loading ? "..." : (stats?.[item.statKey] ?? 0)) : null;
                      
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="group relative flex flex-col text-left transition-all duration-500 hover:-translate-y-2"
                        >
                          <div className="relative h-full overflow-hidden rounded-[44px] border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-8 shadow-sm group-hover:shadow-2xl group-hover:border-blue-500/40 transition-all backdrop-blur-md">
                            {/* Icon Background Decoration */}
                            <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-all rotate-12 group-hover:rotate-0 duration-700">
                               <Icon className="w-40 h-40" />
                            </div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                              <div className={`p-4 rounded-[24px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${
                                item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                item.color === 'violet' ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' :
                                item.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                item.color === 'teal' ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' :
                                item.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                item.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                item.color === 'sky' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' :
                                item.color === 'cyan' ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                <Icon size={24} strokeWidth={2.5} />
                              </div>
                              
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/40">
                                 <TrendingUp size={12} className="text-blue-500" />
                                 <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Live</span>
                              </div>
                            </div>

                            <div className="relative z-10">
                              <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 italic">
                                {item.label}
                              </h2>
                              {value !== null ? (
                                <div className="flex items-baseline gap-2">
                                  <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter transition-all group-hover:text-blue-600 tabular-nums">
                                    {value}
                                  </p>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Nodes</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                   <p className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none italic">Manage</p>
                                </div>
                              )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Expand Module</span>
                               <ChevronRight size={16} className="text-blue-500" />
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
