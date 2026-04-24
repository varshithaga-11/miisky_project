import React, { useEffect, useState, useCallback } from "react";
import { FiXCircle, FiSearch, FiInfo, FiTrash2, FiClock, FiCheck, FiClipboard, FiUpload, FiImage, FiEye } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import {
    getMicroKitchenList,
    getMicroKitchenDetail,
    updateMicroKitchenStatus,
    deleteMicroKitchen,
    saveMicroKitchenInspection,
    getMicroKitchenInspectionsNoPagination,
    MicroKitchenProfile,
    MicroKitchenProfileSummary,
    MicroKitchenInspection
} from "./api";
import { toast, ToastContainer } from "react-toastify";
import Button from "../../../components/ui/button/Button";
import { MicroKitchenDetailModal } from "./MicroKitchenDetailModal";
import { DisplayKitchenInspections } from "./MicroKitchenDataViews";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

type TabStatus = "all" | "draft" | "approved" | "rejected";

const getMediaUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

const InspectionMediaPreview: React.FC<{ file: File | null; onRemove?: () => void }> = ({ file, onRemove }) => {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        if (file) {
            const u = URL.createObjectURL(file);
            setUrl(u);
            return () => URL.revokeObjectURL(u);
        }
        setUrl(null);
    }, [file]);
    if (!file || !url) return null;
    const isVideo = file.type.startsWith("video/");
    return (
        <div className="mt-2 relative inline-block">
            {isVideo ? (
                <video src={url} controls className="max-h-24 rounded-lg border border-gray-200 dark:border-gray-700" />
            ) : (
                <img src={url} alt="Preview" className="max-h-20 rounded-lg border border-gray-200 dark:border-gray-700 object-cover" />
            )}
            {onRemove && (
                <button type="button" onClick={onRemove} className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full text-[10px] hover:bg-red-600">
                    <FiXCircle size={12} />
                </button>
            )}
        </div>
    );
};


