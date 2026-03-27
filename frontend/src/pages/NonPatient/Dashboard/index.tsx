import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  UserCog,
  MapPin,
  Sparkles,
  TrendingUp,
  LucideIcon,
  ShoppingBag,
} from "lucide-react";
import { getNonPatientDashboardStats, NonPatientDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  statKey?: keyof NonPatientDashboardStats;
  color: string;
  category: "Discovery" | "Orders" | "Account";
};

const nonPatientMenus: DashboardMenuItem[] = [
  // Discovery
  { label: "Foods", path: "/patient/foods", icon: ShoppingBag, statKey: "foods", color: "emerald", category: "Discovery" },
  { label: "Micro Kitchens", path: "/patient/discover-kitchens", icon: MapPin, statKey: "microKitchens", color: "indigo", category: "Discovery" },
  
  // Orders
  { label: "My Cart", path: "/patient/cart", icon: ShoppingCart, statKey: "cartItems", color: "rose", category: "Orders" },
  { label: "My Bookings", path: "/patient/orders", icon: Package, statKey: "bookings", color: "blue", category: "Orders" },
  
  // Account
  { label: "Profile", path: "/profile-info", icon: UserCog, color: "slate", category: "Account" },
];

export default function NonPatientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<NonPatientDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getNonPatientDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalDiscovery = stats ? (stats.foods || 0) + (stats.microKitchens || 0) : 0;

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B0F1A] p-6 lg:p-10 animate-in fade-in duration-700">
      {/* Premium Header */}
      <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-500/20 rotate-3">
                <Sparkles className="text-white w-8 h-8 fill-white/10" />
             </div>
             <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                 Miisky <span className="text-emerald-600">Fresh</span>
               </h1>
               <div className="h-1.5 w-16 bg-emerald-600 mt-2 rounded-full" />
             </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed text-sm">
            Discover a world of healthy micro-kitchens and premium food options. Manage your bookings and explore fresh culinary experiences tailored for you.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white dark:bg-white/[0.03] p-3 rounded-[32px] border border-slate-200/60 dark:border-white/5 shadow-sm backdrop-blur-xl">
           <div className="px-8 py-3 rounded-[24px] bg-slate-900 dark:bg-emerald-600 text-white shadow-xl shadow-emerald-500/10">
              <span className="text-[10px] font-black uppercase tracking-widest block opacity-70 mb-0.5">Discovery Reach</span>
              <span className="text-2xl font-black tabular-nums tracking-tighter">{loading ? "—" : totalDiscovery.toLocaleString()}</span>
           </div>
           <div className="px-6 py-3 hidden sm:block border-l border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Availability</span>
              <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold antialiased">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE
              </span>
           </div>
        </div>
      </header>

      {/* Categories Content */}
      <div className="space-y-16">
        {["Discovery", "Orders", "Account"].map((cat) => {
          const items = nonPatientMenus.filter(m => m.category === cat);
          return (
            <section key={cat} className="space-y-8">
              <div className="flex items-center gap-4 ml-1">
                <div className={`h-8 w-1.5 rounded-full ${
                  cat === 'Discovery' ? 'bg-emerald-500' : 
                  cat === 'Orders' ? 'bg-blue-600' : 'bg-slate-400'
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
                      <div className="relative h-full overflow-hidden rounded-[44px] border border-slate-200/80 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-8 shadow-sm group-hover:shadow-2xl group-hover:border-emerald-500/40 transition-all backdrop-blur-md">
                        {/* Interactive Background Pattern */}
                        <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.1] transition-all rotate-12 group-hover:rotate-0 duration-700">
                           <Icon className="w-40 h-40" />
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className={`p-4 rounded-[24px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${
                            item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                            item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            item.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            <Icon size={28} strokeWidth={2.2} />
                          </div>
                          
                          {typeof value === 'number' && value > 0 && (
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/40">
                               <TrendingUp size={12} className="text-emerald-500" />
                               <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">New Hits</span>
                             </div>
                          )}
                        </div>

                        <div className="relative z-10">
                          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 italic">
                            {item.label}
                          </h2>
                          {value !== null ? (
                            <div className="flex items-baseline gap-2">
                              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-emerald-600 tabular-nums">
                                {value}
                              </p>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Items</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                               <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-widest leading-none">Access Tool</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">View Module</span>
                           <TrendingUp size={16} className="text-emerald-500" />
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
