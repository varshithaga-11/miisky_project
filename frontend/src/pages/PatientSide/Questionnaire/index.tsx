import { useCallback, useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getMyQuestionnaire,
  saveMyQuestionnaire,
  UserQuestionnaire,
  QuestionnaireHealthConditionRow,
  MasterRow,
  fetchHealthConditionMasters,
  fetchSymptomMasters,
  fetchAutoimmuneMasters,
  fetchDeficiencyMasters,
  fetchDigestiveIssueMasters,
  fetchSkinIssueMasters,
} from "./api";
import DatePicker2 from "../../../components/form/date-picker2";

const STEPS = [
  { id: 1, title: "Basic & lifestyle" },
  { id: 2, title: "Health conditions" },
  { id: 3, title: "Related selections" },
  { id: 4, title: "Food habits & wellbeing" },
] as const;

type HcRowState = { has: boolean; since: string; comments: string };

function triSelect(
  value: boolean | null | undefined,
  onChange: (v: boolean | null) => void,
  id: string
) {
  const v = value === null || value === undefined ? "" : value ? "yes" : "no";
  return (
    <select
      id={id}
      value={v}
      onChange={(e) => {
        const s = e.target.value;
        onChange(s === "" ? null : s === "yes");
      }}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm"
    >
      <option value=""></option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  );
}

function namesToIds(names: (string | number)[] | undefined, masters: { id: number; name: string }[]): number[] {
  if (!names?.length) return [];
  const byName = new Map(masters.map((m) => [m.name.trim().toLowerCase(), m.id]));
  const ids: number[] = [];
  for (const n of names) {
    if (typeof n === "number") {
      if (masters.some((m) => m.id === n)) ids.push(n);
      continue;
    }
    const id = byName.get(n.trim().toLowerCase());
    if (id != null) ids.push(id);
  }
  return ids;
}

function initHcRows(masters: MasterRow[], hc: UserQuestionnaire["health_conditions"]): Record<number, HcRowState> {
  const byCid = new Map<number, QuestionnaireHealthConditionRow>();
  if (Array.isArray(hc)) {
    for (const row of hc) {
      if (typeof row === "object" && row && "condition_id" in row) {
        byCid.set((row as QuestionnaireHealthConditionRow).condition_id, row as QuestionnaireHealthConditionRow);
      }
    }
  }
  const out: Record<number, HcRowState> = {};
  for (const m of masters) {
    const ex = byCid.get(m.id);
    out[m.id] = {
      has: ex?.has_condition ?? false,
      since: ex?.since_when ? String(ex.since_when).slice(0, 10) : "",
      comments: ex?.comments ?? "",
    };
  }
  return out;
}

