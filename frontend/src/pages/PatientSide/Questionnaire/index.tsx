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

const normalizeItem = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, " "); // collapse multiple spaces

/** Skip empty tokens and placeholders like "None" so we never persist them as master names. */
const PLACEHOLDER_TOKENS = new Set(["none", "n/a", "na", "nil", "-", "no", "nothing"]);

const toListOrNull = (val: string) => {
  const items = val
    .split(",")
    .map(normalizeItem)
    .filter((s) => {
      if (!s) return false;
      if (PLACEHOLDER_TOKENS.has(s.toLowerCase())) return false;
      return true;
    });
  return items.length ? items : null;
};

function healthConditionsToText(res: UserQuestionnaire | undefined): string {
  const hc = res?.health_conditions;
  if (!Array.isArray(hc) || hc.length === 0) return "";
  return hc
    .map((x) => (typeof x === "string" ? x : (x as { name?: string }).name))
    .filter(Boolean)
    .join(", ");
}

function foodPreferencesToText(fp: unknown): string {
  if (fp == null) return "";
  if (Array.isArray(fp)) return fp.map(String).join(", ");
  if (typeof fp === "object") {
    const parts: string[] = [];
    for (const v of Object.values(fp as Record<string, unknown>)) {
      if (Array.isArray(v)) parts.push(...v.map(String));
    }
    return parts.join(", ");
  }
  return String(fp);
}

export default function PatientQuestionnairePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<UserQuestionnaire>>({});

  const [healthConditionsText, setHealthConditionsText] = useState("");
  const [symptomsText, setSymptomsText] = useState("");
  const [deficienciesText, setDeficienciesText] = useState("");
  const [autoimmuneText, setAutoimmuneText] = useState("");
  const [digestiveText, setDigestiveText] = useState("");
  const [skinIssuesText, setSkinIssuesText] = useState("");
  const [foodPreferencesText, setFoodPreferencesText] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyQuestionnaire();
        setData(res || {});
        setHealthConditionsText(healthConditionsToText(res));
        setSymptomsText(Array.isArray(res?.symptoms) ? res!.symptoms.join(", ") : "");
        setDeficienciesText(Array.isArray(res?.deficiencies) ? res!.deficiencies.join(", ") : "");
        setAutoimmuneText(Array.isArray(res?.autoimmune_diseases) ? res!.autoimmune_diseases.join(", ") : "");
        setDigestiveText(Array.isArray(res?.digestive_issues) ? res!.digestive_issues.join(", ") : "");
        setSkinIssuesText(Array.isArray(res?.skin_issues) ? res!.skin_issues.join(", ") : "");
        setFoodPreferencesText(foodPreferencesToText(res?.food_preferences));
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
        health_conditions: toListOrNull(healthConditionsText) as unknown as UserQuestionnaire["health_conditions"],
        symptoms: toListOrNull(symptomsText) as string[] | undefined,
        deficiencies: toListOrNull(deficienciesText) as string[] | undefined,
        autoimmune_diseases: toListOrNull(autoimmuneText) as string[] | undefined,
        digestive_issues: toListOrNull(digestiveText) as string[] | undefined,
        skin_issues: toListOrNull(skinIssuesText) as string[] | undefined,
        food_preferences: toListOrNull(foodPreferencesText) as unknown,
      };
      await saveMyQuestionnaire(payload);
      toast.success("Questionnaire saved");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save questionnaire");
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="alcohol_per_week">Alcohol / week</Label>
              <Input id="alcohol_per_week" type="number" value={data.alcohol_per_week ?? ""} onChange={(e) => setField("alcohol_per_week", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="smoking_per_day">Smoking / day</Label>
              <Input id="smoking_per_day" type="number" value={data.smoking_per_day ?? ""} onChange={(e) => setField("smoking_per_day", e.target.value ? Number(e.target.value) : null)} />
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
            <div>
              <Label>Health conditions</Label>
              <Input
                value={healthConditionsText}
                onChange={(e) => setHealthConditionsText(e.target.value)}
                placeholder="Diabetes, Thyroid"
              />
            </div>
            <div>
              <Label>Symptoms</Label>
              <Input
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="Fatigue, Hair loss"
              />
            </div>
            <div>
              <Label>Deficiencies</Label>
              <Input
                value={deficienciesText}
                onChange={(e) => setDeficienciesText(e.target.value)}
                placeholder="Vitamin B12, Iron"
              />
            </div>
            <div>
              <Label>Autoimmune diseases</Label>
              <Input
                value={autoimmuneText}
                onChange={(e) => setAutoimmuneText(e.target.value)}
                placeholder="Psoriasis, Celiac"
              />
            </div>
            <div>
              <Label>Digestive issues</Label>
              <Input
                value={digestiveText}
                onChange={(e) => setDigestiveText(e.target.value)}
                placeholder="Acidity, Bloating"
              />
            </div>
            <div>
              <Label>Skin issues</Label>
              <Input
                value={skinIssuesText}
                onChange={(e) => setSkinIssuesText(e.target.value)}
                placeholder="Leave blank if none — e.g. Eczema, Psoriasis"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Food preferences</Label>
              <Input
                value={foodPreferencesText}
                onChange={(e) => setFoodPreferencesText(e.target.value)}
                placeholder="Onion, Garlic, Banana, Apple"
              />
            </div>
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
