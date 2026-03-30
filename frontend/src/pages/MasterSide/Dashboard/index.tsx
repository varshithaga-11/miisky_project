import React, { useState, useEffect } from "react";
import { 
  FiArrowUpRight, 
  FiUsers, 
  FiFileText, 
  FiMessageSquare, 
  FiGrid, 
  FiBriefcase, 
  FiActivity,
  FiZap,
  FiAward
} from "react-icons/fi";
import { getDashboardStats, DashboardStats } from "./dashboardapi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MasterDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
        toast.error("Telemetry link interrupted");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-600 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mt-6">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Operational Banners", 
      value: stats?.hero_banners || 0, 
      icon: <FiZap />, 
      color: "blue",
      detail: "Active Entry Points",
      path: "/master/herobanner"
    },
    { 
      label: "Intellectual Property", 
      value: stats?.patents || 0, 
      icon: <FiAward />, 
      color: "purple",
      detail: "Global Patents Filed",
      path: "/master/patent"
    },
    { 
      label: "Pulse Community", 
      value: stats?.blog_posts || 0, 
      icon: <FiFileText />, 
      color: "emerald",
      detail: "Articles Published",
      path: "/master/blogpost"
    },
    { 
      label: "Pending Response", 
      value: stats?.blog_comments.pending || 0, 
      icon: <FiMessageSquare />, 
      color: "amber",
      detail: "User Feedback Loop",
      path: "/master/blogcomment"
    },
    { 
      label: "Device Matrix", 
      value: stats?.medical_devices || 0, 
      icon: <FiActivity />, 
      color: "indigo",
      detail: "Medical Units Registered",
      path: "/master/medicaldevice"
    },
    { 
      label: "Human Capital", 
      value: stats?.team_members || 0, 
      icon: <FiUsers />, 
      color: "rose",
      detail: "Validated Experts",
      path: "/master/teammember"
    },
    { 
      label: "Visual Repository", 
      value: stats?.gallery_items || 0, 
      icon: <FiGrid />, 
      color: "cyan",
      detail: "Multimedia Assets",
      path: "/master/galleryitem"
    },
    { 
      label: "Talent Pipeline", 
      value: stats?.job_applications.total || 0, 
      icon: <FiBriefcase />, 
      color: "slate",
      detail: "Applications Received",
      path: "/master/jobapplication"
    },
  ];

  return (
    <div className="p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end text-left">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-gray-900 dark:text-white leading-none">
              Command <span className="text-blue-600">Center</span>
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 leading-none">Miisky SVASTH High-Altitude Surveillance Hub</p>
          </div>
          <div className="hidden md:block">
            <div className="flex gap-2 items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/[0.05] shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">System_Online_v2.0</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(card.path)}
              className="group relative bg-white dark:bg-white/[0.03] rounded-2xl p-6 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/[0.05] transition-all hover:-translate-y-2 hover:shadow-blue-200/50 dark:hover:bg-blue-600/5 overflow-hidden cursor-pointer"
            >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-[0.03] group-hover:scale-150 transition-transform duration-700 text-${card.color}-600`}>
                    {card.icon}
                </div>
                <div className="flex flex-col h-full justify-between relative z-10 text-left">
                    <div>
                        <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 text-${card.color}-600 dark:bg-${card.color}-900/20 dark:text-${card.color}-400 flex items-center justify-center mb-4 transition-all group-hover:bg-blue-600 group-hover:text-white`}>
                            {React.cloneElement(card.icon as React.ReactElement, { size: 18 } as any)}
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-2">{card.label}</h3>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors group-hover:text-blue-600">{card.value}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.05] flex items-center justify-between">
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">{card.detail}</span>
                        <FiArrowUpRight className="text-gray-300 dark:text-gray-600 group-hover:text-blue-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/[0.05] p-8 text-left">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest italic border-l-4 border-blue-600 dark:border-blue-500 pl-4 leading-none">Operational Priorities</h3>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded uppercase tracking-tighter">Live Monitor</span>
            </div>
            <div className="space-y-6">
               <div 
                onClick={() => navigate("/master/blogcomment")}
                className="flex items-center gap-6 p-4 rounded-xl border border-gray-50 dark:border-white/[0.03] hover:border-amber-100 dark:hover:border-amber-900/30 hover:bg-amber-50/10 transition-all group cursor-pointer"
               >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <FiMessageSquare size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Community Feedback</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1 tracking-tighter">
                        {stats?.blog_comments.pending} comments awaiting administrative verification
                    </p>
                  </div>
                  <FiArrowUpRight className="text-gray-200 dark:text-gray-700 group-hover:text-amber-600 transition-all" />
               </div>

               <div 
                onClick={() => navigate("/master/jobapplication")}
                className="flex items-center gap-6 p-4 rounded-xl border border-gray-50 dark:border-white/[0.03] hover:border-rose-100 dark:hover:border-rose-900/30 hover:bg-rose-50/10 transition-all group cursor-pointer"
               >
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <FiBriefcase size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Talent Acquisition</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1 tracking-tighter">
                        {stats?.job_applications.pending} high-priority applications require triage
                    </p>
                  </div>
                  <FiArrowUpRight className="text-gray-200 dark:text-gray-700 group-hover:text-rose-600 transition-all" />
               </div>

                <div 
                  onClick={() => navigate("/master/websitereport")}
                  className="flex items-center gap-6 p-4 rounded-xl border border-gray-50 dark:border-white/[0.03] hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:bg-indigo-50/10 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FiFileText size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">SVASTH Intelligence</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1 tracking-tighter">
                        {stats?.website_reports.pending} system reports in generation queue
                    </p>
                  </div>
                  <FiArrowUpRight className="text-gray-200 dark:text-gray-700 group-hover:text-indigo-600 transition-all" />
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/[0.05] p-8 flex flex-col justify-center items-center text-center">
             <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 border-4 border-white dark:border-gray-800 shadow-lg">
                <FiZap size={32} />
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic mb-2">Miisky <span className="text-blue-600">Core</span> Engine</h3>
             <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] max-w-[280px]">
                Your administrative control over the digital infrastructure is fully operational. Sync efficiency is currently at 100%.
             </p>
             <div className="grid grid-cols-3 gap-8 mt-10 w-full">
                <div className="cursor-pointer group" onClick={() => navigate("/master/partner")}>
                   <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{stats?.partners || 0}</p>
                   <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Partners</p>
                </div>
                <div className="border-x border-gray-50 dark:border-white/[0.05] cursor-pointer group" onClick={() => navigate("/master/medicaldevice")}>
                   <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{stats?.medical_devices || 0}</p>
                   <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Units</p>
                </div>
                <div className="cursor-pointer group" onClick={() => navigate("/master/blogpost")}>
                   <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{stats?.blog_posts || 0}</p>
                   <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Posts</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
