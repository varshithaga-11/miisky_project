import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  HelpCircle,
  MapPin,
  ShieldCheck,
  UserCog,
  Users,
  UtensilsCrossed,
  LayoutDashboard,
  TrendingUp,
  Activity,
  Layers,
  Settings,
  Package,
  LucideIcon,
} from "lucide-react";
import { AdminDashboardStats, getAdminDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  statKey: keyof AdminDashboardStats | null;
  color: string;
  category: "Care" | "Food" | "Composition" | "Logistics" | "System";
};

const adminMenus: DashboardMenuItem[] = [
  // Care Management
  { label: "Users", path: "/admin/usermanagement", icon: UserCog, statKey: "users", color: "blue", category: "Care" },
  { label: "Patients", path: "/admin/patients-overview", icon: Users, statKey: "patients", color: "indigo", category: "Care" },
  { label: "Nutritionists", path: "/admin/nutrition-information", icon: Users, statKey: "nutritionists", color: "violet", category: "Care" },
  { label: "Allotments", path: "/admin/user-nutrition-mapping", icon: ClipboardList, statKey: "allottedPatients", color: "rose", category: "Care" },
  { label: "Verification", path: "/admin/patient-payment-verification", icon: ShieldCheck, statKey: "verifications", color: "emerald", category: "Care" },

  // Food Management
  { label: "Micro Kitchens", path: "/admin/micro-kitchen-information", icon: UtensilsCrossed, statKey: "microKitchens", color: "amber", category: "Food" },
  { label: "Meal Types", path: "/admin/meal-type", icon: Layers, statKey: "mealTypes", color: "orange", category: "Food" },
  { label: "Cuisine Types", path: "/admin/cuisine-type", icon: Layers, statKey: "cuisineTypes", color: "orange", category: "Food" },
  { label: "Packaging", path: "/admin/packaging-material", icon: Package, statKey: "packaging", color: "slate", category: "Food" },
  { label: "Recipes", path: "/admin/recipe-creator", icon: ClipboardList, statKey: "recipes", color: "teal", category: "Food" },

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
  { label: "Diet Plans", path: "/admin/diet-plan", icon: ClipboardList, statKey: "dietPlans", color: "indigo", category: "System" },
  { label: "Patents", path: "/master/patent", icon: ShieldCheck, statKey: "patents", color: "slate", category: "System" },
];

export default function AdminSideDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalActions = stats ? Object.values(stats).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] p-6 lg:p-10 animate-in fade-in duration-700">
      {/* Premium Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                Miisky <span className="text-blue-600">Admin</span>
              </h1>
              <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed text-sm">
            Command Center: Orchestrating healthcare logistics, professional networks, and platform integrity in real-time. Navigate through core system modules below.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-white/[0.03] p-2 rounded-[24px] border border-slate-200/60 dark:border-white/5 shadow-sm backdrop-blur-xl">
          <div className="px-8 py-3 rounded-[20px] bg-slate-900 dark:bg-blue-600 text-white shadow-xl shadow-blue-500/10">
            <span className="text-[10px] font-black uppercase tracking-widest block opacity-70 mb-0.5">Total Records</span>
            <span className="text-2xl font-black tabular-nums tracking-tighter">{loading ? "—" : totalActions.toLocaleString()}</span>
          </div>
          <div className="px-6 py-3 hidden sm:block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Network Status</span>
            <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold antialiased">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Categories Content */}
      <div className="space-y-16">
        {["Care", "Food", "Composition", "Logistics", "System"].map((cat) => {
          const items = adminMenus.filter(m => m.category === cat);
          return (
            <section key={cat} className="space-y-8">
              <div className="flex items-center gap-4 ml-1">
                <div className={`h-8 w-1.5 rounded-full ${cat === 'Care' ? 'bg-blue-600' :
                  cat === 'Food' ? 'bg-amber-500' :
                    cat === 'Composition' ? 'bg-sky-500' :
                      cat === 'Logistics' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.4em] italic">
                  {cat} <span className="text-slate-400 font-medium">Nodes</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const value = loading ? "..." : (item.statKey ? (stats?.[item.statKey] ?? 0) : null);

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="group relative flex flex-col text-left transition-all duration-500 hover:-translate-y-2"
                    >
                      <div className="relative h-full overflow-hidden rounded-[40px] border border-slate-200/80 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-8 shadow-sm group-hover:shadow-2xl group-hover:border-blue-500/40 transition-all backdrop-blur-md">
                        {/* Interactive Background Pattern */}
                        <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-all rotate-12 group-hover:rotate-0 duration-700">
                          <Icon className="w-40 h-40" />
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className={`p-4 rounded-[22px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                              item.color === 'violet' ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' :
                                item.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                  item.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                    item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                      item.color === 'teal' ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' :
                                        item.color === 'cyan' ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400' :
                                          item.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                            item.color === 'sky' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' :
                                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                            <Icon size={26} strokeWidth={2.2} />
                          </div>
                        </div>

                        <div className="relative z-10">
                          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 italic">
                            {item.label}
                          </h2>
                          {value !== null ? (
                            <div className="flex items-baseline gap-2">
                              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-blue-600 tabular-nums">
                                {value}
                              </p>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">Open Module</p>
                            </div>
                          )}
                        </div>

                        {/* Hover Decoration */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">View Details</span>
                          <Activity size={16} className="text-blue-500 animate-pulse" />
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
    </div>
  );
}