const MicroKitchenInformationPage: React.FC = () => {
    const [profiles, setProfiles] = useState<MicroKitchenProfileSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState<TabStatus>("all");
    const [viewingProfileSummary, setViewingProfileSummary] = useState<MicroKitchenProfileSummary | null>(null);
    const [isInspecting, setIsInspecting] = useState<MicroKitchenProfile | null>(null);
    const [previousInspections, setPreviousInspections] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [inspectionData, setInspectionData] = useState<Partial<MicroKitchenInspection>>({
        status: 'draft',
        mc_code: '',
        inspection_date: new Date().toISOString().split('T')[0],
        external_cleanliness: 5,
        interior_cleanliness: 5,
        kitchen_platform_adequacy: 5,
        kitchen_platform_neatness: 5,
        safety: 5,
        pure_water: 5,
        storage_facilities: 5,
        packing_space: 5,
        kitchen_size: 5,
        discussion_with_chef: 5,
        other_observations: 5,
        support_staff: 5,
        external_cleanliness_media: null,
        interior_cleanliness_media: null,
        kitchen_platform_adequacy_media: null,
        kitchen_platform_neatness_media: null,
        safety_media: null,
        pure_water_media: null,
        storage_facilities_media: null,
        packing_space_media: null,
        kitchen_size_media: null,
        discussion_with_chef_media: null,
        other_observations_media: null,
        support_staff_media: null,
        notes: '',
        recommendation: '',
    });

    const fetchData = useCallback(async (page: number, search: string, status: TabStatus) => {
        setLoading(true);
        try {
            const data = await getMicroKitchenList(page, search, status);
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

    const openViewingProfile = (p: MicroKitchenProfileSummary) => {
        setViewingProfileSummary(p);
    };

    // Reset page on tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            const up = await updateMicroKitchenStatus(id, newStatus);
            setProfiles(prev => prev.map(p => p.id === id ? up : p));
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error(error);
            toast.error("Status update failed");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            // Pre-check for dependencies (Foods)
            const { getFoodList } = await import("../Food/foodapi");
            const foodsResponse = await getFoodList(1, 1, "", undefined, undefined, id);
            
            if (foodsResponse.count > 0) {
                toast.error(`Cannot delete micro kitchen. It has ${foodsResponse.count} associated foods. Please delete them first.`);
                return;
            }

            setIdToDelete(id);
        } catch (error) {
            toast.error("Failed to check dependencies");
        }
    };

    const confirmDelete = async () => {
        if (idToDelete === null) return;
        setIsDeleting(true);
        try {
            await deleteMicroKitchen(idToDelete);
            setProfiles(prev => prev.filter(p => p.id !== idToDelete));
            toast.success("Profile deleted successfully");
            setIdToDelete(null);
        } catch (error) {
            toast.error("Delete failed");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInspectionSubmit = async (e?: React.FormEvent, nextStatus?: string) => {
        if (e) e.preventDefault();
        if (!isInspecting) return;

        const formData = new FormData();
        formData.append('micro_kitchen', isInspecting.id.toString());
        // Set inspection record status to submitted if we are approving/rejecting
        formData.append('status', nextStatus ? 'submitted' : 'draft');

        // Append all fields to FormData
        Object.entries(inspectionData).forEach(([key, value]) => {
            if (key !== 'status' && value !== undefined && value !== null) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        try {
            await saveMicroKitchenInspection(formData);
            if (nextStatus) {
                await updateMicroKitchenStatus(isInspecting.id, nextStatus);
            }
            toast.success(nextStatus ? `Inspection saved and profile ${nextStatus}` : "Inspection record saved");
            setIsInspecting(null);
            fetchData(currentPage, searchTerm, activeTab);
        } catch (error) {
            console.error(error);
            toast.error("Failed to complete inspection process");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rejected</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Draft</span>;
        }
    };

    return (
        <>
            <PageMeta title="Micro Kitchen Info" description="Micro kitchen management and inspection" />
            <PageBreadcrumb pageTitle="Micro Kitchen Management" />
            <ToastContainer position="bottom-right" className="z-[99999]" />

            <div className="mb-6 space-y-4">
                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full md:w-auto overflow-x-auto">
                        {(["all", "draft", "approved", "rejected"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
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
                                            {getStatusBadge(p.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openViewingProfile(p)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                                    title="Quick View"
                                                >
                                                    <FiEye className="size-4" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setLoading(true);
                                                        try {
                                                            const fullProfile = await getMicroKitchenDetail(p.id);
                                                            setIsInspecting(fullProfile);
                                                            setInspectionData(prev => ({ ...prev, mc_code: p.kitchen_code || "" }));
                                                            setLoadingHistory(true);
                                                            const history = await getMicroKitchenInspectionsNoPagination(p.id);
                                                            setPreviousInspections(history);
                                                        } catch (err) {
                                                            console.error("Failed to setup inspection", err);
                                                            toast.error("Failed to load kitchen details for inspection");
                                                        } finally {
                                                            setLoading(false);
                                                            setLoadingHistory(false);
                                                        }
                                                    }}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Inspect & Verify"
                                                >
                                                    <FiClipboard className="size-4" />
                                                </button>
                                                {p.status === 'draft' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(p.id, 'approved')}
                                                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Directly Approve"
                                                        >
                                                            <FiCheck className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(p.id, 'rejected')}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Directly Reject"
                                                        >
                                                            <FiXCircle className="size-4" />
                                                        </button>
                                                    </>
                                                )}
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

            {/* Detail Modal */}
            {viewingProfileSummary && (
                <MicroKitchenDetailModal
                    kitchen={viewingProfileSummary}
                    open={!!viewingProfileSummary}
                    onClose={() => setViewingProfileSummary(null)}
                />
            )}

            {/* Inspection & Verification Modal */}
            {isInspecting && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
                        <button
                            onClick={() => setIsInspecting(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <FiXCircle className="size-6 text-gray-400" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Kitchen Inspection</h3>
                            <p className="text-gray-500">Inspect profile for {isInspecting.brand_name}</p>
                        </div>

                        {/* Kitchen's Uploaded Photos */}
                        <section className="mb-8 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-white/[0.05]">
                            <h4 className="text-xs uppercase tracking-wider text-blue-600 font-bold mb-4 flex items-center gap-2"><FiImage size={14} /> Kitchen Photos (uploaded by owner)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[
                                    { label: "Exterior", url: typeof isInspecting.photo_exterior === "string" ? getMediaUrl(isInspecting.photo_exterior) : null, isDoc: false },
                                    { label: "Entrance", url: typeof isInspecting.photo_entrance === "string" ? getMediaUrl(isInspecting.photo_entrance) : null, isDoc: false },
                                    { label: "Kitchen", url: typeof isInspecting.photo_kitchen === "string" ? getMediaUrl(isInspecting.photo_kitchen) : null, isDoc: false },
                                    { label: "Platform", url: typeof isInspecting.photo_platform === "string" ? getMediaUrl(isInspecting.photo_platform) : null, isDoc: false },
                                    { label: "FSSAI Cert", url: typeof isInspecting.fssai_cert === "string" ? getMediaUrl(isInspecting.fssai_cert) : null, isDoc: true },
                                ].map((img, idx) => (
                                    <div key={idx} className="group relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                        {img.url ? (
                                            img.isDoc ? (
                                                <a href={img.url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center gap-1 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <FiUpload className="size-8 text-gray-500" />
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">View certificate</span>
                                                </a>
                                            ) : (
                                                <a href={img.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                                    <img src={img.url} alt={img.label} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                                                </a>
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5 text-[10px] text-white font-medium">
                                            {img.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recent Inspection Records */}
                        <section className="mb-10 space-y-4">
                            <h4 className="text-xs uppercase tracking-wider text-amber-600 font-bold flex items-center gap-2">
                                <FiClipboard className="size-4" /> Previous Inspection History
                            </h4>
                            {loadingHistory ? (
                                <div className="p-4 text-xs text-gray-400 animate-pulse">Loading history...</div>
                            ) : previousInspections.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                                    <DisplayKitchenInspections items={previousInspections} />
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 text-xs text-gray-400 text-center uppercase tracking-widest font-black italic">
                                    No previous records found
                                </div>
                            )}
                        </section>

                        <form onSubmit={handleInspectionSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">MC Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={inspectionData.mc_code}
                                        onChange={e => setInspectionData(prev => ({ ...prev, mc_code: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Inspection Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={inspectionData.inspection_date}
                                        onChange={e => setInspectionData(prev => ({ ...prev, inspection_date: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <section>
                                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2">Ratings (1-10)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    {[
                                        { key: 'external_cleanliness', label: 'External Cleanliness', media: 'external_cleanliness_media' },
                                        { key: 'interior_cleanliness', label: 'Interior Cleanliness', media: 'interior_cleanliness_media' },
                                        { key: 'kitchen_platform_adequacy', label: 'Platform Adequacy', media: 'kitchen_platform_adequacy_media' },
                                        { key: 'kitchen_platform_neatness', label: 'Platform Neatness', media: 'kitchen_platform_neatness_media' },
                                        { key: 'safety', label: 'Safety Measures', media: 'safety_media' },
                                        { key: 'pure_water', label: 'Water Purity', media: 'pure_water_media' },
                                        { key: 'storage_facilities', label: 'Storage', media: 'storage_facilities_media' },
                                        { key: 'packing_space', label: 'Packing Space', media: 'packing_space_media' },
                                        { key: 'kitchen_size', label: 'Kitchen Size', media: 'kitchen_size_media' },
                                        { key: 'discussion_with_chef', label: 'Chef Interview', media: 'discussion_with_chef_media' },
                                        { key: 'other_observations', label: 'Other Obs.', media: 'other_observations_media' },
                                        { key: 'support_staff', label: 'Staff Quality', media: 'support_staff_media' },
                                    ].map((field) => (
                                        <div key={field.key} className="flex flex-col bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-transparent hover:border-blue-200 transition-all gap-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{field.label}</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 text-center text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded px-1">
                                                        {inspectionData[field.key as keyof MicroKitchenInspection] as number || 5}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    step="1"
                                                    value={inspectionData[field.key as keyof MicroKitchenInspection] as number || 5}
                                                    onChange={e => setInspectionData(prev => ({ ...prev, [field.key]: parseInt(e.target.value) }))}
                                                    className="flex-1 h-1.5 bg-blue-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />

                                                <label className={`cursor-pointer p-2 rounded-xl transition-colors flex items-center gap-2 shrink-0 ${inspectionData[field.media as keyof MicroKitchenInspection]
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600"
                                                    }`}>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*,video/*"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setInspectionData(prev => ({ ...prev, [field.media]: file }));
                                                            e.target.value = "";
                                                        }}
                                                    />
                                                    <FiUpload size={14} />
                                                    {inspectionData[field.media as keyof MicroKitchenInspection] && <FiCheck size={12} />}
                                                </label>
                                            </div>
                                            <InspectionMediaPreview
                                                file={inspectionData[field.media as keyof MicroKitchenInspection] instanceof File ? inspectionData[field.media as keyof MicroKitchenInspection] as File : null}
                                                onRemove={() => setInspectionData(prev => ({ ...prev, [field.media]: null }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</label>
                                    <textarea
                                        rows={3}
                                        value={inspectionData.notes}
                                        onChange={e => setInspectionData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Specific observations..."
                                    ></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recommendation</label>
                                    <textarea
                                        rows={3}
                                        value={inspectionData.recommendation}
                                        onChange={e => setInspectionData(prev => ({ ...prev, recommendation: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Final recommendation to admin..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Status is always saved as `draft` (dropdown removed). */}

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t dark:border-white/[0.05]">
                                <Button variant="outline" type="button" onClick={() => setIsInspecting(null)}>Cancel</Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => handleInspectionSubmit()}
                                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    variant="primary"
                                    type="button"
                                    onClick={() => handleInspectionSubmit(undefined, 'rejected')}
                                    className="bg-red-500 hover:bg-red-600 border-red-500"
                                >
                                    Reject Kitchen
                                </Button>
                                <Button
                                    variant="primary"
                                    type="button"
                                    onClick={() => handleInspectionSubmit(undefined, 'approved')}
                                    className="bg-green-600 hover:bg-green-700 border-green-600 px-8"
                                >
                                    Approve & Verify
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={idToDelete !== null}
                onClose={() => setIdToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Micro Kitchen?"
                message="Are you sure you want to permanently delete this micro kitchen profile and all associated data? This action cannot be undone."
                confirmText="Delete Kitchen"
            />
        </>
    );
};

export default MicroKitchenInformationPage;
