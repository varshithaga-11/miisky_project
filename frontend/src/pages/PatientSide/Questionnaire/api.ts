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

export type UserQuestionnaire = {
  id?: number;
  user?: number;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  work_type?: "sedentary" | "moderate" | "heavy" | null;
  physical_activity?: boolean | null;
  meals_per_day?: number | null;
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
  /** Read: names from API. Write: master ids (numbers) or names (strings) per backend sync. */
  symptoms?: Array<string | number>;
  deficiencies?: Array<string | number>;
  autoimmune_diseases?: Array<string | number>;
  digestive_issues?: Array<string | number>;
  skin_issues?: Array<string | number>;
  surgery_history?: boolean | null;
  on_medication?: boolean | null;
  alcohol_per_week?: number | null;
  smoking_per_day?: number | null;
  sleep_quality?: "fresh" | "not_fresh" | null;
  stress_level?: "low" | "medium" | "high" | null;
  falls_sick_frequency?: "once" | "twice" | "frequent" | null;
  food_preferences?: unknown;
  additional_notes?: string | null;
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

export const saveMyQuestionnaire = async (data: Partial<UserQuestionnaire>): Promise<UserQuestionnaire> => {
  const url = createApiUrl("api/userquestionnaire/me/");
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
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
