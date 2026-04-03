import React, { useEffect, useState, useCallback } from "react";
import {
    FiXCircle, FiUser, FiUsers, FiFileText, FiCalendar, FiVideo, FiLoader, FiBriefcase, FiStar, FiClipboard, FiPackage, FiPieChart
} from "react-icons/fi";
import {
    getAdminNutritionistDetails,
    getNutritionistPatientsNoPaginate,
    getNutritionistDietPlansNoPaginate,
    getNutritionistMealsWithMonth,
    getNutritionistMeetingsNoPaginate,
    getNutritionistReviewsNoPaginate,
    getNutritionistTicketsNoPaginate,
    getNutritionistPayoutsNoPaginate,
    getNutritionAllottedPlanPayouts
} from "./api";
import { AdminAllottedPlanPayoutsPanel } from "../shared/AdminAllottedPlanPayoutsPanel";
import {
    DisplayNutritionistInfo,
    DisplayNutritionistPatients,
    DisplayNutritionistDietPlans,
    DisplayNutritionistMeals,
    DisplayNutritionistMeetings,
    DisplayNutritionistReviews,
    DisplayNutritionistTickets,
    DisplayNutritionistPayouts
} from "./NutritionistDataViews";

interface NutritionistDetailModalProps {
    nutritionist: any;
    open: boolean;
    onClose: () => void;
}

type TabKey = "profile" | "patients" | "plans" | "meals" | "meetings" | "reviews" | "tickets" | "payouts" | "allotted_plan_payouts";

const TABS: { key: TabKey; label: string; icon: any; description: string }[] = [
    { key: "profile", label: "Profile", icon: <FiUser />, description: "Education, exp & specialty" },
    { key: "patients", label: "Patients", icon: <FiUsers />, description: "Live patient allotments" },
    { key: "plans", label: "Diet Plans", icon: <FiFileText />, description: "Suggested & active plans" },
    { key: "meals", label: "Meal Sets", icon: <FiCalendar />, description: "Daily prep for clients" },
    { key: "meetings", label: "Meetings", icon: <FiVideo />, description: "Consultation history" },
    { key: "reviews", label: "Reviews", icon: <FiStar />, description: "Feedback from patients" },
    { key: "tickets", label: "Tickets", icon: <FiClipboard />, description: "Support & tech issues" },
    { key: "payouts", label: "Payouts", icon: <FiPackage />, description: "Earnings & patient billing" },
    { key: "allotted_plan_payouts", label: "Allotted plan payouts", icon: <FiPieChart />, description: "Diet plan shares for mapped patients only" },
];