export default function PatientQuestionnairePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserQuestionnaire>>({});

  const [hcMasters, setHcMasters] = useState<MasterRow[]>([]);
  const [symptomMasters, setSymptomMasters] = useState<{ id: number; name: string }[]>([]);
  const [autoimmuneMasters, setAutoimmuneMasters] = useState<{ id: number; name: string }[]>([]);
  const [deficiencyMasters, setDeficiencyMasters] = useState<{ id: number; name: string }[]>([]);
  const [digestiveMasters, setDigestiveMasters] = useState<{ id: number; name: string }[]>([]);
  const [skinMasters, setSkinMasters] = useState<{ id: number; name: string }[]>([]);

  const [hcRows, setHcRows] = useState<Record<number, HcRowState>>({});

  const [symptomIds, setSymptomIds] = useState<number[]>([]);
  const [autoimmuneIds, setAutoimmuneIds] = useState<number[]>([]);
  const [deficiencyIds, setDeficiencyIds] = useState<number[]>([]);
  const [digestiveIds, setDigestiveIds] = useState<number[]>([]);
  const [skinIds, setSkinIds] = useState<number[]>([]);

  const [foodPreferencesText, setFoodPreferencesText] = useState("");

  const setField = (key: keyof UserQuestionnaire, value: unknown) => setData((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [
          res,
          hcm,
          sm,
          am,
          dm,
          dig,
          sk,
        ] = await Promise.all([
          getMyQuestionnaire(),
          fetchHealthConditionMasters(),
          fetchSymptomMasters(),
          fetchAutoimmuneMasters(),
          fetchDeficiencyMasters(),
          fetchDigestiveIssueMasters(),
          fetchSkinIssueMasters(),
        ]);

        setData(res || {});
        setHcMasters(hcm);
        setSymptomMasters(sm);
        setAutoimmuneMasters(am);
        setDeficiencyMasters(dm);
        setDigestiveMasters(dig);
        setSkinMasters(sk);

        setHcRows(initHcRows(hcm, res?.health_conditions));

        setSymptomIds(namesToIds(res?.symptoms, sm));
        setAutoimmuneIds(namesToIds(res?.autoimmune_diseases, am));
        setDeficiencyIds(namesToIds(res?.deficiencies, dm));
        setDigestiveIds(namesToIds(res?.digestive_issues, dig));
        setSkinIds(namesToIds(res?.skin_issues, sk));

        setFoodPreferencesText(
          res?.food_preferences == null
            ? ""
            : Array.isArray(res.food_preferences)
              ? (res.food_preferences as string[]).join(", ")
              : typeof res.food_preferences === "object"
                ? JSON.stringify(res.food_preferences)
                : String(res.food_preferences)
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleId = (list: number[], setList: (v: number[]) => void, id: number) => {
    if (list.includes(id)) setList(list.filter((x) => x !== id));
    else setList([...list, id]);
  };

  const buildPayload = useCallback((): Partial<UserQuestionnaire> => {
    const foodPref =
      foodPreferencesText.trim().length > 0
        ? foodPreferencesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

    const health_conditions = hcMasters.map((m) => {
      const r = hcRows[m.id] || { has: false, since: "", comments: "" };
      return {
        condition_id: m.id,
        has_condition: r.has,
        since_when: r.since || null,
        comments: r.comments || null,
      };
    });

    return {
      ...data,
      health_conditions,
      symptoms: symptomIds,
      autoimmune_diseases: autoimmuneIds,
      deficiencies: deficiencyIds,
      digestive_issues: digestiveIds,
      skin_issues: skinIds,
      food_preferences: foodPref && foodPref.length ? foodPref : null,
    };
  }, [data, hcMasters, hcRows, symptomIds, autoimmuneIds, deficiencyIds, digestiveIds, skinIds, foodPreferencesText]);

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      await saveMyQuestionnaire(payload);
      toast.success("Questionnaire saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const updateHcRow = (conditionId: number, patch: Partial<HcRowState>) => {
    setHcRows((prev) => {
      const base = prev[conditionId] ?? { has: false, since: "", comments: "" };
      return { ...prev, [conditionId]: { ...base, ...patch } };
    });
  };

  const masterCheckboxSection = (
    title: string,
    masters: { id: number; name: string }[],
    ids: number[],
    setIds: (v: number[]) => void
  ) => (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-3">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {masters.map((m) => (
          <label key={m.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={ids.includes(m.id)}
              onChange={() => toggleId(ids, setIds, m.id)}
              className="rounded border-gray-300"
            />
            {m.name}
          </label>
        ))}
      </div>
    </div>
  );

  const groupedConditions = useMemo(() => {
    const byCat = new Map<string, MasterRow[]>();
    for (const m of hcMasters) {
      const c = m.category || "other";
      if (!byCat.has(c)) byCat.set(c, []);
      byCat.get(c)!.push(m);
    }
    return Array.from(byCat.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [hcMasters]);

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Questionnaire" description="Patient questionnaire" />
      <PageBreadcrumb pageTitle="Questionnaire" />

      {loading ? (
        <div className="p-6 text-gray-600 dark:text-gray-300">Loading questionnaire...</div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  step === s.id
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {s.id}. {s.title}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. Basic details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={data.age ?? ""}
                    onChange={(e) => setField("age", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    value={data.height_cm ?? ""}
                    onChange={(e) => setField("height_cm", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight_kg">Weight (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    value={data.weight_kg ?? ""}
                    onChange={(e) => setField("weight_kg", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
              <div>
                <Label>Type of work</Label>
                <div className="mt-2 flex flex-wrap gap-4">
                  {(
                    [
                      ["sedentary", "Sedentary"],
                      ["moderate", "Moderate"],
                      ["heavy", "Heavy"],
                    ] as const
                  ).map(([val, label]) => (
                    <label key={val} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="work_type"
                        checked={data.work_type === val}
                        onChange={() => setField("work_type", val)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-4">2. Lifestyle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="physical_activity">Physical activity</Label>
                  {triSelect(data.physical_activity, (v) => setField("physical_activity", v), "physical_activity")}
                </div>
                <div>
                  <Label htmlFor="meals_per_day">Meals per day</Label>
                  <Select
                    value={data.meals_per_day != null ? String(data.meals_per_day) : ""}
                    onChange={(val) =>
                      setField("meals_per_day", val === "" ? null : Number.parseInt(String(val), 10))
                    }
                    options={[
                      { value: "", label: "Select" },
                      ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) })),
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="skips_meals">Skip meals?</Label>
                  {triSelect(data.skips_meals, (v) => setField("skips_meals", v), "skips_meals")}
                </div>
                <div>
                  <Label htmlFor="snacks_between_meals">Snacks between meals?</Label>
                  {triSelect(data.snacks_between_meals, (v) => setField("snacks_between_meals", v), "snacks_between_meals")}
                </div>
                <div className="md:col-span-2">
                  <Label>Food source</Label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {(
                      [
                        ["home", "Home"],
                        ["canteen", "Canteen"],
                        ["hotel", "Hotel"],
                      ] as const
                    ).map(([val, label]) => (
                      <label key={val} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="food_source"
                          checked={data.food_source === val}
                          onChange={() => setField("food_source", val)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health conditions</h2>
              {hcMasters.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/40">
                        <th className="text-left p-3 font-medium">Condition</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-center p-3 font-medium w-28">Yes</th>
                        <th className="text-center p-3 font-medium w-28">No</th>
                        <th className="text-left p-3 font-medium min-w-[200px]">Since when</th>
                        <th className="text-left p-3 font-medium min-w-[140px]">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedConditions.flatMap(([cat, rows]) =>
                        rows.map((m) => {
                          const row = hcRows[m.id] || { has: false, since: "", comments: "" };
                          return (
                            <tr key={m.id} className="border-b border-gray-100 dark:border-white/5">
                              <td className="p-2 align-top">{m.name}</td>
                              <td className="p-2 align-top text-gray-500 capitalize">{cat}</td>
                              <td className="p-2 text-center">
                                <input
                                  type="radio"
                                  name={`hc-${m.id}`}
                                  checked={row.has === true}
                                  onChange={() => updateHcRow(m.id, { has: true })}
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="radio"
                                  name={`hc-${m.id}`}
                                  checked={row.has === false}
                                  onChange={() => updateHcRow(m.id, { has: false, since: "", comments: "" })}
                                />
                              </td>
                              <td className="p-2 align-top">
                                {row.has ? (
                                  <DatePicker2
                                    id={`hc-since-${m.id}`}
                                    value={row.since}
                                    onChange={(date) => updateHcRow(m.id, { since: date })}
                                  />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-2 py-1 text-xs"
                                  value={row.comments}
                                  disabled={!row.has}
                                  onChange={(e) => updateHcRow(m.id, { comments: e.target.value })}
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Related selections</h2>
              {masterCheckboxSection("Autoimmune diseases", autoimmuneMasters, autoimmuneIds, setAutoimmuneIds)}
              {masterCheckboxSection("Symptoms", symptomMasters, symptomIds, setSymptomIds)}
              {masterCheckboxSection("Vitamin / mineral deficiencies", deficiencyMasters, deficiencyIds, setDeficiencyIds)}
              {masterCheckboxSection("Digestive issues", digestiveMasters, digestiveIds, setDigestiveIds)}
              {masterCheckboxSection("Skin issues", skinMasters, skinIds, setSkinIds)}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Food habits</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Diet pattern</Label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {(
                      [
                        ["veg", "Veg"],
                        ["non_veg", "Non Veg"],
                        ["eggetarian", "Eggetarian"],
                      ] as const
                    ).map(([val, label]) => (
                      <label key={val} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="diet_pattern"
                          checked={data.diet_pattern === val}
                          onChange={() => setField("diet_pattern", val)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="consumes_egg">Consume eggs?</Label>
                  {triSelect(data.consumes_egg, (v) => setField("consumes_egg", v), "consumes_egg")}
                </div>
                <div>
                  <Label htmlFor="consumes_dairy">Consume milk / dairy?</Label>
                  {triSelect(data.consumes_dairy, (v) => setField("consumes_dairy", v), "consumes_dairy")}
                </div>
                <div>
                  <Label htmlFor="food_allergy">Any food allergy?</Label>
                  {triSelect(data.food_allergy, (v) => setField("food_allergy", v), "food_allergy")}
                </div>
                <div>
                  <Label htmlFor="fruits_per_day">Fruits per day</Label>
                  <Input
                    id="fruits_per_day"
                    type="number"
                    min={0}
                    value={data.fruits_per_day ?? ""}
                    onChange={(e) => setField("fruits_per_day", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="vegetables_per_day">Vegetables per day</Label>
                  <Input
                    id="vegetables_per_day"
                    type="number"
                    min={0}
                    value={data.vegetables_per_day ?? ""}
                    onChange={(e) => setField("vegetables_per_day", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
              {data.food_allergy === true && (
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

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">Medical history</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="surgery_history">History of surgery?</Label>
                  {triSelect(data.surgery_history, (v) => setField("surgery_history", v), "surgery_history")}
                </div>
                <div>
                  <Label htmlFor="on_medication">On medication?</Label>
                  {triSelect(data.on_medication, (v) => setField("on_medication", v), "on_medication")}
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Habits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alcohol_per_week">Alcohol (per week)</Label>
                  <Input
                    id="alcohol_per_week"
                    type="number"
                    min={0}
                    value={data.alcohol_per_week ?? ""}
                    onChange={(e) => setField("alcohol_per_week", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="smoking_per_day">Smoking (per day)</Label>
                  <Input
                    id="smoking_per_day"
                    type="number"
                    min={0}
                    value={data.smoking_per_day ?? ""}
                    onChange={(e) => setField("smoking_per_day", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Well-being</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sleep_quality">Sleep quality</Label>
                  <Select
                    value={data.sleep_quality || ""}
                    onChange={(val) => setField("sleep_quality", val || null)}
                    options={[
                      { value: "", label: "Select" },
                      { value: "fresh", label: "Fresh" },
                      { value: "not_fresh", label: "Not Fresh" },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="stress_level">Stress level</Label>
                  <Select
                    value={data.stress_level || ""}
                    onChange={(val) => setField("stress_level", val || null)}
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
                  <Label htmlFor="falls_sick_frequency">How often do you fall sick?</Label>
                  <Select
                    value={data.falls_sick_frequency || ""}
                    onChange={(val) => setField("falls_sick_frequency", val || null)}
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

              <div>
                <Label htmlFor="food_preferences">Food preferences (comma-separated)</Label>
                <Input
                  id="food_preferences"
                  value={foodPreferencesText}
                  onChange={(e) => setFoodPreferencesText(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="additional_notes">Additional notes</Label>
                <textarea
                  id="additional_notes"
                  value={data.additional_notes || ""}
                  onChange={(e) => setField("additional_notes", e.target.value)}
                  className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700"
                  rows={4}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex gap-2">
              <Button variant="outline" type="button" disabled={step <= 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
                Previous
              </Button>
              <Button variant="outline" type="button" disabled={step >= 4} onClick={() => setStep((s) => Math.min(4, s + 1))}>
                Next
              </Button>
            </div>
            <Button type="button" onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save questionnaire"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
