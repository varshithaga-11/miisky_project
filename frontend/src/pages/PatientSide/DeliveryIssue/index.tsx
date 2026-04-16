import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker2 from "../../../components/form/date-picker2";
import { toast, ToastContainer } from "react-toastify";
import { fetchMealsByPlanDate, fetchMyDietPlans, submitDeliveryIssue, UserDietPlanRow, UserMealLite } from "./api";

const PatientDeliveryIssuePage: React.FC = () => {
  const [plans, setPlans] = useState<UserDietPlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [meals, setMeals] = useState<UserMealLite[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<number | "">("");
  const [issueType, setIssueType] = useState<"not_home" | "wrong_address" | "food_damaged" | "late_delivery" | "kitchen_delay" | "other">("late_delivery");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoadingPlans(true);
      try {
        const data = await fetchMyDietPlans();
        setPlans(data);
      } catch {
        toast.error("Failed to load your diet plans");
      } finally {
        setLoadingPlans(false);
      }
    };
    run();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const loadMeals = async () => {
    if (!selectedPlanId || !selectedDate) {
      toast.error("Select plan and date first");
      return;
    }
    setLoadingMeals(true);
    setSelectedMealId("");
    try {
      const rows = await fetchMealsByPlanDate(Number(selectedPlanId), selectedDate);
      setMeals(rows);
      if (!rows.length) {
        toast.info("No meals found for this plan date");
      }
    } catch {
      toast.error("Failed to load meals");
    } finally {
      setLoadingMeals(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMealId) {
      toast.error("Please select a meal");
      return;
    }
    setSubmitting(true);
    try {
      await submitDeliveryIssue({
        user_meal: Number(selectedMealId),
        issue_type: issueType,
        description,
      });
      toast.success("Delivery issue submitted");
      setDescription("");
      setIssueType("late_delivery");
    } catch {
      toast.error("Failed to submit delivery issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Delivery Issues" description="Report delivery issues for planned meals" />
      <PageBreadcrumb pageTitle="Delivery Issues" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Report delivery issue by plan and date
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loadingPlans}
            >
              <option value="">Select plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.diet_plan_details?.title || "Diet plan"} ({p.status})
                </option>
              ))}
            </select>

            <DatePicker2
              id="delivery-issue-date"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Select date"
              minDate={selectedPlan?.start_date || undefined}
              maxDate={selectedPlan?.end_date || undefined}
            />

            <button
              type="button"
              onClick={loadMeals}
              className="px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-wider text-xs disabled:opacity-50"
              disabled={loadingMeals || !selectedPlanId || !selectedDate}
            >
              {loadingMeals ? "Loading..." : "Load Meals"}
            </button>
          </div>

          {selectedPlan && (
            <p className="text-xs text-gray-500">
              Plan window: {selectedPlan.start_date || "-"} to {selectedPlan.end_date || "-"}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedMealId}
              onChange={(e) => setSelectedMealId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select meal</option>
              {meals.map((meal) => (
                <option key={meal.id} value={meal.id}>
                  #{meal.id} - {meal.meal_type_details?.name || "Meal"} - {meal.food_details?.name || "Food"} ({meal.status})
                </option>
              ))}
            </select>

            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as typeof issueType)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="not_home">Patient Not Home</option>
              <option value="wrong_address">Wrong Address</option>
              <option value="food_damaged">Food Damaged</option>
              <option value="late_delivery">Late Delivery</option>
              <option value="kitchen_delay">Kitchen Delay</option>
              <option value="other">Other</option>
            </select>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            className="w-full min-h-[130px] px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !selectedMealId}
              className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-wider text-xs disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Delivery Issue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDeliveryIssuePage;