export const NutritionistDetailModal: React.FC<NutritionistDetailModalProps> = ({ nutritionist, open, onClose }) => {
    const [screen, setScreen] = useState<"hub" | TabKey>("hub");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);

    const nutritionistId = nutritionist?.id;

    useEffect(() => {
        if (open) {
            setScreen("hub");
            setPayload(null);
            setError(null);
            setLoading(false);
            setProfileData(null);
        }
    }, [open]);

    const loadView = useCallback(async (view: TabKey) => {
        setScreen(view);
        setLoading(true);
        setPayload(null);
        setError(null);

        try {
            switch (view) {
                case "profile":
                    // CALL DETAIL API ONLY ON PROFILE TAB AS REQUESTED
                    if (!profileData) {
                        const data = await getAdminNutritionistDetails(nutritionistId);
                        setProfileData(data);
                        setPayload(data);
                    } else {
                        setPayload(profileData);
                    }
                    break;
                case "patients":
                    setPayload(await getNutritionistPatientsNoPaginate(nutritionistId));
                    break;
                case "plans":
                    setPayload(await getNutritionistDietPlansNoPaginate(nutritionistId));
                    break;
                case "meals":
                    const now = new Date();
                    setPayload(await getNutritionistMealsWithMonth(nutritionistId, now.getMonth() + 1, now.getFullYear()));
                    break;
                case "meetings":
                    setPayload(await getNutritionistMeetingsNoPaginate(nutritionistId));
                    break;
                case "reviews":
                    setPayload(await getNutritionistReviewsNoPaginate(nutritionistId));
                    break;
                case "tickets":
                    setPayload(await getNutritionistTicketsNoPaginate(nutritionistId));
                    break;
                case "payouts":
                    setPayload(await getNutritionistPayoutsNoPaginate(nutritionistId));
                    break;
            }
        } catch (e: any) {
            setError(e.message || "Failed to load session data");
        } finally {
            setLoading(false);
        }
    }, [nutritionistId, profileData]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-950 rounded-[40px] w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-2xl relative border border-white/10 flex flex-col">

                {/* Header */}
                <header className="px-8 py-6 shrink-0 bg-gray-50/50 dark:bg-white/[0.02] border-b dark:border-white/5 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-[0.03] transition-all duration-700 text-6xl font-black italic select-none">
                        Details
                    </div>

                    <div>
                        {screen !== "hub" && (
                            <button
                                onClick={() => setScreen("hub")}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 hover:translate-x-1 transition-transform flex items-center gap-1"
                            >
                                ← Back to terminal hub
                            </button>
                        )}
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                            {screen === "hub" ? "Nutritionist Hub" : TABS.find(t => t.key === screen)?.label}
                        </h2>
                        <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest italic leading-none">
                            {nutritionist?.first_name} {nutritionist?.last_name} · Professional Details #{nutritionist?.id}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 hover:text-red-500 relative z-10">
                        <FiXCircle size={28} />
                    </button>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-transparent to-gray-50/30 dark:to-white/[0.01]">
                    {screen === "hub" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        if (tab.key === "allotted_plan_payouts") {
                                            setScreen("allotted_plan_payouts");
                                            setLoading(false);
                                            setPayload(null);
                                            setError(null);
                                        } else {
                                            loadView(tab.key);
                                        }
                                    }}
                                    className="group text-left p-7 rounded-[32px] border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900/50 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-indigo-600">
                                        {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 80 })}
                                    </div>
                                    <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                        {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 24 })}
                                    </div>
                                    <div className="font-black text-gray-900 dark:text-white text-xl tracking-tighter uppercase mb-2">{tab.label}</div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed italic">{tab.description}</p>
                                </button>
                            ))}
                        </div>
                    ) : screen === "allotted_plan_payouts" && nutritionistId ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
                            <AdminAllottedPlanPayoutsPanel
                                partnerRoleLabel="nutritionist"
                                loadRows={(search) => getNutritionAllottedPlanPayouts(nutritionistId, search)}
                            />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loading && !payload && (
                                <div className="py-24 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="size-16 rounded-[22px] border-4 border-indigo-100 dark:border-indigo-900/20 border-t-indigo-600 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FiLoader className="size-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 italic">Synchronizing Terminal</p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Please wait while we fetch high-density datasets</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-8 rounded-[32px] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                        <FiXCircle size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-black uppercase tracking-tighter italic leading-tight">Access Error</div>
                                        <p className="text-xs font-medium opacity-80">{error}</p>
                                    </div>
                                </div>
                            )}

                            {payload && !loading && (
                                <>
                                    {screen === "profile" && <DisplayNutritionistInfo nutritionist={payload} />}
                                    {screen === "patients" && <DisplayNutritionistPatients items={payload} />}
                                    {screen === "plans" && <DisplayNutritionistDietPlans items={payload} />}
                                    {screen === "meals" && <DisplayNutritionistMeals items={payload} nutritionistId={nutritionistId} />}
                                    {screen === "meetings" && <DisplayNutritionistMeetings items={payload} />}
                                    {screen === "reviews" && <DisplayNutritionistReviews items={payload} />}
                                    {screen === "tickets" && <DisplayNutritionistTickets items={payload} />}
                                    {screen === "payouts" && <DisplayNutritionistPayouts items={payload} />}
                                </>
                            )}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="px-8 py-4 shrink-0 bg-gray-50/50 dark:bg-white/[0.02] border-t dark:border-white/5 flex items-center justify-between">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic flex items-center gap-3">
                        <span className="size-2 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-500/50"></span>
                        Secure Data Terminal · Nutrition Domain v5.5
                    </div>
                </footer>
            </div>
        </div>
    );
};
