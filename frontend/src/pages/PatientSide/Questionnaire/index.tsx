import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  fetchHabitMasters,
  fetchActivityMasters,
} from "./api";
import DatePicker2 from "../../../components/form/date-picker2";
import { Modal } from "../../../components/ui/modal";

const STEPS = [
  { id: 1, title: "Basic & lifestyle" },
  { id: 2, title: "Health conditions" },
  { id: 3, title: "Related selections" },
  { id: 4, title: "Food habits & wellbeing" },
] as const;

type HcRowState = { has: boolean; since: string; comments: string };

/** Matches admin-configured master row named "Other" (case-insensitive). */
function isOtherMasterName(name: string): boolean {
  return name.trim().toLowerCase() === "other";
}

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

function namesToIds(
  names: (string | number | { id?: number; name?: string })[] | undefined,
  masters: { id: number; name: string }[]
): number[] {
  if (!names?.length) return [];
  const byName = new Map(masters.map((m) => [m.name.trim().toLowerCase(), m.id]));
  const ids: number[] = [];
  for (const n of names) {
    if (typeof n === "number") {
      if (masters.some((m) => m.id === n)) ids.push(n);
      continue;
    }
    if (typeof n === "object" && n !== null && "id" in n && typeof (n as { id: number }).id === "number") {
      const oid = (n as { id: number }).id;
      if (masters.some((m) => m.id === oid)) ids.push(oid);
      continue;
    }
    if (typeof n === "string") {
      const id = byName.get(n.trim().toLowerCase());
      if (id != null) ids.push(id);
    }
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

function normalizeMealSlots(value: unknown): string[] {
  const fromArray = (arr: unknown[]): string[] =>
    arr
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);

  if (Array.isArray(value)) return fromArray(value);
  if (typeof value !== "string") return [];
  const raw = value.trim();
  if (!raw || raw === "[]") return [];

  // Handle quoted JSON payloads like "\"[]\"" from legacy rows.
  if (
    (raw.startsWith("\"") && raw.endsWith("\"")) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return normalizeMealSlots(raw.slice(1, -1));
  }

  if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return fromArray(parsed);
      return [];
    } catch {
      return [];
    }
  }

  // Fallback: comma-separated text.
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
  const [habitMasters, setHabitMasters] = useState<{ id: number; name: string }[]>([]);
  const [activityMasters, setActivityMasters] = useState<{ id: number; name: string }[]>([]);

  const [hcRows, setHcRows] = useState<Record<number, HcRowState>>({});

  const [hcMastersLoaded, setHcMastersLoaded] = useState(false);
  const [step3MastersLoaded, setStep3MastersLoaded] = useState(false);
  const fetchingStep2Ref = useRef(false);
  const fetchingStep3Ref = useRef(false);
  const questionnaireLoadedRef = useRef(false);

  // Source-of-truth mapping tracks (ensures we init state from API exactly once per category)
  const initializedMap = useRef<Record<string, boolean>>({});

  const [symptomIds, setSymptomIds] = useState<number[]>([]);
  const [autoimmuneIds, setAutoimmuneIds] = useState<number[]>([]);
  const [deficiencyIds, setDeficiencyIds] = useState<number[]>([]);
  const [digestiveIds, setDigestiveIds] = useState<number[]>([]);
  const [skinIds, setSkinIds] = useState<number[]>([]);
  const [habitIds, setHabitIds] = useState<number[]>([]);
  const [physicalActivityIds, setPhysicalActivityIds] = useState<number[]>([]);
  const [habitExtras, setHabitExtras] = useState<Record<number, { other_text: string }>>({});
  const [activityExtras, setActivityExtras] = useState<Record<number, { other_text: string; duration_minutes?: string }>>({});
  const [otherModal, setOtherModal] = useState<{
    kind: "habit" | "activity";
    master: { id: number; name: string };
    draftText: string;
    draftDuration: string;
  } | null>(null);

  const [foodPreferencesText, setFoodPreferencesText] = useState("");

  const setField = (key: keyof UserQuestionnaire, value: unknown) => setData((p) => ({ ...p, [key]: value }));

  // 1. Initial Load (Base Data + Step 1 Masters)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [res, hm, actm] = await Promise.all([
          getMyQuestionnaire(),
          fetchHabitMasters(),
          fetchActivityMasters(),
        ]);

        setData({ ...(res || {}), meal_slots: normalizeMealSlots(res?.meal_slots) });
        setHabitMasters(hm);
        setActivityMasters(actm);
        questionnaireLoadedRef.current = true;

        // Initialize Step 1 states
        if (!initializedMap.current.habits) {
          setHabitIds(namesToIds(res?.habits, hm));
          const hx: Record<number, { other_text: string }> = {};
          if (Array.isArray(res.habits)) {
            for (const row of res.habits) {
              if (row && typeof row === "object" && "id" in row) {
                const r = row as { id: number; other_text?: string | null };
                if (r.other_text) hx[r.id] = { other_text: String(r.other_text) };
              }
            }
          }
          setHabitExtras(hx);
          initializedMap.current.habits = true;
        }

        if (!initializedMap.current.activities) {
          setPhysicalActivityIds(namesToIds(res?.physical_activities, actm));
          const ax: Record<number, { other_text: string; duration_minutes?: string }> = {};
          if (Array.isArray(res.physical_activities)) {
            for (const row of res.physical_activities) {
              if (row && typeof row === "object" && "id" in row) {
                const r = row as { id: number; other_text?: string | null; duration_minutes?: number | null };
                if (r.other_text || r.duration_minutes != null) {
                  ax[r.id] = {
                    other_text: r.other_text ? String(r.other_text) : "",
                    ...(r.duration_minutes != null ? { duration_minutes: String(r.duration_minutes) } : {}),
                  };
                }
              }
            }
          }
          setActivityExtras(ax);
          initializedMap.current.activities = true;
        }

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

  // 2. Step-based Lazy Loading
  useEffect(() => {
    if (step === 2 && !hcMastersLoaded && !fetchingStep2Ref.current) {
      (async () => {
        fetchingStep2Ref.current = true;
        try {
          const hcm = await fetchHealthConditionMasters();
          setHcMasters(hcm);
          setHcMastersLoaded(true);
        } catch (err) {
          console.error("Error loading Step 2 masters:", err);
        } finally {
          fetchingStep2Ref.current = false;
        }
      })();
    } else if (step === 3 && !step3MastersLoaded && !fetchingStep3Ref.current) {
      (async () => {
        fetchingStep3Ref.current = true;
        try {
          const [sm, am, dm, dig, sk] = await Promise.all([
            fetchSymptomMasters(),
            fetchAutoimmuneMasters(),
            fetchDeficiencyMasters(),
            fetchDigestiveIssueMasters(),
            fetchSkinIssueMasters(),
          ]);
          setSymptomMasters(sm);
          setAutoimmuneMasters(am);
          setDeficiencyMasters(dm);
          setDigestiveMasters(dig);
          setSkinMasters(sk);
          setStep3MastersLoaded(true);
        } catch (err) {
          console.error("Error loading Step 3 masters:", err);
        } finally {
          fetchingStep3Ref.current = false;
        }
      })();
    }
  }, [step, hcMastersLoaded, step3MastersLoaded]);

  // 3. Deferred Initializations (run once prerequisite masters are loaded)
  useEffect(() => {
    if (hcMastersLoaded && questionnaireLoadedRef.current && !initializedMap.current.hc) {
      setHcRows(initHcRows(hcMasters, data.health_conditions));
      initializedMap.current.hc = true;
    }
  }, [hcMastersLoaded, data.health_conditions, hcMasters]);

  useEffect(() => {
    if (step3MastersLoaded && questionnaireLoadedRef.current) {
      if (!initializedMap.current.symptoms) {
        setSymptomIds(namesToIds(data.symptoms, symptomMasters));
        initializedMap.current.symptoms = true;
      }
      if (!initializedMap.current.autoimmune) {
        setAutoimmuneIds(namesToIds(data.autoimmune_diseases, autoimmuneMasters));
        initializedMap.current.autoimmune = true;
      }
      if (!initializedMap.current.deficiencies) {
        setDeficiencyIds(namesToIds(data.deficiencies, deficiencyMasters));
        initializedMap.current.deficiencies = true;
      }
      if (!initializedMap.current.digestive) {
        setDigestiveIds(namesToIds(data.digestive_issues, digestiveMasters));
        initializedMap.current.digestive = true;
      }
      if (!initializedMap.current.skin) {
        setSkinIds(namesToIds(data.skin_issues, skinMasters));
        initializedMap.current.skin = true;
      }
    }
  }, [step3MastersLoaded, data, symptomMasters, autoimmuneMasters, deficiencyMasters, digestiveMasters, skinMasters]);

  const toggleId = (list: number[], setList: (v: number[]) => void, id: number) => {
    if (list.includes(id)) setList(list.filter((x) => x !== id));
    else setList([...list, id]);
  };

  const toggleHabit = (m: { id: number; name: string }, checked: boolean) => {
    if (!checked) {
      setHabitIds((prev) => prev.filter((x) => x !== m.id));
      setHabitExtras((prev) => {
        const n = { ...prev };
        delete n[m.id];
        return n;
      });
      return;
    }
    if (isOtherMasterName(m.name)) {
      setOtherModal({
        kind: "habit",
        master: m,
        draftText: habitExtras[m.id]?.other_text ?? "",
        draftDuration: "",
      });
      return;
    }
    setHabitIds((prev) => (prev.includes(m.id) ? prev : [...prev, m.id]));
  };

  const toggleActivity = (m: { id: number; name: string }, checked: boolean) => {
    if (!checked) {
      setPhysicalActivityIds((prev) => prev.filter((x) => x !== m.id));
      setActivityExtras((prev) => {
        const n = { ...prev };
        delete n[m.id];
        return n;
      });
      return;
    }
    if (isOtherMasterName(m.name)) {
      setOtherModal({
        kind: "activity",
        master: m,
        draftText: activityExtras[m.id]?.other_text ?? "",
        draftDuration: activityExtras[m.id]?.duration_minutes ?? "",
      });
      return;
    }
    setPhysicalActivityIds((prev) => (prev.includes(m.id) ? prev : [...prev, m.id]));
  };

  const confirmOtherModal = () => {
    if (!otherModal) return;
    const text = otherModal.draftText.trim();
    if (!text) {
      toast.error("Please add a short description for “Other”.");
      return;
    }
    if (otherModal.kind === "habit") {
      setHabitIds((prev) => (prev.includes(otherModal.master.id) ? prev : [...prev, otherModal.master.id]));
      setHabitExtras((prev) => ({ ...prev, [otherModal.master.id]: { other_text: text } }));
    } else {
      const dur = otherModal.draftDuration.trim();
      setPhysicalActivityIds((prev) =>
        prev.includes(otherModal.master.id) ? prev : [...prev, otherModal.master.id]
      );
      setActivityExtras((prev) => ({
        ...prev,
        [otherModal.master.id]: { other_text: text, ...(dur ? { duration_minutes: dur } : {}) },
      }));
    }
    setOtherModal(null);
  };

  const buildPayload = useCallback((): Partial<UserQuestionnaire> => {
    const foodPrefParts =
      foodPreferencesText.trim().length > 0
        ? foodPreferencesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    const food_preferences = foodPrefParts.length ? foodPrefParts.join(", ") : null;

    const health_conditions = hcMasters.map((m) => {
      const r = hcRows[m.id] || { has: false, since: "", comments: "" };
      return {
        condition_id: m.id,
        has_condition: r.has,
        since_when: r.since || null,
        comments: r.comments || null,
      };
    });

    const habitsPayload: Array<number | { id: number; other_text?: string }> = habitIds.map((hid) => {
      const m = habitMasters.find((x) => x.id === hid);
      const t = habitExtras[hid]?.other_text?.trim();
      if (m && isOtherMasterName(m.name)) {
        return { id: hid, ...(t ? { other_text: t } : {}) };
      }
      if (t) return { id: hid, other_text: t };
      return hid;
    });

    const activitiesPayload: Array<number | { id: number; other_text?: string; duration_minutes?: number }> =
      physicalActivityIds.map((aid) => {
        const m = activityMasters.find((x) => x.id === aid);
        const t = activityExtras[aid]?.other_text?.trim();
        const dm = activityExtras[aid]?.duration_minutes?.trim();
        const dur = dm ? parseInt(dm, 10) : NaN;
        const durOk = Number.isFinite(dur);
        if (m && isOtherMasterName(m.name)) {
          const o: { id: number; other_text?: string; duration_minutes?: number } = { id: aid };
          if (t) o.other_text = t;
          if (durOk) o.duration_minutes = dur;
          return o;
        }
        if (t || durOk) {
          const o: { id: number; other_text?: string; duration_minutes?: number } = { id: aid };
          if (t) o.other_text = t;
          if (durOk) o.duration_minutes = dur;
          return o;
        }
        return aid;
      });

    const normalizedMealSlots = normalizeMealSlots(data.meal_slots);

    return {
      ...data,
      // MultiSelectField rejects quoted JSON-like values; send null when empty.
      meal_slots: normalizedMealSlots.length > 0 ? normalizedMealSlots : null,
      health_conditions,
      symptoms: symptomIds,
      autoimmune_diseases: autoimmuneIds,
      deficiencies: deficiencyIds,
      digestive_issues: digestiveIds,
      skin_issues: skinIds,
      habits: habitsPayload,
      physical_activities: activitiesPayload,
      food_preferences,
    };
  }, [
    data,
    hcMasters,
    hcRows,
    symptomIds,
    autoimmuneIds,
    deficiencyIds,
    digestiveIds,
    skinIds,
    habitIds,
    physicalActivityIds,
    habitMasters,
    activityMasters,
    habitExtras,
    activityExtras,
    foodPreferencesText,
  ]);

  const onSave = async () => {
    for (const hid of habitIds) {
      const m = habitMasters.find((x) => x.id === hid);
      if (m && isOtherMasterName(m.name) && !habitExtras[hid]?.other_text?.trim()) {
        toast.error('Add details for “Other” under lifestyle habits (or uncheck it).');
        return;
      }
    }
    for (const aid of physicalActivityIds) {
      const m = activityMasters.find((x) => x.id === aid);
      if (m && isOtherMasterName(m.name) && !activityExtras[aid]?.other_text?.trim()) {
        toast.error('Add details for “Other” under physical activities (or uncheck it).');
        return;
      }
    }
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

      <Modal
        isOpen={otherModal !== null}
        onClose={() => setOtherModal(null)}
        className="max-w-lg p-6 shadow-xl dark:bg-gray-900"
      >
        {otherModal ? (
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {otherModal.kind === "habit" ? "Describe this habit" : "Describe this activity"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {otherModal.kind === "habit"
                ? "Briefly describe the lifestyle habit that is not covered by the other options."
                : "Briefly describe the type of movement or exercise that is not listed above."}
            </p>
            <div>
              <Label htmlFor="other-modal-text">Details *</Label>
              <textarea
                id="other-modal-text"
                rows={4}
                value={otherModal.draftText}
                onChange={(e) => setOtherModal((prev) => (prev ? { ...prev, draftText: e.target.value } : prev))}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm"
                placeholder="e.g. recreational cricket twice a week"
              />
            </div>
            {otherModal.kind === "activity" ? (
              <div>
                <Label htmlFor="other-modal-duration">Typical duration (minutes per session, optional)</Label>
                <Input
                  id="other-modal-duration"
                  type="number"
                  min={0}
                  value={otherModal.draftDuration}
                  onChange={(e) => setOtherModal((prev) => (prev ? { ...prev, draftDuration: e.target.value } : prev))}
                  className="mt-1"
                />
              </div>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOtherModal(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={confirmOtherModal}>
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select the activities and habits that apply to you. Your care team maintains these lists. If you need something
                that is not listed, choose <strong>Other</strong> and describe it in the pop-up.
              </p>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-3">
                <p className="font-medium text-gray-900 dark:text-white">Movement &amp; exercise</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  What types of movement or exercise do you do on a typical week? (Select all that apply.)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activityMasters.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={physicalActivityIds.includes(m.id)}
                        onChange={(e) => toggleActivity(m, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>
                        {m.name}
                        {isOtherMasterName(m.name) ? (
                          <span className="text-gray-400"> (details in pop-up)</span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-3">
                <p className="font-medium text-gray-900 dark:text-white">Lifestyle habits</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Which habits describe your usual lifestyle? (For example: sleep patterns, substance use, meal skipping—your
                  clinic configures the exact options.)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {habitMasters.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={habitIds.includes(m.id)}
                        onChange={(e) => toggleHabit(m, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>
                        {m.name}
                        {isOtherMasterName(m.name) ? <span className="text-gray-400"> (details in pop-up)</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
