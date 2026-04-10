import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  getMySuggestedPlans,
  approvePlan,
  rejectPlan,
  uploadPaymentScreenshot,
  updatePlanStatus,
  UserDietPlan,
} from "./api";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import { FiCheckCircle, FiXCircle, FiCreditCard, FiPackage, FiHome, FiUpload, FiClock, FiStopCircle, FiCheck, FiEdit } from "react-icons/fi";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

const ScreenshotPreview: React.FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    return () => setPreviewUrl(null);
  }, [file]);
  if (!previewUrl) return <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />;
  return <img src={previewUrl} alt="Payment screenshot preview" className="w-full max-h-48 object-cover object-top" />;
};

const SuggestedPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<UserDietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState<UserDietPlan | null>(null);
  const [rejectModal, setRejectModal] = useState<UserDietPlan | null>(null);
  const [paymentModal, setPaymentModal] = useState<UserDietPlan | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ plan: UserDietPlan, status: string } | null>(null);

  const handleStatusUpdate = (plan: UserDietPlan, newStatus: string) => {
    setStatusUpdate({ plan, status: newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!statusUpdate || submitting) return;
    const { plan, status: newStatus } = statusUpdate;
    setSubmitting(true);
    try {
      const updated = await updatePlanStatus(plan.id, newStatus);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`Plan marked as ${newStatus.replace('_', ' ')} successfully`);
      setStatusUpdate(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || `Failed to mark plan as ${newStatus}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isCompletionAllowed = (endDate: string | null) => {
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end <= today;
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await getMySuggestedPlans();
      setPlans(data);
    } catch (err) {
      toast.error("Failed to load suggested plans");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setSubmitting(true);
    try {
      const updated = await approvePlan(approveModal.id);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setApproveModal(null);
      toast.success("Plan approved. Please upload payment screenshot.");
      setPaymentModal(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to approve");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setSubmitting(true);
    try {
      const updated = await rejectPlan(rejectModal.id, rejectFeedback || undefined);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setRejectModal(null);
      setRejectFeedback("");
      toast.success("Plan rejected");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to reject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadPayment = async () => {
    const resolvedAmount =
      amountPaid || paymentModal?.diet_plan_details?.final_amount || "";

    const isReady = !!resolvedAmount && !!transactionId;

    if (!paymentModal || !isReady) {
      toast.warning("Please fill in the amount and transaction ID");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await uploadPaymentScreenshot(
        paymentModal.id,
        screenshotFile || undefined,
        resolvedAmount,
        transactionId
      );
      setPlans((prev: UserDietPlan[]) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setPaymentModal(null);
      setScreenshotFile(null);
      setAmountPaid("");
      setTransactionId("");
      toast.success("Payment details submitted. Admin will verify and activate your plan.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to upload details");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      suggested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      payment_pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      completed: "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400",
      stopped: "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-500",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  const suggestedOnly = plans.filter((p) => p.status === "suggested");
  const otherPlans = plans.filter((p) => p.status !== "suggested");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Suggested Plans & Kitchens" description="Plans and kitchens suggested by your nutritionist" />
      <PageBreadcrumb pageTitle="Suggested Plans & Kitchens" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Awaiting your decision */}
            {suggestedOnly.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiPackage className="text-amber-500" /> Awaiting Your Decision
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedOnly.map((udp) => (
                    <div
                      key={udp.id}
                      className="group relative overflow-hidden flex flex-col bg-white dark:bg-gray-800 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 hover:shadow-xl transition-all"
                    >
                      <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {udp.diet_plan_details?.code}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                          {udp.diet_plan_details?.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          By {udp.nutritionist_details?.first_name} {udp.nutritionist_details?.last_name}
                        </p>
                        {udp.micro_kitchen_details && (
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                            <FiHome size={14} /> Kitchen: {udp.micro_kitchen_details.brand_name}
                          </p>
                        )}
                        {udp.original_micro_kitchen_details && (
                          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100/50">
                             <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                               <FiHome size={10} /> Reassigned from: {udp.original_micro_kitchen_details.brand_name}
                             </p>
                          </div>
                        )}
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-4">
                          ₹{udp.diet_plan_details?.final_amount}{" "}
                          <span className="text-sm font-normal text-gray-500">
                            / {udp.diet_plan_details?.no_of_days} days
                          </span>
                        </p>
                        {udp.nutritionist_notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic line-clamp-3">
                            "{udp.nutritionist_notes}"
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-2">
                          Suggested: {new Date(udp.suggested_on).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-6 flex gap-3">
                        <button
                          onClick={() => setApproveModal(udp)}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <FiCheckCircle /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal(udp)}
                          className="flex-1 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <FiXCircle /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment pending */}
            {plans.some((p) => p.status === "payment_pending") && (
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiCreditCard className="text-yellow-500" /> Payment Pending
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans
                    .filter((p) => p.status === "payment_pending")
                    .map((udp) => (
                      <div
                        key={udp.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-white/[0.05] p-6"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {udp.diet_plan_details?.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadge(udp.status)}`}>
                            {udp.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                          Start: {udp.start_date ? new Date(udp.start_date).toLocaleDateString() : "-"} → End:{" "}
                          {udp.end_date ? new Date(udp.end_date).toLocaleDateString() : "-"}
                        </p>
                        <p className="text-xl font-black text-gray-900 dark:text-white mt-4">
                          ₹{udp.diet_plan_details?.final_amount}
                        </p>
                        {udp.payment_screenshot && (
                          <div className="mt-4">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Uploaded screenshot</p>
                            <a
                              href={getMediaUrl(udp.payment_screenshot)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:ring-2 hover:ring-indigo-500"
                            >
                              <img
                                src={getMediaUrl(udp.payment_screenshot)}
                                alt="Payment screenshot"
                                className="w-full h-32 object-cover object-top"
                              />
                            </a>
                            {udp.payment_uploaded_on && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                Uploaded: {new Date(udp.payment_uploaded_on).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setPaymentModal(udp);
                            setScreenshotFile(null);
                            setAmountPaid(udp.diet_plan_details?.final_amount || "");
                            setTransactionId(udp.transaction_id || "");
                          }}
                          className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                          <FiUpload /> {udp.payment_screenshot ? "Re-upload" : "Upload"} Payment Screenshot
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Other statuses */}
            {otherPlans.length > 0 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">All Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherPlans.map((udp) => (
                    <div
                      key={udp.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-white/[0.05] p-6"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {udp.diet_plan_details?.title}
                        </h3>
                        <div className="flex items-center gap-2">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadge(udp.status)}`}>
                             {udp.status.replace("_", " ")}
                           </span>
                           {udp.status === "active" && (
                             <button
                               onClick={() => setEditingPlanId(editingPlanId === udp.id ? null : udp.id)}
                               className={`p-1.5 rounded-lg transition-all ${editingPlanId === udp.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-indigo-600'}`}
                               title="Edit status"
                             >
                               <FiEdit size={14} />
                             </button>
                           )}
                        </div>
                      </div>
                      {udp.micro_kitchen_details && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          <FiHome size={12} /> {udp.micro_kitchen_details.brand_name}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">
                        {udp.start_date && udp.end_date && (
                          <>
                            {new Date(udp.start_date).toLocaleDateString()} –{" "}
                            {new Date(udp.end_date).toLocaleDateString()}
                          </>
                        )}
                      </p>

                      {udp.status === "active" && editingPlanId === udp.id && (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Update Plan Status</p>
                          <button
                            onClick={() => handleStatusUpdate(udp, "stopped")}
                            disabled={submitting}
                            className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30 transition-all uppercase tracking-wider"
                          >
                            <FiStopCircle size={14} /> Stop Plan Early
                          </button>
                          
                          {isCompletionAllowed(udp.end_date) ? (
                            <button
                              onClick={() => handleStatusUpdate(udp, "completed")}
                              disabled={submitting}
                              className="w-full py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-green-200 dark:border-green-900/30 transition-all uppercase tracking-wider"
                            >
                              <FiCheck size={14} /> Mark as Finished
                            </button>
                          ) : (
                            <div 
                              className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 cursor-help"
                              title={`You can mark this plan as completed on or after ${new Date(udp.end_date!).toLocaleDateString()}`}
                            >
                               <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center gap-1.5 leading-tight text-center">
                                 <FiClock className="shrink-0" /> Unlock {new Date(udp.end_date!).toLocaleDateString()}
                               </p>
                            </div>
                          )}
                        </div>
                      )}
                      {udp.original_micro_kitchen_details && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200/50">
                          <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1 mb-2">
                            <FiHome size={12} /> Kitchen Updated
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase line-through truncate max-w-[80px]">{udp.original_micro_kitchen_details.brand_name}</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase truncate max-w-[80px]">{udp.micro_kitchen_details?.brand_name}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                            Effective: {udp.micro_kitchen_effective_from || 'Scheduled'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plans.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <FiPackage className="size-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No plans suggested yet.</p>
                <p className="text-sm text-gray-400 mt-1">Your nutritionist will suggest plans based on your documents.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Approve Plan</h3>
            <p className="text-gray-500 text-sm mb-2">{approveModal.diet_plan_details?.title}</p>
            {approveModal.micro_kitchen_details && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-1">
                <FiHome size={14} /> {approveModal.micro_kitchen_details.brand_name}
              </p>
            )}
            {!approveModal.micro_kitchen_details && <div className="mb-6" />}
            <div className="flex gap-3">
              <button
                onClick={() => setApproveModal(null)}
                className="flex-1 py-3 rounded-xl font-bold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                {submitting ? "..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Reject Plan</h3>
            <p className="text-gray-500 text-sm mb-6">{rejectModal.diet_plan_details?.title}</p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Feedback (optional)
              </label>
              <textarea
                rows={3}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Let your nutritionist know why..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectFeedback("");
                }}
                className="flex-1 py-3 rounded-xl font-bold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold"
              >
                {submitting ? "..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Upload Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Upload Payment Screenshot</h3>
            <p className="text-gray-500 text-sm mb-2">{paymentModal.diet_plan_details?.title}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              ₹{paymentModal.diet_plan_details?.final_amount}
            </p>
            {paymentModal.payment_screenshot && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Currently uploaded</p>
                <a
                  href={getMediaUrl(paymentModal.payment_screenshot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:ring-2 hover:ring-indigo-500"
                >
                  <img
                    src={getMediaUrl(paymentModal.payment_screenshot)}
                    alt="Payment screenshot"
                    className="w-full max-h-48 object-cover object-top"
                  />
                </a>
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  value={amountPaid || paymentModal?.diet_plan_details?.final_amount || ""}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="UTR / Transaction Ref"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Payment Screenshot (optional) {paymentModal.payment_screenshot && "(re-upload to replace)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600"
                />
              </div>
            </div>
              {screenshotFile && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Preview</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                    <ScreenshotPreview file={screenshotFile} />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Upload a screenshot of your payment. Admin will verify and activate your plan.
              </p>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setPaymentModal(null);
                    setScreenshotFile(null);
                    setAmountPaid("");
                    setTransactionId("");
                  }}
                  className="flex-1 py-3 rounded-xl font-bold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPayment}
                  disabled={submitting || !transactionId}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? "..." : <> <FiUpload /> Submit Payment </>}
                </button>
              </div>
            </div>
          </div>
        )}
      <ConfirmationModal
        isOpen={!!statusUpdate}
        onClose={() => setStatusUpdate(null)}
        onConfirm={confirmStatusUpdate}
        isLoading={submitting}
        variant="info"
        title="Update Plan Status?"
        message={statusUpdate ? `Are you sure you want to mark "${statusUpdate.plan.diet_plan_details?.title || 'this plan'}" as ${statusUpdate.status.replace('_', ' ')}?` : ""}
        confirmText="Update Status"
      />
    </div>
  );
};

export default SuggestedPlansPage;
