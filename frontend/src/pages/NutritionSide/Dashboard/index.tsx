import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Video,
  FileText,
  Layers,
  Sparkles,
  CheckCircle,
  Briefcase,
  HelpCircle,
  UserCog,
  Activity,
  RotateCw,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getNutritionDashboardStats, NutritionDashboardStats } from "./api";

type DashboardMenuItem = {
  label: string;
  path: string;
  icon: any;
  statKey?: keyof NutritionDashboardStats;
  color: string;
  category: "Patient Care" | "Dietary Tools" | "Management";
};

const nutritionMenus: DashboardMenuItem[] = [
  // Patient Care
  { label: "Allotted Patients", path: "/nutrition/allotted-patients", icon: Users, statKey: "allottedPatients", color: "blue", category: "Patient Care" },
  { label: "Consultation Request", path: "/nutrition/meeting-requests", icon: Video, statKey: "meetingRequests", color: "rose", category: "Patient Care" },
  { label: "Patient Documents", path: "/nutrition/uploaded-documents", icon: FileText, statKey: "patientDocuments", color: "sky", category: "Patient Care" },

  // Dietary Tools
  { label: "Meal Optimizer", path: "/nutrition/set-meals", icon: Layers, statKey: "mealOptimizer", color: "emerald", category: "Dietary Tools" },
  { label: "Suggest Plan", path: "/nutrition/suggest-plan", icon: Sparkles, statKey: "suggestedPlans", color: "amber", category: "Dietary Tools" },
  { label: "Approved Plans", path: "/nutrition/approved-plans", icon: CheckCircle, statKey: "approvedPlans", color: "teal", category: "Dietary Tools" },
  { label: "Micro Kitchens", path: "/nutrition/micro-kitchens", icon: Briefcase, statKey: "microKitchens", color: "indigo", category: "Dietary Tools" },

  // Management
  { label: "Questionnaire", path: "/nutrition/questionnaire", icon: FileText, statKey: "questionnaire", color: "violet", category: "Management" },
  { label: "Support Tickets", path: "/nutrition/support-tickets", icon: HelpCircle, statKey: "supportTickets", color: "orange", category: "Management" },
  { label: "Profile", path: "/profile-info", icon: UserCog, color: "slate", category: "Management" },
];

export default function NutritionDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<NutritionDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNutritionDashboardStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load clinical data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalInteractions = stats ? (stats.allottedPatients || 0) + (stats.meetingRequests || 0) : 0;

  const summaryCards = [
    { title: "Managed Patients", value: stats?.allottedPatients ?? 0, icon: Users, color: "bg-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", link: "/nutrition/allotted-patients" },
    { title: "Meeting Requests", value: stats?.meetingRequests ?? 0, icon: Video, color: "bg-rose-600", textColor: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-900/20", link: "/nutrition/meeting-requests" },
    { title: "Optimizer Usage", value: stats?.mealOptimizer ?? 0, icon: Layers, color: "bg-emerald-600", textColor: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", link: "/nutrition/set-meals" },
    { title: "Diet Plans", value: stats?.suggestedPlans ?? 0, icon: Sparkles, color: "bg-amber-600", textColor: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-900/20", link: "/nutrition/suggest-plan" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 px-6 lg:px-10">

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="size-20 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Optimizing Workspace...</span>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto p-10 rounded-[40px] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 text-center">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <button onClick={fetchStats} className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Retry Load</button>
        </div>
      ) : (
        <>
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {summaryCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  to={card.link}
                  className="group relative overflow-hidden rounded-[40px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">
                        {card.title}
                      </p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums transition-colors group-hover:text-blue-600">
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
            {/* Plan Success Status */}
            <div className="rounded-[44px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                <Sparkles size={120} />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-3xl">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Dietary Pipeline</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { label: "Plans Suggested", value: stats?.plansSuggested ?? 0, color: "text-amber-500", key: "suggested" },
                  { label: "Approved by Users", value: stats?.plansApproved ?? 0, color: "text-emerald-500", key: "approved" },
                ].map(stat => (
                  <div key={stat.key} className="p-8 rounded-[36px] bg-slate-50 dark:bg-gray-800/50 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-200">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">{stat.label}</span>
                    <span className={`text-5xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultation Flow */}
            <div className="rounded-[44px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                <Video size={120} />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-3xl">
                    <Activity className="h-6 w-6 text-rose-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Consultation Flow</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { label: "Pending Meetings", value: stats?.meetingsPending ?? 0, color: "text-rose-500", key: "pending" },
                  { label: "Resolved Sessions", value: stats?.meetingsResolved ?? 0, color: "text-sky-500", key: "resolved" },
                ].map(stat => (
                  <div key={stat.key} className="p-8 rounded-[36px] bg-slate-50 dark:bg-gray-800/50 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10 border border-transparent hover:border-rose-200">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">{stat.label}</span>
                    <span className={`text-5xl font-black tabular-nums tracking-tighter ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Modules Hub */}
          <div className="space-y-20 pb-20">
            {["Patient Care", "Dietary Tools", "Management"].map((category) => {
              const items = nutritionMenus.filter(m => m.category === category);
              return (
                <section key={category} className="space-y-10">
                  <div className="flex items-center gap-4 ml-2">
                    <div className={`h-10 w-2 rounded-full ${category === 'Patient Care' ? 'bg-blue-600' :
                      category === 'Dietary Tools' ? 'bg-emerald-500' : 'bg-violet-600'
                      }`} />
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.5em] italic">
                      {category} <span className="text-slate-400 font-medium tracking-normal opacity-60">Domain</span>
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
                          <div className="relative h-full overflow-hidden rounded-[50px] border border-slate-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] p-10 shadow-sm group-hover:shadow-2xl group-hover:border-blue-500/40 transition-all backdrop-blur-xl">
                            <div className="absolute -right-8 -top-8 opacity-[0.02] group-hover:opacity-[0.08] transition-all rotate-12 group-hover:rotate-0 duration-700">
                              <Icon size={180} />
                            </div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                              <div className={`p-5 rounded-[28px] shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                  item.color === 'sky' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' :
                                    item.color === 'violet' ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' :
                                      item.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                        item.color === 'teal' ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' :
                                          item.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                            item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
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
                                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-blue-600 tabular-nums">
                                    {value}
                                  </p>
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-50">Units</span>
                                </div>
                              ) : (
                                <p className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none">Access</p>
                              )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Manage Hub</span>
                              <ChevronRight size={18} className="text-blue-500" />
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
