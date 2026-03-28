import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  UserCog,
  MapPin,
  Sparkles,
  RotateCw,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { getNonPatientDashboardStats, NonPatientDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: any;
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
  { label: "Support", path: "/non-patient/support-tickets", icon: HelpCircle, statKey: "supportTickets", color: "orange", category: "Account" },
];

export default function NonPatientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<NonPatientDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNonPatientDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load your fresh metrics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalDiscovery = stats ? (stats.foods || 0) + (stats.microKitchens || 0) : 0;

  const topCards = [
    { title: "Fresh Foods", value: stats?.foods ?? 0, icon: ShoppingBag, color: "bg-emerald-600", textColor: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", link: "/patient/foods" },
    { title: "Micro Kitchens", value: stats?.microKitchens ?? 0, icon: MapPin, color: "bg-indigo-600", textColor: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", link: "/patient/discover-kitchens" },
    { title: "Cart Items", value: stats?.cartItems ?? 0, icon: ShoppingCart, color: "bg-rose-600", textColor: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-900/20", link: "/patient/cart" },
    { title: "My Bookings", value: stats?.bookings ?? 0, icon: Package, color: "bg-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", link: "/patient/orders" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 lg:px-10 py-10">

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="size-20 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Preparing Your Menu...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 p-8 rounded-[40px] text-center max-w-xl mx-auto italic">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <button onClick={fetchStats} className="px-10 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Retry Discovery</button>
        </div>
      ) : (
        <>
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
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
                      <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums transition-colors group-hover:text-emerald-600">
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

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
            {/* Order History Pulse */}
            <div className="rounded-[44px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                <Package size={140} />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-3xl">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Order Activity</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { label: "Pending Orders", value: stats?.ordersPending ?? 0, color: "text-amber-500", key: "pending" },
                  { label: "Successfully Delivered", value: stats?.ordersCompleted ?? 0, color: "text-emerald-500", key: "completed" },
                ].map(stat => (
                  <div key={stat.key} className="p-10 rounded-[36px] bg-slate-50 dark:bg-gray-800/50 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-200">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">{stat.label}</span>
                    <span className={`text-5xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Tracking */}
            <div className="rounded-[44px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                <HelpCircle size={140} />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-3xl">
                    <HelpCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Account Support</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 relative z-10">
                <div className="p-10 rounded-[36px] bg-slate-50 dark:bg-gray-800/50 transition-all hover:bg-orange-50 dark:hover:bg-orange-900/10 border border-transparent hover:border-orange-200">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Total Tickets Raised</span>
                  <span className="text-5xl font-black tabular-nums tracking-tighter text-orange-600">{stats?.supportTickets ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Selection Modules */}
          <div className="space-y-16 pb-20">
            {["Discovery", "Orders", "Account"].map((cat) => {
              const items = nonPatientMenus.filter(m => m.category === cat);
              return (
                <section key={cat} className="space-y-8">
                  <div className="flex items-center gap-4 ml-2">
                    <div className={`h-10 w-2 rounded-full ${cat === 'Discovery' ? 'bg-emerald-500' :
                      cat === 'Orders' ? 'bg-blue-600' : 'bg-slate-400'
                      }`} />
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.4em] italic leading-none">
                      {cat} <span className="text-slate-400 font-medium">Domain</span>
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
                          <div className="relative h-full overflow-hidden rounded-[50px] border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-10 shadow-sm group-hover:shadow-2xl group-hover:border-emerald-500/40 transition-all backdrop-blur-xl">
                            <div className="absolute -right-8 -top-8 opacity-[0.02] group-hover:opacity-[0.08] transition-all rotate-12 group-hover:rotate-0 duration-700">
                              <Icon size={180} />
                            </div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                              <div className={`p-5 rounded-[28px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                  item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                    item.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                      item.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                <Icon size={28} strokeWidth={2.5} />
                              </div>
                            </div>

                            <div className="relative z-10">
                              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 italic">
                                {item.label}
                              </h2>
                              {value !== null ? (
                                <div className="flex items-baseline gap-3">
                                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-emerald-600 tabular-nums">
                                    {value}
                                  </p>
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-50">Units</span>
                                </div>
                              ) : (
                                <p className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-widest leading-none">Open</p>
                              )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Explore Module</span>
                              <ChevronRight size={18} className="text-emerald-600" />
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
