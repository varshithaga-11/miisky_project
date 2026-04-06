import React, { useEffect, useState } from "react";
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Package, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  History
} from "lucide-react";
import { getMyAssignments, updateDeliveryStatus, DeliveryAssignment } from "./api";

const DeliveryAssignments: React.FC = () => {
    const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const data = await getMyAssignments();
            setAssignments(data);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateDeliveryStatus(id, status);
            fetchAssignments();
        } catch (error) {
            alert("Update failed. Please check your connection.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 animate-pulse">Syncing Logistics...</p>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10">
            {/* Aesthetic Header */}
            <header className="relative p-10 overflow-hidden bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all duration-700 group-hover:bg-indigo-500/10"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-widest mb-6 uppercase">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                            Live Logistics Terminal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                            Delivery <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Manifest</span>
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-xl">
                            Manage your daily clinical meal deliveries with precision. Track, update, and confirm every life-improving package.
                        </p>
                    </div>
                    <div className="flex gap-4">
                         <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 transform hover:scale-105 transition-transform duration-500">
                            <Truck className="w-8 h-8 mb-4" />
                            <p className="text-4xl font-black">{assignments.filter(a => a.status !== 'delivered').length}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-indigo-100">Pending Tasks</p>
                         </div>
                         <div className="hidden lg:block p-8 rounded-[2.5rem] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 transform hover:scale-105 transition-transform duration-500">
                            <CheckCircle2 className="w-8 h-8 mb-4" />
                            <p className="text-4xl font-black">{assignments.filter(a => a.status === 'delivered').length}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-emerald-100">Completed Today</p>
                         </div>
                    </div>
                </div>
            </header>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Assignments Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Current Queue
                        </h2>
                    </div>

                    {assignments.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 text-center">
                            <div className="bg-gray-50 dark:bg-gray-900/50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Zero Active Tasks</h3>
                            <p className="text-gray-500 text-sm mt-2">Check back later or contact your supervisor for new zone assignments.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {assignments.map((task) => (
                                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Status Sidebar */}
                                        <div className={`md:w-56 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-50 dark:border-gray-700/50 ${
                                            task.status === 'delivered' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-gray-50/50 dark:bg-gray-900/30'
                                        }`}>
                                            <div>
                                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm mb-6 ${
                                                    task.status === 'delivered' 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                    {task.status.replace('_', ' ')}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-xl mb-1">
                                                    <Clock className="w-5 h-5 text-indigo-500" />
                                                    {task.user_meal_details?.meal_type_details.name}
                                                </div>
                                                <p className="text-xs font-bold text-gray-400">{task.scheduled_date}</p>
                                            </div>
                                            
                                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kitchen</p>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{task.user_meal_details?.micro_kitchen_details.brand_name}</p>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-grow p-10 space-y-8">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                                        {task.user_meal_details?.user_details.first_name} {task.user_meal_details?.user_details.last_name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <a href={`tel:${task.user_meal_details?.user_details.mobile}`} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                                                            <Phone className="w-4 h-4" />
                                                            {task.user_meal_details?.user_details.mobile}
                                                        </a>
                                                    </div>
                                                </div>
                                                <button className="hidden sm:flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-indigo-500 transition-colors">
                                                    Task ID: #LGT-{task.id} <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="flex items-start gap-5 bg-gray-50/50 dark:bg-gray-700/20 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700/50">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-6 h-6 text-rose-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">Patient Address</p>
                                                    <p className="text-gray-900 dark:text-white font-medium text-lg leading-relaxed">
                                                        {task.user_meal_details?.user_details.address}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex flex-wrap items-center gap-3 pt-4">
                                                {task.status === 'assigned' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(task.id, 'picked_up')}
                                                        className="py-4 px-8 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black text-xs uppercase tracking-[0.15em] transition-all duration-500 shadow-xl shadow-indigo-600/20 flex items-center gap-3 group/btn"
                                                    >
                                                        <Package className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> Confirm Pickup
                                                    </button>
                                                )}
                                                {task.status === 'picked_up' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(task.id, 'in_transit')}
                                                        className="py-4 px-8 rounded-2xl bg-amber-500 hover:bg-black text-white font-black text-xs uppercase tracking-[0.15em] transition-all duration-500 shadow-xl shadow-amber-500/20 flex items-center gap-3 group/btn"
                                                    >
                                                        <Truck className="w-5 h-5 animate-pulse" /> Start Transit
                                                    </button>
                                                )}
                                                {(task.status === 'in_transit' || task.status === 'picked_up') && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(task.id, 'delivered')}
                                                        className="py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-black text-xs uppercase tracking-[0.15em] transition-all duration-500 shadow-xl shadow-emerald-600/20 flex items-center gap-3 group/btn"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" /> Mark Delivered
                                                    </button>
                                                )}
                                                
                                                {task.status !== 'delivered' && task.status !== 'failed' && (
                                                    <button className="py-4 px-6 rounded-2xl bg-white dark:bg-gray-800 text-rose-500 border border-rose-100 dark:border-rose-900/50 font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" /> Issue
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Performance / Stats Column */}
                <div className="space-y-8">
                     <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-500" />
                            Performance Graph
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'On Time Rate', val: '98%', color: 'bg-emerald-500' },
                                { label: 'Success Rate', val: '100%', color: 'bg-indigo-600' },
                                { label: 'Avg Feedback', val: '4.9/5', color: 'bg-amber-500' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
                                        <span>{stat.label}</span>
                                        <span>{stat.val}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: stat.val.includes('/') ? '95%' : stat.val }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>

                     <div className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold mb-4">Precision Logistics</h4>
                            <p className="text-indigo-200 text-sm leading-relaxed mb-6 font-light">
                                Your accuracy directly affects patient health. Ensure all status updates are real-time for clinical monitoring.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <TrendingUp className="w-5 h-5 text-indigo-300" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.15em]">System Status: Optimal</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryAssignments;
