import React, { useEffect, useState, useCallback } from "react";
import {
    FiXCircle, FiUser, FiUsers, FiFileText, FiCalendar, FiVideo, FiLoader, FiBriefcase, FiStar, FiClipboard
} from "react-icons/fi";
import {
    getAdminNutritionistDetails,
    getNutritionistPatientsNoPaginate,
    getNutritionistDietPlansNoPaginate,
    getNutritionistMealsNoPaginate,
    getNutritionistMeetingsNoPaginate,
    getNutritionistReviewsPaginated,
    getNutritionistSupportTickets
} from "./api";
import {
    DisplayNutritionistInfo,
    DisplayNutritionistPatients,
    DisplayNutritionistDietPlans,
    DisplayNutritionistMeals,
    DisplayNutritionistMeetings,
    DisplayNutritionistReviews,
    DisplayNutritionistTickets
} from "./NutritionistDataViews";

interface NutritionistDetailModalProps {
    nutritionistId: number;
    open: boolean;
    onClose: () => void;
}

type TabKey = "profile" | "patients" | "plans" | "meals" | "meetings" | "reviews" | "tickets";

const TABS: { key: TabKey; label: string; icon: any; description: string }[] = [
    { key: "profile", label: "Profile", icon: <FiUser />, description: "Education, exp & specialty" },
    { key: "patients", label: "Clients", icon: <FiUsers />, description: "Live patient allotments" },
    { key: "plans", label: "Diet Plans", icon: <FiFileText />, description: "Suggested & active plans" },
    { key: "meals", label: "Meal Sets", icon: <FiCalendar />, description: "Daily prep for clients" },
    { key: "meetings", label: "Meetings", icon: <FiVideo />, description: "Consultation history" },
    { key: "reviews", label: "Reviews", icon: <FiStar />, description: "Feedback from patients" },
    { key: "tickets", label: "Tickets", icon: <FiClipboard />, description: "Support & tech issues" },
];

export const NutritionistDetailModal: React.FC<NutritionistDetailModalProps> = ({ nutritionistId, open, onClose }) => {
    const [screen, setScreen] = useState<"hub" | TabKey>("hub");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dossier, setDossier] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (open && nutritionistId) {
            setScreen("hub");
            setPayload(null);
            setError(null);
            setLoading(true);
            fetchInitialData();
        }
    }, [open, nutritionistId]);

    const fetchInitialData = async () => {
        try {
            const data = await getAdminNutritionistDetails(nutritionistId);
            setDossier(data);
        } catch (error) {
            setError("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const loadView = useCallback(async (view: TabKey, p = 1, isLoadMore = false) => {
        if (!isLoadMore) {
            setScreen(view);
            setLoading(true);
            setPayload(null);
            setPage(1);
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            let res: any;
            switch (view) {
                case "profile":
                    setPayload(dossier);
                    break;
                case "patients":
                    setPayload(await getNutritionistPatientsNoPaginate(nutritionistId));
                    break;
                case "plans":
                    setPayload(await getNutritionistDietPlansNoPaginate(nutritionistId));
                    break;
                case "meals":
                    setPayload(await getNutritionistMealsNoPaginate(nutritionistId));
                    break;
                case "meetings":
                    setPayload(await getNutritionistMeetingsNoPaginate(nutritionistId));
                    break;
                case "reviews":
                    res = await getNutritionistReviewsPaginated(nutritionistId, p, 10);
                    setPayload((prev: any) => isLoadMore ? [...(prev || []), ...res.results] : res.results);
                    setHasMore(res.current_page < res.total_pages);
                    break;
                case "tickets":
                    res = await getNutritionistSupportTickets(dossier?.id || nutritionistId, p, 10);
                    setPayload((prev: any) => isLoadMore ? [...(prev || []), ...res.results] : res.results);
                    setHasMore(res.current_page < res.total_pages);
                    break;
            }
        } catch (e: any) {
            setError(e.message || "Failed to load");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [nutritionistId, dossier]);

    const handleLoadMore = () => {
        const nextP = page + 1;
        setPage(nextP);
        loadView(screen as TabKey, nextP, true);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-950 rounded-[40px] w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-2xl relative border border-white/10 flex flex-col">

                {/* Header */}
                <header className="px-8 py-6 shrink-0 bg-gray-50/50 dark:bg-white/[0.02] border-b dark:border-white/5 flex items-center justify-between">
                    <div>
                        {screen !== "hub" && (
                            <button
                                onClick={() => setScreen("hub")}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 hover:translate-x-1 transition-transform flex items-center gap-1"
                            >
                                ← Back to dossier hub
                            </button>
                        )}
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                            {screen === "hub" ? "Nutritionist Dossier" : TABS.find(t => t.key === screen)?.label}
                        </h2>
                        <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest italic leading-none">
                            {dossier?.first_name} {dossier?.last_name} · Expert Management
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 hover:text-red-500">
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
                                    onClick={() => loadView(tab.key)}
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
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loading && !payload && (
                                <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                                    <FiLoader className="size-10 animate-spin text-indigo-600" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Accessing database...</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 font-bold text-sm italic">
                                    {error}
                                </div>
                            )}

                            {payload && (
                                <>
                                    {screen === "profile" && <DisplayNutritionistInfo nutritionist={payload} />}
                                    {screen === "patients" && <DisplayNutritionistPatients items={payload} />}
                                    {screen === "plans" && <DisplayNutritionistDietPlans items={payload} />}
                                    {screen === "meals" && <DisplayNutritionistMeals items={payload} patients={dossier?.allotted_patients || []} />}
                                    {screen === "meetings" && <DisplayNutritionistMeetings items={payload} />}
                                    {screen === "reviews" && (
                                        <DisplayNutritionistReviews 
                                            items={payload} 
                                            onLoadMore={handleLoadMore} 
                                            hasMore={hasMore} 
                                            loadingMore={loadingMore} 
                                        />
                                    )}
                                    {screen === "tickets" && (
                                        <DisplayNutritionistTickets 
                                            items={payload} 
                                            onLoadMore={handleLoadMore} 
                                            hasMore={hasMore} 
                                            loadingMore={loadingMore} 
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="px-8 py-4 shrink-0 bg-gray-50/50 dark:bg-white/[0.02] border-t dark:border-white/5 flex items-center justify-between">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic flex items-center gap-3">
                         <span className="size-2 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-500/50"></span>
                         Secure Data Terminal · Nutrition Domain v4.2
                    </div>
                </footer>
            </div>
        </div>
    );
};
