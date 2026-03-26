import React, { useMemo, useState } from "react";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import {
  REASSIGN_REASONS,
  reassignNutritionist,
  SimpleUser,
  UserNutritionMapping,
} from "./api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  users: SimpleUser[];
  mappings: UserNutritionMapping[];
  nutritionists: SimpleUser[];
}

const labelForUser = (u: SimpleUser) =>
  u.first_name || u.last_name
    ? `${u.first_name || ""} ${u.last_name || ""} (${u.username})`
    : u.username;

const ReassignNutrition: React.FC<Props> = ({
  onClose,
  onSuccess,
  users,
  mappings,
  nutritionists,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [newNutritionistId, setNewNutritionistId] = useState("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const usersById = useMemo(() => {
    const m: Record<number, SimpleUser> = {};
    users.forEach((u) => {
      m[u.id] = u;
    });
    return m;
  }, [users]);

  const activeMappingsByUser = useMemo(() => {
    const m: Record<number, UserNutritionMapping> = {};
    mappings.filter((x) => x.is_active).forEach((x) => {
      m[x.user] = x;
    });
    return m;
  }, [mappings]);

  const mappedPatientOptions = useMemo(() => {
    return users
      .filter((u) => u.role === "patient" && activeMappingsByUser[u.id])
      .sort((a, b) => labelForUser(a).localeCompare(labelForUser(b)));
  }, [users, activeMappingsByUser]);

  const currentMapping = patientId ? activeMappingsByUser[Number(patientId)] : undefined;
  const currentNutritionist = currentMapping
    ? usersById[currentMapping.nutritionist]
    : undefined;

  const newNutritionistOptions = useMemo(() => {
    const curId = currentMapping?.nutritionist;
    return nutritionists.filter((n) => n.id !== curId);
  }, [nutritionists, currentMapping]);

  const canGoStep2 = Boolean(patientId);
  const canSubmit =
    patientId &&
    newNutritionistId &&
    reason &&
    (reason !== "other" || notes.trim().length > 0) &&
    effectiveFrom;

  const handleNext = () => {
    if (step === 1 && !canGoStep2) {
      toast.error("Select a patient");
      return;
    }
    if (step === 2) {
      if (!newNutritionistId) {
        toast.error("Select the new nutritionist");
        return;
      }
      setStep(3);
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !reason) {
      toast.error("Fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await reassignNutritionist({
        user: Number(patientId),
        new_nutritionist: Number(newNutritionistId),
        reason: reason as (typeof REASSIGN_REASONS)[number]["value"],
        notes: notes.trim() || undefined,
        effective_from: effectiveFrom,
      });
      toast.success("Nutritionist reassigned successfully");
      setTimeout(() => onSuccess(), 600);
    } catch (err: unknown) {
      console.error(err);
      const ax = err as { response?: { data?: unknown } };
      const data = ax.response?.data;
      if (typeof data === "string") toast.error(data);
      else if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        if (typeof d.detail === "string") toast.error(d.detail);
        else toast.error("Failed to reassign");
      } else toast.error("Failed to reassign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute top-2 right-4 text-3xl leading-none text-gray-600 dark:text-gray-300 hover:text-gray-900">
          ×
        </button>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Reassign nutritionist</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Step {step} of 3 — map the patient to a new nutritionist, record the reason, and set when meals switch to the new assignee.
        </p>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full ${step >= n ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}`}
            />
          ))}
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-4">
          {step === 1 && (
            <div>
              <Label>Patient (currently mapped)</Label>
              <Select
                value={patientId}
                onChange={(val) => setPatientId(val)}
                options={[
                  { value: "", label: "Select patient" },
                  ...mappedPatientOptions.map((p) => ({
                    value: String(p.id),
                    label: labelForUser(p),
                  })),
                ]}
                className="w-full"
              />
              {mappedPatientOptions.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">No mapped patients available to reassign.</p>
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] p-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Current nutritionist</span>
                <div className="font-medium text-gray-900 dark:text-white mt-1">
                  {currentNutritionist ? labelForUser(currentNutritionist) : "—"}
                </div>
              </div>
              <div>
                <Label>New nutritionist</Label>
                <Select
                  value={newNutritionistId}
                  onChange={(val) => setNewNutritionistId(val)}
                  options={[
                    { value: "", label: "Select nutritionist" },
                    ...newNutritionistOptions.map((n) => ({
                      value: String(n.id),
                      label: labelForUser(n),
                    })),
                  ]}
                  className="w-full"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>Reason</Label>
                <Select
                  value={reason}
                  onChange={(val) => setReason(val)}
                  options={[{ value: "", label: "Select reason" }, ...REASSIGN_REASONS.map((r) => ({ value: r.value, label: r.label }))]}
                  className="w-full"
                />
              </div>
              {reason === "other" && (
                <div>
                  <Label>Notes (required for &quot;Other&quot;)</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                    placeholder="Describe the reason…"
                  />
                </div>
              )}
              <div>
                <Label>Effective from (meals assigned from this date)</Label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div className="flex justify-between gap-2 pt-4">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext} disabled={step === 1 && !canGoStep2}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading || !canSubmit}>
                  {loading ? "Saving…" : "Reassign"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default ReassignNutrition;
