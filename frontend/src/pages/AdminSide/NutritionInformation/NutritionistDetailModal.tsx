import React, { useEffect, useState } from "react";
import {
    FiXCircle, FiUser, FiUsers, FiFileText, FiCalendar, FiVideo, FiLoader, FiBriefcase
} from "react-icons/fi";
import {
    getAdminNutritionistDetails,
    getNutritionistPatientsNoPaginate,
    getNutritionistDietPlansNoPaginate,
    getNutritionistMealsNoPaginate,
    getNutritionistMeetingsNoPaginate
} from "./api";
import {
    DisplayNutritionistInfo,
    DisplayNutritionistPatients,
    DisplayNutritionistDietPlans,
    DisplayNutritionistMeals,
    DisplayNutritionistMeetings
} from "./NutritionistDataViews";

interface NutritionistDetailModalProps {
    nutritionistId: number;
    open: boolean;
    onClose: () => void;
}

type TabKey = "profile" | "patients" | "plans" | "meals" | "meetings";

export const NutritionistDetailModal: React.FC<NutritionistDetailModalProps> = ({ nutritionistId, open, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabKey>("profile");
    const [loading, setLoading] = useState(true);
    const [dossier, setDossier] = useState<any>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [meals, setMeals] = useState<any[]>([]);
    const [meetings, setMeetings] = useState<any[]>([]);

    useEffect(() => {
        if (open && nutritionistId) {
            setLoading(true);
            setActiveTab("profile");
            fetchCoreData();
        }
    }, [open, nutritionistId]);

    const fetchCoreData = async () => {
        try {
            const data = await getAdminNutritionistDetails(nutritionistId);
            setDossier(data);
            // Pre-fetch everything for smooth tab switching
            const [p, pl, m, me] = await Promise.all([
                getNutritionistPatientsNoPaginate(nutritionistId),
                getNutritionistDietPlansNoPaginate(nutritionistId),
                getNutritionistMealsNoPaginate(nutritionistId),
                getNutritionistMeetingsNoPaginate(nutritionistId)
            ]);
            setPatients(p);
            setPlans(pl);
            setMeals(m);
            setMeetings(me);
        } catch (error) {
            console.error("Failed to fetch nutritionist detail", error);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: "profile", label: "Profile", icon: <FiUser size={14} /> },
        { key: "patients", label: "Clients", icon: <FiUsers size={14} /> },
        { key: "plans", label: "Diet Plans", icon: <FiFileText size={14} /> },
        { key: "meals", label: "Meal Sets", icon: <FiCalendar size={14} /> },
        { key: "meetings", label: "Meetings", icon: <FiVideo size={14} /> },
    ];

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-950 rounded-[40px] w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-2xl relative border border-white/10 flex flex-col">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all z-20 group"
                >
                    <FiXCircle size={24} className="text-gray-400 group-hover:text-red-500 transform group-hover:rotate-90 transition-all duration-300" />
                </button>

                {/* Header Section */}
                <div className="px-8 pt-8 pb-4 shrink-0 bg-gray-50/50 dark:bg-white/[0.02] border-b dark:border-white/5">
                    {loading ? (
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="size-16 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-6 mr-10">
                            <div className="flex items-center gap-5">
                                <div className="size-16 rounded-[22px] bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-600/20 italic">
                                    {dossier?.first_name?.[0]}{dossier?.last_name?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                                        {dossier?.first_name} {dossier?.last_name}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30 italic">
                                            {dossier?.profile?.qualification || "General Dietitian"}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1">
                                            <FiBriefcase size={12} /> {dossier?.profile?.years_of_experience || 0} Years EXP
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:flex gap-4">
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-gray-400 uppercase italic">Allotted Active</div>
                                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{patients.length} LIVES</div>
                                </div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-white/10 self-center"></div>
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-gray-400 uppercase italic">Rating</div>
                                    <div className="text-xl font-black text-amber-500 leading-none uppercase tracking-tighter">{dossier?.profile?.rating?.toFixed(1) || "5.0"} ★</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl mt-8 w-fit border border-gray-200 dark:border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.key
                                    ? "bg-white dark:bg-gray-800 text-blue-600 shadow-md scale-105"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
                            <FiLoader className="size-10 animate-spin text-blue-600" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] italic">Compiling dossiers...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === "profile" && <DisplayNutritionistInfo nutritionist={dossier} />}
                            {activeTab === "patients" && <DisplayNutritionistPatients items={patients} />}
                            {activeTab === "plans" && <DisplayNutritionistDietPlans items={plans} />}
                            {activeTab === "meals" && <DisplayNutritionistMeals items={meals} patients={patients} />}
                            {activeTab === "meetings" && <DisplayNutritionistMeetings items={meetings} />}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="px-8 py-4 bg-gray-50/50 dark:bg-white/[0.02] border-t dark:border-white/5 flex justify-between items-center shrink-0">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                        <span className="size-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                        Secure Admin Portal • Dietitian Management Dossier v2.0
                    </div>
                </div>
            </div>
        </div>
    );
};
