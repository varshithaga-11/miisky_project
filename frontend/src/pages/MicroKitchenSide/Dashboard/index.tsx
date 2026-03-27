import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  HelpCircle,
  Package,
  Truck,
  UserCog,
  Users,
  UtensilsCrossed,
  Calendar,
  Zap,
  Star,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import { getMicroKitchenDashboardStats, MicroKitchenDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
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

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getMicroKitchenDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalOrders = stats ? (stats.orders || 0) + (stats.dailyPrep || 0) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] p-6 lg:p-10 animate-in fade-in duration-700">
      {/* Premium Header */}
      <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-amber-500 rounded-3xl shadow-xl shadow-amber-500/20 rotate-3">
                <UtensilsCrossed className="text-white w-8 h-8" />
             </div>
             <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                 Kitchen <span className="text-amber-500">Ops</span>
               </h1>
               <div className="h-1.5 w-16 bg-amber-500 mt-2 rounded-full" />
             </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed text-sm">
            Command center for your micro-kitchen operations. Monitor production workflows, manage patient orders, and track sanitation compliance in real-time.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white dark:bg-white/[0.03] p-3 rounded-[32px] border border-slate-200/60 dark:border-white/5 shadow-sm backdrop-blur-xl">
           <div className="px-8 py-3 rounded-[24px] bg-slate-900 dark:bg-amber-500 text-white shadow-xl shadow-amber-500/10">
              <span className="text-[10px] font-black uppercase tracking-widest block opacity-70 mb-0.5">Total Load</span>
              <span className="text-2xl font-black tabular-nums tracking-tighter">{loading ? "—" : totalOrders.toLocaleString()}</span>
           </div>
           <div className="px-6 py-3 hidden sm:block border-l border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Efficiency Score</span>
              <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold antialiased">
                <Zap size={14} className="fill-emerald-500" />
                OPTIMIZED
              </span>
           </div>
        </div>
      </header>

      {/* Categories Content */}
      <div className="space-y-16">
        {["Logistics", "Patients", "Management"].map((cat) => {
          const items = microKitchenMenus.filter(m => m.category === cat);
          return (
            <section key={cat} className="space-y-8">
              <div className="flex items-center gap-4 ml-1">
                <div className={`h-8 w-1.5 rounded-full ${
                  cat === 'Logistics' ? 'bg-amber-500' : 
                  cat === 'Patients' ? 'bg-blue-600' : 'bg-slate-400'
                }`} />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.4em] italic">
                  {cat} <span className="text-slate-400 font-medium">Domain</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const value = item.statKey ? (loading ? "..." : (stats?.[item.statKey] ?? 0)) : null;
                  
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="group relative flex flex-col text-left transition-all duration-500 hover:-translate-y-2"
                    >
                      <div className="relative h-full overflow-hidden rounded-[44px] border border-slate-200/80 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-8 shadow-sm group-hover:shadow-2xl group-hover:border-amber-500/40 transition-all backdrop-blur-md">
                        {/* Interactive Background Pattern */}
                        <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-all rotate-12 group-hover:rotate-0 duration-700">
                           <Icon className="w-40 h-40" />
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className={`p-4 rounded-[24px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${
                            item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
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
                            <Icon size={28} strokeWidth={2.2} />
                          </div>
                          
                          {value !== null && typeof value === 'number' && value > 0 && (
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-800/40">
                               <TrendingUp size={12} className="text-amber-500" />
                               <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">Growth</span>
                             </div>
                          )}
                        </div>

                        <div className="relative z-10">
                          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 italic">
                            {item.label}
                          </h2>
                          {value !== null ? (
                            <div className="flex items-baseline gap-2">
                              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-amber-600 tabular-nums">
                                {value}
                              </p>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Records</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                               <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors uppercase tracking-widest leading-none">Access Tool</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Launch Module</span>
                           <Calendar size={16} className="text-amber-500" />
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

      <footer className="mt-24 p-10 rounded-[60px] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-center shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-tr from-amber-50/50 to-blue-50/50 dark:from-amber-950/20 dark:to-blue-950/20 opacity-40"></div>
         <div className="relative z-10 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Kitchen Health Status</h4>
            <div className="flex flex-wrap justify-center gap-12 mt-8">
               {[
                  { label: "Sync Status", value: "Realtime", color: "emerald" },
                  { label: "Oven Load", value: "Optimal", color: "blue" },
                  { label: "Last Inspection", value: "Passed", color: "emerald" }
               ].map((m, i) => (
                  <div key={i} className="space-y-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{m.label}</span>
                     <span className={`text-base font-black text-${m.color}-500 uppercase tracking-tighter antialiased`}>{m.value}</span>
                  </div>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
}
