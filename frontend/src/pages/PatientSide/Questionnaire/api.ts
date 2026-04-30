import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** One row from UserHealthCondition (API). */
export type QuestionnaireHealthConditionRow = {
  id: number;
  condition_id: number;
  name: string;
  category: string;
  has_condition: boolean;
  since_when?: string | null;
  comments?: string | null;
};

/** Sent when saving; slimmer than full GET row. */
export type QuestionnaireHealthConditionPayload = {
  condition_id: number;
  has_condition: boolean;
  since_when?: string | null;
  comments?: string | null;
};

export type MasterNameRow = { id: number; name: string };

/** Saving: master id, or id + optional fields stored on UserHabit / UserPhysicalActivity. */
export type HabitSyncPayload = number | { id: number; other_text?: string };
export type PhysicalActivitySyncPayload = number | { id: number; other_text?: string; duration_minutes?: number };

export type UserQuestionnaire = {
  id?: number;
  user?: number;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  work_type?: "sedentary" | "moderate" | "heavy" | null;
  meals_per_day?: number | null;
  meal_slots?: string[] | string | null;
  skips_meals?: boolean | null;
  snacks_between_meals?: boolean | null;
  food_source?: "home" | "canteen" | "hotel" | null;
  diet_pattern?: "veg" | "non_veg" | "eggetarian" | null;
  consumes_egg?: boolean | null;
  consumes_dairy?: boolean | null;
  food_allergy?: boolean | null;
  food_allergy_details?: string | null;
  fruits_per_day?: number | null;
  vegetables_per_day?: number | null;
  health_conditions?: QuestionnaireHealthConditionRow[] | string[] | QuestionnaireHealthConditionPayload[];
  /** Read: `{ id, name }[]` from API. Write: master ids (numbers) per backend sync. */
  symptoms?: Array<string | number | MasterNameRow>;
  deficiencies?: Array<string | number | MasterNameRow>;
  autoimmune_diseases?: Array<string | number | MasterNameRow>;
  digestive_issues?: Array<string | number | MasterNameRow>;
  skin_issues?: Array<string | number | MasterNameRow>;
  /** GET: `{ id, name, other_text?, ... }[]`. PUT: ids and/or sync objects. */
  habits?: Array<string | number | MasterNameRow | { id: number; other_text?: string }>;
  physical_activities?: Array<
    string | number | MasterNameRow | { id: number; other_text?: string; duration_minutes?: number }
  >;
  surgery_history?: boolean | null;
  surgery_details?: string | null;
  medicine_allergy?: boolean | null;
  medicine_allergy_details?: string | null;
  dietitian_consultation_before?: boolean | null;
  dietitian_consultation_name?: string | null;
  dietitian_consultation_specialty?: string | null;
  dietitian_consultation_phone?: string | null;
  dietitian_consultation_location?: string | null;
  dietitian_consultation_notes?: string | null;
  consulted_doctor?: boolean | null;
  consultant_doctor_name?: string | null;
  consultant_doctor_specialty?: string | null;
  consultant_doctor_phone?: string | null;
  other_health_concerns?: string | null;
  menstrual_pattern?: "heavy" | "very_less" | "none" | null;
  on_medication?: boolean | null;
  specify_medication?: string | null;
  sleep_quality?: "fresh" | "not_fresh" | null;
  stress_level?: "low" | "medium" | "high" | null;
  falls_sick_frequency?: "once" | "twice" | "frequent" | null;
  food_preferences?: string | null;
  additional_notes?: string | null;
  any_other_comments?: string | null;
  any_notes_for_care_team?: string | null;
  non_veg_frequency?: "daily" | "three_four_times_week" | "one_two_times_week" | "occasional" | null;
  religion?: string | null;
  caste?: string | null;
};

export type MasterRow = { id: number; name: string; category?: string };

async function getJson<T>(path: string): Promise<T> {
  const url = createApiUrl(path);
  const res = await axios.get<T>(url, { headers: await getAuthHeaders() });
  return res.data;
}

export const getMyQuestionnaire = async (): Promise<UserQuestionnaire> => {
  return getJson<UserQuestionnaire>("api/userquestionnaire/me/");
};

function sanitizeMealSlotsForSave(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    const out = value
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
    return out.length ? out : null;
  }
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw || raw === "[]") return null;
  if ((raw.startsWith("\"") && raw.endsWith("\"")) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return sanitizeMealSlotsForSave(raw.slice(1, -1));
  }
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const fixedRaw = raw.replace(/'/g, '"');
      return sanitizeMealSlotsForSave(JSON.parse(fixedRaw));
    } catch {
      return null;
    }
  }
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export const saveMyQuestionnaire = async (data: Partial<UserQuestionnaire>): Promise<UserQuestionnaire> => {
  const url = createApiUrl("api/userquestionnaire/me/");
  const slots = sanitizeMealSlotsForSave(data.meal_slots);
  // MultiSelectField often expects a comma-separated string in standard DRF setups
  const payload = { ...data, meal_slots: Array.isArray(slots) ? slots.join(",") : slots };
  const response = await axios.put(url, payload, { headers: await getAuthHeaders() });
  return response.data;
};

export const fetchHealthConditionMasters = (): Promise<MasterRow[]> =>
  getJson<MasterRow[]>("api/health-condition-master/all/");

export const fetchSymptomMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/symptom-master/all/");

export const fetchAutoimmuneMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/autoimmune-master/all/");

export const fetchDeficiencyMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/deficiency-master/all/");

export const fetchDigestiveIssueMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/digestive-issue-master/all/");

export const fetchSkinIssueMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/skin-issue-master/all/");

export const fetchHabitMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/habit-master/all/");

export const fetchActivityMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/activity-master/all/");
