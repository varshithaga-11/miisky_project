import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyQuestionnaire, saveMyQuestionnaire, UserQuestionnaire } from "./api";

const toJsonOrNull = (val: string) => {
  const trimmed = val.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
};

export default function PatientQuestionnairePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<UserQuestionnaire>>({});

  const [healthConditionsText, setHealthConditionsText] = useState("");
  const [symptomsText, setSymptomsText] = useState("");
  const [deficienciesText, setDeficienciesText] = useState("");
  const [autoimmuneText, setAutoimmuneText] = useState("");
  const [digestiveText, setDigestiveText] = useState("");
  const [familyHistoryText, setFamilyHistoryText] = useState("");
  const [foodPreferencesText, setFoodPreferencesText] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyQuestionnaire();
        setData(res || {});
        setHealthConditionsText(res?.health_conditions ? JSON.stringify(res.health_conditions, null, 2) : "");
        setSymptomsText(res?.symptoms ? JSON.stringify(res.symptoms, null, 2) : "");
        setDeficienciesText(res?.deficiencies ? JSON.stringify(res.deficiencies, null, 2) : "");
        setAutoimmuneText(res?.autoimmune_diseases ? JSON.stringify(res.autoimmune_diseases, null, 2) : "");
        setDigestiveText(res?.digestive_issues ? JSON.stringify(res.digestive_issues, null, 2) : "");
        setFamilyHistoryText(res?.family_history ? JSON.stringify(res.family_history, null, 2) : "");
        setFoodPreferencesText(res?.food_preferences ? JSON.stringify(res.food_preferences, null, 2) : "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (key: keyof UserQuestionnaire, value: any) => setData((p) => ({ ...p, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<UserQuestionnaire> = {
        ...data,
        health_conditions: toJsonOrNull(healthConditionsText),
        symptoms: toJsonOrNull(symptomsText),
        deficiencies: toJsonOrNull(deficienciesText),
        autoimmune_diseases: toJsonOrNull(autoimmuneText),
        digestive_issues: toJsonOrNull(digestiveText),
        family_history: toJsonOrNull(familyHistoryText),
        food_preferences: toJsonOrNull(foodPreferencesText),
      };
      await saveMyQuestionnaire(payload);
      toast.success("Questionnaire saved");
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("JSON")) toast.error("Invalid JSON in one of the JSON fields");
      else toast.error("Failed to save questionnaire");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Questionnaire" description="Patient questionnaire" />
      <PageBreadcrumb pageTitle="Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading questionnaire...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={data.age ?? ""} onChange={(e) => setField("age", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input id="height_cm" type="number" value={data.height_cm ?? ""} onChange={(e) => setField("height_cm", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input id="weight_kg" type="number" value={data.weight_kg ?? ""} onChange={(e) => setField("weight_kg", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="work_type">Work Type</Label>
              <Select
                value={data.work_type || ""}
                onChange={(val) => setField("work_type", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "sedentary", label: "Sedentary" },
                  { value: "moderate", label: "Moderate" },
                  { value: "heavy", label: "Heavy" },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="food_source">Food Source</Label>
              <Select
                value={data.food_source || ""}
                onChange={(val) => setField("food_source", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "home", label: "Home" },
                  { value: "canteen", label: "Canteen" },
                  { value: "hotel", label: "Hotel" },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="diet_pattern">Diet Pattern</Label>
              <Select
                value={data.diet_pattern || ""}
                onChange={(val) => setField("diet_pattern", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "veg", label: "Veg" },
                  { value: "non_veg", label: "Non Veg" },
                  { value: "eggetarian", label: "Eggetarian" },
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="meals_per_day">Meals per day</Label>
              <Input id="meals_per_day" type="number" value={data.meals_per_day ?? ""} onChange={(e) => setField("meals_per_day", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="fruits_per_day">Fruits per day</Label>
              <Input id="fruits_per_day" type="number" value={data.fruits_per_day ?? ""} onChange={(e) => setField("fruits_per_day", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="vegetables_per_day">Vegetables per day</Label>
              <Input id="vegetables_per_day" type="number" value={data.vegetables_per_day ?? ""} onChange={(e) => setField("vegetables_per_day", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ["physical_activity", "Physical activity"],
              ["skips_meals", "Skips meals"],
              ["snacks_between_meals", "Snacks between meals"],
              ["consumes_egg", "Consumes egg"],
              ["consumes_dairy", "Consumes dairy"],
              ["food_allergy", "Food allergy"],
              ["has_diabetes", "Has diabetes"],
              ["has_thyroid", "Has thyroid"],
              ["has_cardiac_issues", "Cardiac issues"],
              ["is_anemic", "Anemic"],
              ["surgery_history", "Surgery history"],
              ["on_medication", "On medication"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={!!(data as any)[key]}
                  onChange={(e) => setField(key as any, e.target.checked)}
                  className="w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="has_bp">Blood Pressure</Label>
              <Select
                value={data.has_bp || ""}
                onChange={(val) => setField("has_bp", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "high", label: "High" },
                  { value: "low", label: "Low" },
                  { value: "normal", label: "Normal" },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="sleep_quality">Sleep quality</Label>
              <Select
                value={data.sleep_quality || ""}
                onChange={(val) => setField("sleep_quality", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "fresh", label: "Fresh" },
                  { value: "not_fresh", label: "Not fresh" },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="stress_level">Stress level</Label>
              <Select
                value={data.stress_level || ""}
                onChange={(val) => setField("stress_level", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="alcohol_per_week">Alcohol / week</Label>
              <Input id="alcohol_per_week" type="number" value={data.alcohol_per_week ?? ""} onChange={(e) => setField("alcohol_per_week", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="smoking_per_day">Smoking / day</Label>
              <Input id="smoking_per_day" type="number" value={data.smoking_per_day ?? ""} onChange={(e) => setField("smoking_per_day", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="falls_sick_frequency">Falls sick frequency</Label>
              <Select
                value={data.falls_sick_frequency || ""}
                onChange={(val) => setField("falls_sick_frequency", (val as any) || null)}
                options={[
                  { value: "", label: "Select" },
                  { value: "once", label: "Once" },
                  { value: "twice", label: "Twice" },
                  { value: "frequent", label: "Frequent" },
                ]}
                className="w-full"
              />
            </div>
          </div>

          {data.food_allergy && (
            <div>
              <Label htmlFor="food_allergy_details">Food allergy details</Label>
              <textarea
                id="food_allergy_details"
                value={data.food_allergy_details || ""}
                onChange={(e) => setField("food_allergy_details", e.target.value)}
                className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                rows={3}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["health_conditions", "Health Conditions (JSON) ", healthConditionsText, setHealthConditionsText],
              ["symptoms", "Symptoms (JSON)", symptomsText, setSymptomsText],
              ["deficiencies", "Deficiencies (JSON)", deficienciesText, setDeficienciesText],
              ["autoimmune_diseases", "Autoimmune Diseases (JSON)", autoimmuneText, setAutoimmuneText],
              ["digestive_issues", "Digestive Issues (JSON)", digestiveText, setDigestiveText],
              ["family_history", "Family History (JSON)", familyHistoryText, setFamilyHistoryText],
              ["food_preferences", "Food Preferences (JSON)", foodPreferencesText, setFoodPreferencesText],
            ].map(([k, label, val, setter]) => (
              <div key={k}>
                <Label>{label}</Label>
                <textarea
                  value={val as string}
                  onChange={(e) => (setter as any)(e.target.value)}
                  className="w-full border rounded-lg p-3 font-mono text-xs dark:bg-gray-800 dark:border-gray-700"
                  rows={6}
                  placeholder='Example: ["item1","item2"] or {"key":["v1"]}'
                />
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="additional_notes">Additional notes</Label>
            <textarea
              id="additional_notes"
              value={data.additional_notes || ""}
              onChange={(e) => setField("additional_notes", e.target.value)}
              className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save Questionnaire"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

