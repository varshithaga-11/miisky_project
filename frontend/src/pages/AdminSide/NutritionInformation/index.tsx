import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getNutritionistInformation, NutritionistProfile } from "./api";
import { toast, ToastContainer } from "react-toastify";
import {
    FiUser, FiBriefcase, FiMail, FiMapPin,
    FiUsers, FiStar, FiPhone, FiBookOpen, FiAward,
    FiChevronDown, FiChevronUp
} from "react-icons/fi";

const NutritionInformationPage: React.FC = () => {
    const [nutritionists, setNutritionists] = useState<NutritionistProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getNutritionistInformation();
            setNutritionists(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load nutritionist data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-12">
            <PageMeta title="Nutritionists Information" description="Detailed view of nutritionist profiles and their allotted patients" />
            <PageBreadcrumb pageTitle="Nutritionists Overview" />
            <ToastContainer position="bottom-right" />

            <div className="px-4 md:px-8">

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-[32px] animate-pulse shadow-sm"></div>
                        ))}
                    </div>
                ) : nutritionists.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
                        <FiUser className="size-16 mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                        <h3 className="text-xl font-bold dark:text-white uppercase tracking-tighter italic">No Dietitians Found</h3>
                        <p className="text-gray-500">Wait for nutritionists to register or populate your database.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {nutritionists.map((nut) => (
                            <div
                                key={nut.id}
                                className={`bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-transparent hover:border-blue-500/20 transition-all ${expandedId === nut.id ? 'shadow-2xl ring-1 ring-blue-500/10' : 'shadow-sm'}`}
                            >
                                {/* Summary View (Always Visible) */}
                                <div
                                    onClick={() => toggleExpand(nut.id)}
                                    className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex gap-6 items-center">
                                        <div className="size-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden ring-4 ring-blue-50 dark:ring-blue-900/10 shrink-0">
                                            {nut.user_details?.photo ? (
                                                <img src={nut.user_details.photo} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-blue-500">
                                                    <FiUser size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2 truncate">
                                                {nut.user_details?.first_name} {nut.user_details?.last_name}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                                                    <FiStar className="fill-amber-600" size={10} /> {nut.rating.toFixed(1)}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{nut.qualification || "GENERAL NUTRITIONIST"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-white/5">
                                        <div className="hidden sm:flex flex-col items-start md:items-end">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tighter">{nut.years_of_experience || "0"} Years</span>
                                        </div>
                                        <div className="flex flex-col items-start md:items-end">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allotted</span>
                                            <div className="flex items-center gap-2">
                                                <FiUsers className="text-blue-500" />
                                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tighter">{nut.allotted_patients.length} ACTIVE</span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-gray-400">
                                            {expandedId === nut.id ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed View (Expandable) */}
                                <div className={`transition-all duration-300 overflow-hidden ${expandedId === nut.id ? 'max-h-[2000px] border-t border-gray-100 dark:border-white/5 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-gray-50/30 dark:bg-gray-900/20">
                                        {/* Professional Bio */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                                                    <FiBriefcase className="text-blue-500" /> Contact & Professional info
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                        <FiMail className="text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg size-10 flex items-center justify-center shrink-0" />
                                                        <div className="truncate">
                                                            <div className="text-[8px] uppercase tracking-widest text-gray-400 font-black">email</div>
                                                            {nut.user_details?.email}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                        <FiPhone className="text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg size-10 flex items-center justify-center shrink-0" />
                                                        <div>
                                                            <div className="text-[8px] uppercase tracking-widest text-gray-400 font-black">mobile</div>
                                                            {nut.user_details?.mobile || "N/A"}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                        <FiBookOpen className="text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg size-10 flex items-center justify-center shrink-0" />
                                                        <div>
                                                            <div className="text-[8px] uppercase tracking-widest text-gray-400 font-black">License</div>
                                                            {nut.license_number || "PENDING"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Specializations & Modes */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                                                        <FiAward className="text-blue-500" /> Specializations
                                                    </label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {(nut.specializations ? nut.specializations.split(',') : ["General Nutrition"]).map((spec, sidx) => (
                                                            <span key={sidx} className="px-3 py-1 bg-white dark:bg-white/5 rounded-lg text-[9px] font-black text-gray-800 dark:text-white uppercase tracking-widest border border-gray-100 dark:border-white/5">
                                                                {spec.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                                                        <FiMapPin className="text-blue-500" /> Channels
                                                    </label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {(nut.available_modes ? nut.available_modes.split(',') : ["Online"]).map((mode, midx) => (
                                                            <span key={midx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                                {mode.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Allotted Patients List */}
                                        <div className="bg-white dark:bg-gray-800/40 rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-inner">
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic flex items-center gap-2">
                                                    <FiUsers className="text-indigo-500" /> Allotted Clients ({nut.allotted_patients.length})
                                                </h3>
                                            </div>

                                            {nut.allotted_patients.length === 0 ? (
                                                <div className="p-10 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-center">
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Zero Active Allotments</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                                    {nut.allotted_patients.map((p) => (
                                                        <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-transparent hover:border-blue-500/20 transition-all">
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate leading-none">
                                                                    {p.first_name} {p.last_name}
                                                                </div>
                                                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">
                                                                    {p.email}
                                                                </div>
                                                            </div>
                                                            <div className="size-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Footer (Optional, can be used for verifying, etc) */}
                                    <div className="px-8 py-4 bg-gray-100/30 dark:bg-white/[0.02] flex justify-between items-center border-t dark:border-white/5">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
                                            <FiBriefcase className="size-3" /> Data provided by secure miisky backend
                                        </div>
                                        {!nut.is_verified && (
                                            <button className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                                                Verify Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionInformationPage;
