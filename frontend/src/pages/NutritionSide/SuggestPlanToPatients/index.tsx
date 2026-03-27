import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  getMyPatients,
  getDietPlanList,
  getPatientReviews,
  suggestPlanToPatient,
  getSuggestedPlansForPatient,
  reassignMicroKitchenForPlan,
  REASSIGN_MICRO_KITCHEN_REASONS,
  MappedPatientResponse,
  NutritionistReview,
  UserDietPlan,
} from "./api";
import type { DietPlan } from "./api";
import { getApprovedMicroKitchens } from "../ListOfMicroKitchens/api";
import type { MicroKitchenProfile } from "../ListOfMicroKitchens/api";
import { toast, ToastContainer } from "react-toastify";
import { FiUsers, FiSend, FiCheckCircle, FiPackage, FiHome } from "react-icons/fi";
import DatePicker2 from "../../../components/form/date-picker2";

const SuggestPlanToPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<MappedPatientResponse[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<MappedPatientResponse | null>(null);
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [kitchens, setKitchens] = useState<MicroKitchenProfile[]>([]);
  const [reviews, setReviews] = useState<NutritionistReview[]>([]);
  const [suggestedPlans, setSuggestedPlans] = useState<UserDietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
  const [selectedKitchenId, setSelectedKitchenId] = useState<number | "">("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [switchKitchenPlanId, setSwitchKitchenPlanId] = useState<number | "">("");
  const [switchKitchenId, setSwitchKitchenId] = useState<number | "">("");
  const [switchReason, setSwitchReason] = useState<string>("");
  const [switchNotes, setSwitchNotes] = useState("");
  const [switchFromDate, setSwitchFromDate] = useState("");
  const [switchingKitchen, setSwitchingKitchen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [patientsData, plansData, kitchensData] = await Promise.all([
          getMyPatients(),
          getDietPlanList(1, 100).then((r) => r.results),
          getApprovedMicroKitchens().then((r) => r.results),
        ]);
        setPatients(patientsData);
        setPlans(plansData);
        setKitchens(kitchensData);
        if (patientsData.length > 0 && !selectedPatient) {
          setSelectedPatient(patientsData[0]);
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      const load = async () => {
        try {
          const [reviewsData, suggestedData] = await Promise.all([
            getPatientReviews(selectedPatient.user.id),
            getSuggestedPlansForPatient(selectedPatient.user.id),
          ]);
          setReviews(reviewsData);
          setSuggestedPlans(suggestedData);
          setSelectedPlanId("");
          setSelectedReviewId("");
          setNotes("");
          setSwitchKitchenPlanId("");
          setSwitchKitchenId("");
          setSwitchReason("");
          setSwitchNotes("");
          setSwitchFromDate("");
        } catch (err) {
          toast.error("Failed to load patient data");
        }
      };
      load();
    }
  }, [selectedPatient]);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedPlanId) {
      toast.warning("Please select a diet plan");
      return;
    }
    if (!selectedKitchenId) {
      toast.warning("Please select a micro kitchen");
      return;
    }
    setSubmitting(true);
    try {
      const selectedPlan = plans.find((p) => p.id === Number(selectedPlanId));
      
      const payload: {
        user: number;
        diet_plan: number;
        micro_kitchen?: number;
        review?: number;
        nutritionist_notes?: string;
        amount_paid?: string;
      } = {
        user: selectedPatient.user.id,
        diet_plan: Number(selectedPlanId),
        micro_kitchen: Number(selectedKitchenId),
        nutritionist_notes: notes.trim() || undefined,
        amount_paid: selectedPlan?.final_amount ? String(selectedPlan.final_amount) : undefined,
      };
      if (selectedReviewId) payload.review = Number(selectedReviewId);
      const created = await suggestPlanToPatient(payload);
      toast.success("Plan and kitchen suggested successfully");
      setSuggestedPlans((prev) => [created, ...prev]);
      setSelectedPlanId("");
      setSelectedKitchenId("");
      setSelectedReviewId("");
      setNotes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to suggest plan");
    } finally {
      setSubmitting(false);
    }
  };

  const switchablePlans = suggestedPlans.filter((p) =>
    ["approved", "active", "payment_pending"].includes(p.status)
  );

  const selectedSwitchPlan = switchablePlans.find((p) => p.id === Number(switchKitchenPlanId));

  const handleSwitchKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSwitchPlan) {
      toast.warning("Select a plan to switch kitchen");
      return;
    }
    if (!switchKitchenId || !switchReason || !switchFromDate) {
      toast.warning("Select new kitchen, reason, and switch date");
      return;
    }
    if (selectedSwitchPlan.start_date && switchFromDate < selectedSwitchPlan.start_date) {
      toast.warning("Switch date cannot be before plan start date");
      return;
    }
    if (selectedSwitchPlan.end_date && switchFromDate > selectedSwitchPlan.end_date) {
      toast.warning("Switch date cannot be after plan end date");
      return;
    }

    setSwitchingKitchen(true);
    try {
      const updated = await reassignMicroKitchenForPlan(selectedSwitchPlan.id, {
        new_micro_kitchen: Number(switchKitchenId),
        reason: switchReason as any,
        notes: switchNotes.trim() || undefined,
        effective_from: switchFromDate,
      });
      setSuggestedPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSwitchKitchenId("");
      setSwitchReason("");
      setSwitchNotes("");
      setSwitchFromDate(updated.micro_kitchen_effective_from || "");
      toast.success("Kitchen switched successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to switch kitchen");
    } finally {
      setSwitchingKitchen(false);
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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Suggest Plan & Kitchen" description="Suggest diet plan and micro kitchen to your patients in one step" />
      <PageBreadcrumb pageTitle="Suggest Plan & Kitchen" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar: Patient List */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05] h-full overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="mb-8">
                <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <FiUsers className="text-blue-500" /> My Patients
                </h1>
                <p className="text-gray-500 mt-1 font-medium text-xs">Select a patient to suggest a plan.</p>
              </div>
              <div className="space-y-4">
                {loading && (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-2xl" />
                    ))}
                  </div>
                )}
                {patients.map((mapping) => (
                  <button
                    key={mapping.user.id}
                    onClick={() => setSelectedPatient(mapping)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left ${
                      selectedPatient?.user.id === mapping.user.id
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
                        : "bg-gray-50 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        selectedPatient?.user.id === mapping.user.id ? "bg-white/20" : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                      }`}
                    >
                      <FiUsers size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm line-clamp-1">
                        {mapping.user.first_name} {mapping.user.last_name}
                      </p>
                      <p
                        className={`text-[10px] font-bold ${
                          selectedPatient?.user.id === mapping.user.id ? "text-blue-100" : "text-gray-400 uppercase tracking-tighter mt-1"
                        }`}
                      >
                        Joined: {new Date(mapping.assigned_on).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {selectedPatient ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white dark:bg-gray-800 rounded-[32px] border border-transparent dark:border-white/[0.05]">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                      {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                    </h2>
                    <p className="text-gray-500 font-medium">Suggest diet plan and micro kitchen in one step</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 border border-transparent dark:border-white/[0.05]">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiHome className="text-amber-500" /> Switch Kitchen (Mid-plan)
                  </h3>
                  <form onSubmit={handleSwitchKitchen} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <select
                      value={switchKitchenPlanId}
                      onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : "";
                        setSwitchKitchenPlanId(id);
                        const plan = switchablePlans.find((p) => p.id === Number(id));
                        setSwitchFromDate(plan?.start_date || "");
                      }}
                      className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-sm font-bold outline-none dark:text-white"
                    >
                      <option value="">Select plan</option>
                      {switchablePlans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.diet_plan_details?.title || `Plan #${p.id}`}
                        </option>
                      ))}
                    </select>
                    <select
                      value={switchKitchenId}
                      onChange={(e) => setSwitchKitchenId(e.target.value ? Number(e.target.value) : "")}
                      className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-sm font-bold outline-none dark:text-white"
                    >
                      <option value="">Select new kitchen</option>
                      {kitchens
                        .filter((k) => k.id !== selectedSwitchPlan?.micro_kitchen)
                        .map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.brand_name || `Kitchen #${k.id}`}
                          </option>
                        ))}
                    </select>
                    <select
                      value={switchReason}
                      onChange={(e) => setSwitchReason(e.target.value)}
                      className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-sm font-bold outline-none dark:text-white"
                    >
                      <option value="">Reason</option>
                      {REASSIGN_MICRO_KITCHEN_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <DatePicker2
                      id="switchFromDate"
                      label=""
                      value={switchFromDate}
                      onChange={(val) => setSwitchFromDate(val)}
                      minDate={selectedSwitchPlan?.start_date || undefined}
                      maxDate={selectedSwitchPlan?.end_date || undefined}
                      placeholder="Switch from date"
                    />
                    <button
                      type="submit"
                      disabled={switchingKitchen || !switchKitchenPlanId || !switchKitchenId || !switchReason || !switchFromDate}
                      className="px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-wider"
                    >
                      {switchingKitchen ? "Switching..." : "Switch"}
                    </button>
                    <div className="md:col-span-5">
                      <textarea
                        rows={2}
                        placeholder="Optional notes"
                        value={switchNotes}
                        onChange={(e) => setSwitchNotes(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white font-medium"
                      />
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Suggest Form */}
                  <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-white/[0.05]">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <FiPackage className="text-blue-500" /> Suggest Plan & Kitchen
                    </h3>
                    <form onSubmit={handleSuggest} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Diet Plan *</label>
                        <select
                          value={selectedPlanId}
                          onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : "")}
                          required
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                          <option value="">Select plan</option>
                          {plans.filter((p) => p.is_active !== false).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.code}) - ₹{p.final_amount} / {p.no_of_days} days
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Micro Kitchen *</label>
                        <select
                          value={selectedKitchenId}
                          onChange={(e) => setSelectedKitchenId(e.target.value ? Number(e.target.value) : "")}
                          required
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                          <option value="">Select kitchen</option>
                          {kitchens.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.brand_name} – {k.cuisine_type || "Kitchen"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link to review (optional)</label>
                        <select
                          value={selectedReviewId}
                          onChange={(e) => setSelectedReviewId(e.target.value ? Number(e.target.value) : "")}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                          <option value="">No specific review</option>
                          {reviews.map((r) => (
                            <option key={r.id} value={r.id}>
                              {new Date(r.created_on).toLocaleDateString()} - {r.comments?.slice(0, 40)}...
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notes for patient</label>
                        <textarea
                          rows={4}
                          placeholder="Why you recommend this plan based on their documents..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || !selectedPlanId || !selectedKitchenId}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all"
                      >
                        {submitting ? "Sending..." : "Suggest Plan & Kitchen"} <FiSend />
                      </button>
                    </form>
                  </div>

                  {/* Previously suggested plans */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <FiCheckCircle className="text-blue-500" /> Suggested Plans
                    </h3>
                    <div className="space-y-4">
                      {suggestedPlans.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
                          <p className="text-gray-500">No plans suggested yet for this patient.</p>
                        </div>
                      ) : (
                        suggestedPlans.map((udp) => (
                          <div
                            key={udp.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-transparent dark:border-white/[0.05] shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {udp.diet_plan_details?.title || "Plan"}
                                <span className="text-blue-600 dark:text-blue-400 font-black">
                                  ₹{udp.amount_paid || udp.diet_plan_details?.final_amount || "0"}
                                </span>
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadge(udp.status)}`}>
                                {udp.status.replace("_", " ")}
                              </span>
                            </div>
                            {udp.micro_kitchen_details && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                                <FiHome size={12} /> {udp.micro_kitchen_details.brand_name}
                              </p>
                            )}
                            <p className="text-[11px] text-gray-500 mb-2">
                              Suggested: {new Date(udp.suggested_on).toLocaleDateString()}
                            </p>
                            {udp.nutritionist_notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">{udp.nutritionist_notes}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center h-[400px] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[40px]">
                <FiUsers className="size-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-black text-gray-400">Select a Patient</h2>
                <p className="text-gray-400 font-medium">Choose a patient to suggest a diet plan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestPlanToPatientsPage;
