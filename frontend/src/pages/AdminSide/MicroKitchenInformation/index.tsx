import React, { useEffect, useState, useCallback } from "react";
import { FiXCircle, FiSearch, FiInfo, FiTrash2, FiClock, FiCheck } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
    getMicroKitchenList,
    toggleMicroKitchenVerification,
    deleteMicroKitchen,
    MicroKitchenProfile
} from "./api";
import { toast, ToastContainer } from "react-toastify";
import Button from "../../../components/ui/button/Button";

const MicroKitchenInformationPage: React.FC = () => {
    const [profiles, setProfiles] = useState<MicroKitchenProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">("all");
    const [viewingProfile, setViewingProfile] = useState<MicroKitchenProfile | null>(null);

    const fetchData = useCallback(async (page: number, search: string, tab: "all" | "verified" | "unverified") => {
        setLoading(true);
        try {
            const verified = tab === "all" ? undefined : tab === "verified";
            const data = await getMicroKitchenList(page, search, verified);
            setProfiles(data.results);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load micro kitchens");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage, searchTerm, activeTab);
    }, [currentPage, searchTerm, activeTab, fetchData]);

    // Reset page on tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const handleToggleVerification = async (profile: MicroKitchenProfile) => {
        try {
            const up = await toggleMicroKitchenVerification(profile.id, !profile.is_verified);
            setProfiles(prev => prev.map(p => p.id === profile.id ? up : p));
            toast.success(`${up.brand_name || "Micro kitchen"} is now ${up.is_verified ? "verified" : "unverified"}`);
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this micro kitchen?")) return;
        try {
            await deleteMicroKitchen(id);
            setProfiles(prev => prev.filter(p => p.id !== id));
            toast.success("Profile deleted");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <>
            <PageMeta title="Micro Kitchen Info" description="Micro kitchen management and verification" />
            <PageBreadcrumb pageTitle="Micro Kitchen Management" />
            <ToastContainer position="bottom-right" className="z-[99999]" />

            <div className="mb-6 space-y-4">
                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full md:w-auto">
                        {(["all", "verified", "unverified"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search brand, code or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:border-gray-700"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/[0.05] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Brand/Kitchen</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Staff/Cylinders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Verification</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading data...</td>
                                </tr>
                            ) : profiles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No matching profiles found</td>
                                </tr>
                            ) : (
                                profiles.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">{p.brand_name || "Unnamed Kitchen"}</div>
                                            <div className="text-xs text-gray-400">ID: {p.kitchen_code || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{p.user_details?.first_name} {p.user_details?.last_name}</div>
                                            <div className="text-xs text-gray-500">{p.user_details?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1" title="Staff Count"><FiClock className="size-3 text-gray-400" /> {p.no_of_staff ?? 0}</span>
                                                <span className="flex items-center gap-1" title="LPG Cylinders"><FiInfo className="size-3 text-gray-400" /> {p.lpg_cylinders ?? 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.is_verified ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingProfile(p)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                                    title="Quick View"
                                                >
                                                    <FiInfo className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleVerification(p)}
                                                    className={`p-1.5 rounded-lg transition-colors ${p.is_verified
                                                        ? "text-amber-500 hover:bg-amber-50"
                                                        : "text-green-500 hover:bg-green-50"
                                                        }`}
                                                    title={p.is_verified ? "Unverify Profile" : "Verify Profile"}
                                                >
                                                    {p.is_verified ? <FiXCircle className="size-4" /> : <FiCheck className="size-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.05] flex justify-between items-center">
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                        >
                            Prev
                        </Button>
                        <Button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick View Modal (Full Details) */}
            {viewingProfile && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
                        <button
                            onClick={() => setViewingProfile(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <FiXCircle className="size-6 text-gray-400" />
                        </button>

                        <div className="flex justify-between items-start mb-8 mr-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{viewingProfile.brand_name || "Unnamed Kitchen"}</h3>
                                <p className="text-gray-500">Code: {viewingProfile.kitchen_code || "N/A"}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${viewingProfile.is_verified
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    }`}>
                                    {viewingProfile.is_verified ? "Verified Status" : "Pending Verification"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-white/[0.05]">
                            <section className="space-y-4">
                                <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2"><FiInfo /> Basic Info</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Owner:</span> <span className="font-medium">{viewingProfile.user_details?.first_name} {viewingProfile.user_details?.last_name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium text-xs truncate max-w-[150px]">{viewingProfile.user_details?.email}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Mobile:</span> <span className="font-medium">{viewingProfile.user_details?.mobile}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Cuisine:</span> <span className="font-medium">{viewingProfile.cuisine_type}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Meal Type:</span> <span className="font-medium">{viewingProfile.meal_type}</span></div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2"><FiCheck /> Compliance</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">FSSAI No:</span> <span className="font-medium">{viewingProfile.fssai_no || "N/A"}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">PAN No:</span> <span className="font-medium">{viewingProfile.pan_no || "N/A"}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">GST No:</span> <span className="font-medium">{viewingProfile.gst_no || "N/A"}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Area:</span> <span className="font-medium">{viewingProfile.kitchen_area} sq.ft</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Platform:</span> <span className="font-medium">{viewingProfile.platform_area} sq.ft</span></div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold flex items-center gap-2"><FiClock /> Operations</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">LPG Cylinders:</span> <span className="font-medium">{viewingProfile.lpg_cylinders}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Staff Count:</span> <span className="font-medium">{viewingProfile.no_of_staff}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Water Source:</span> <span className="font-medium">{viewingProfile.water_source}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Purification:</span> <span className="font-medium uppercase">{viewingProfile.purification_type}</span></div>
                                </div>
                            </section>
                        </div>

                        {/* Images Section */}
                        <section className="mb-8">
                            <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold mb-4 flex items-center gap-2">Kitchen Photos & Certificates</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Exterior", url: viewingProfile.photo_exterior },
                                    { label: "Entrance", url: viewingProfile.photo_entrance },
                                    { label: "Kitchen", url: viewingProfile.photo_kitchen },
                                    { label: "Platform", url: viewingProfile.photo_platform },
                                    { label: "FSSAI Cert", url: viewingProfile.fssai_cert },
                                ].map((img, idx) => (
                                    <div key={idx} className="group relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.05]">
                                        {img.url ? (
                                            typeof img.url === "string" ? (
                                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">New File Selected</div>
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {img.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-white/[0.05]">
                            {/* Equipment & Hygiene */}
                            <section className="space-y-4">
                                <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold italic">Equipment & Hygiene</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className={`flex items-center gap-2 p-2 rounded-lg ${viewingProfile.has_hobs ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"}`}>
                                        <FiCheck className={viewingProfile.has_hobs ? "" : "opacity-0"} /> Hobs
                                    </div>
                                    <div className={`flex items-center gap-2 p-2 rounded-lg ${viewingProfile.has_refrigerator ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"}`}>
                                        <FiCheck className={viewingProfile.has_refrigerator ? "" : "opacity-0"} /> Refrigerator
                                    </div>
                                    <div className={`flex items-center gap-2 p-2 rounded-lg ${viewingProfile.has_mixer ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"}`}>
                                        <FiCheck className={viewingProfile.has_mixer ? "" : "opacity-0"} /> Mixer
                                    </div>
                                    <div className={`flex items-center gap-2 p-2 rounded-lg ${viewingProfile.has_grinder ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"}`}>
                                        <FiCheck className={viewingProfile.has_grinder ? "" : "opacity-0"} /> Grinder
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm mt-4">
                                    <div className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl">
                                        <span className="text-gray-500">Pets:</span> {viewingProfile.has_pets ? viewingProfile.pet_details : "No pets"}
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl">
                                        <span className="text-gray-500">Pest Control:</span> {viewingProfile.pest_control_frequency || "N/A"} ({viewingProfile.has_pests ? "Had pests" : "No pests"})
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold italic">About & Health</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="space-y-1">
                                        <div className="text-gray-500 text-xs">About Me:</div>
                                        <div className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl line-clamp-3">{viewingProfile.about_you || "No content provided"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-500 text-xs">Health Info:</div>
                                        <div className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl">{viewingProfile.health_info || "None"}</div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setViewingProfile(null)}>Close</Button>
                            <Button
                                variant={viewingProfile.is_verified ? "outline" : "primary"}
                                onClick={() => {
                                    handleToggleVerification(viewingProfile);
                                    setViewingProfile(null);
                                }}
                            >
                                {viewingProfile.is_verified ? "Revoke Verification" : "Approve & Verify Kitchen"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MicroKitchenInformationPage;
