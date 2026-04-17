import React, { useCallback, useEffect, useState } from "react";
import {
  FiSearch,
  FiClipboard,
  FiCheck,
  FiXCircle,
  FiEye,
  FiInfo,
} from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMicroKitchenList, type MicroKitchenProfile } from "../../AdminSide/MicroKitchenInformation/api";
import {
  getMicroKitchenById,
  getMicroKitchenInspectionsForKitchen,
  updateMicroKitchenStatus,
} from "./api";
import { DisplayKitchenInfo, DisplayKitchenInspections } from "../../AdminSide/MicroKitchenInformation/MicroKitchenDataViews";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import Button from "../../../components/ui/button/Button";

type TabStatus = "draft" | "rejected" | "all";

const MicroKitchenInspectionPage: React.FC = () => {
  const [profiles, setProfiles] = useState<MicroKitchenProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<TabStatus>("draft");

  const [inspectKitchen, setInspectKitchen] = useState<MicroKitchenProfile | null>(null);
  const [detailKitchen, setDetailKitchen] = useState<MicroKitchenProfile | null>(null);
  const [inspectionItems, setInspectionItems] = useState<any[]>([]);
  const [loadingInspect, setLoadingInspect] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{
    id: number;
    status: "approved" | "rejected";
    label: string;
  } | null>(null);

  const fetchData = useCallback(async (page: number, search: string, status: TabStatus) => {
    setLoading(true);
    try {
      const tabParam = status === "all" ? "all" : status;
      const data = await getMicroKitchenList(page, search, tabParam);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const openInspect = async (p: MicroKitchenProfile) => {
    setInspectKitchen(p);
    setLoadingInspect(true);
    setDetailKitchen(null);
    setInspectionItems([]);
    try {
      const [full, inspections] = await Promise.all([
        getMicroKitchenById(p.id),
        getMicroKitchenInspectionsForKitchen(p.id),
      ]);
      setDetailKitchen(full);
      setInspectionItems(inspections);
    } catch (e) {
      console.error(e);
      toast.error("Could not load kitchen details or inspections");
      setInspectKitchen(null);
    } finally {
      setLoadingInspect(false);
    }
  };

  const applyStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      const updated = await updateMicroKitchenStatus(id, status);
      setProfiles((prev) => prev.map((x) => (x.id === id ? updated : x)));
      if (detailKitchen?.id === id) setDetailKitchen(updated);
      if (inspectKitchen?.id === id) setInspectKitchen(updated);
      toast.success(status === "approved" ? "Kitchen verified and approved." : "Kitchen rejected.");
      setConfirmAction(null);
      setInspectKitchen(null);
      setDetailKitchen(null);
      setInspectionItems([]);
      fetchData(currentPage, searchTerm, activeTab);
    } catch (e) {
      console.error(e);
      toast.error("Update failed. You may not have permission or the server rejected the change.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Draft
          </span>
        );
    }
  };

  /** Approve: pending or previously rejected. Reject: pending or currently approved (revoke). */
  const showApprove = (p: MicroKitchenProfile) => p.status !== "approved";
  const showReject = (p: MicroKitchenProfile) => p.status !== "rejected";

  return (
    <>
      <PageMeta title="Kitchen inspection" description="Inspect, verify, or reject micro kitchens" />
      <PageBreadcrumb pageTitle="Micro kitchen inspection" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full md:w-auto overflow-x-auto">
            {(
              [
                ["draft", "Pending review"],
                ["rejected", "Rejected"],
                ["all", "All"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search brand, code or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
          <FiInfo className="size-4 shrink-0 mt-0.5" />
          Review kitchen profile details and inspection records, then approve or reject onboarding. Approved kitchens appear
          under Certified Micro Kitchens.
        </p>
      </div>

      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/[0.05] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kitchen</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No kitchens in this list.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{p.brand_name || "Unnamed kitchen"}</div>
                      <div className="text-xs text-gray-400">Code: {p.kitchen_code || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {p.user_details?.first_name} {p.user_details?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{p.user_details?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(p.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 flex-wrap items-center">
                        <button
                          type="button"
                          onClick={() => openInspect(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                          title="Inspect details and inspection history"
                        >
                          <FiClipboard className="size-4" />
                          Inspect
                        </button>
                        {showApprove(p) && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({ id: p.id, status: "approved", label: p.brand_name || "this kitchen" })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 shadow-sm transition-colors"
                            title="Approve this kitchen"
                          >
                            <FiCheck className="size-4 shrink-0" />
                            Approve
                          </button>
                        )}
                        {showReject(p) && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({ id: p.id, status: "rejected", label: p.brand_name || "this kitchen" })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-300 text-red-600 bg-white dark:bg-gray-900 dark:border-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Reject this kitchen"
                          >
                            <FiXCircle className="size-4 shrink-0" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.05] flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((x) => Math.max(1, x - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Prev
            </Button>
            <Button
              onClick={() => setCurrentPage((x) => Math.min(totalPages, x + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {inspectKitchen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setInspectKitchen(null);
                setDetailKitchen(null);
                setInspectionItems([]);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <FiXCircle className="size-6 text-gray-400" />
            </button>

            <div className="mb-6 pr-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Inspect kitchen</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{inspectKitchen.brand_name}</p>
            </div>

            {loadingInspect || !detailKitchen ? (
              <div className="py-16 text-center text-gray-400 animate-pulse">Loading details…</div>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  {getStatusBadge(detailKitchen.status)}
                  {showApprove(detailKitchen) && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({
                          id: detailKitchen.id,
                          status: "approved",
                          label: detailKitchen.brand_name || "this kitchen",
                        })
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <FiCheck className="size-4" />
                      Approve
                    </button>
                  )}
                  {showReject(detailKitchen) && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({
                          id: detailKitchen.id,
                          status: "rejected",
                          label: detailKitchen.brand_name || "this kitchen",
                        })
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <FiXCircle className="size-4" />
                      Reject
                    </button>
                  )}
                </div>

                <div className="space-y-10">
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiEye className="size-4 text-emerald-500" />
                      Profile &amp; questionnaire
                    </h4>
                    <DisplayKitchenInfo kitchen={detailKitchen} />
                  </section>
                  <section>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiClipboard className="size-4 text-amber-500" />
                      Inspection history
                    </h4>
                    <DisplayKitchenInspections items={inspectionItems} />
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && applyStatus(confirmAction.id, confirmAction.status)}
        title={confirmAction?.status === "approved" ? "Approve kitchen?" : "Reject kitchen?"}
        message={
          confirmAction
            ? `This will mark ${confirmAction.label} as ${confirmAction.status === "approved" ? "approved" : "rejected"}.`
            : ""
        }
        confirmText={confirmAction?.status === "approved" ? "Approve" : "Reject"}
        variant={confirmAction?.status === "rejected" ? "danger" : "info"}
      />
    </>
  );
};

export default MicroKitchenInspectionPage;
