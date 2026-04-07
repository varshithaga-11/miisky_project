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
  /** Structured rows from junction table + HealthConditionMaster */
  health_conditions?: QuestionnaireHealthConditionRow[] | string[];
  symptoms?: string[];
  deficiencies?: string[];
  autoimmune_diseases?: string[];
  digestive_issues?: string[];
  skin_issues?: string[];
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

export const getMyQuestionnaire = async (): Promise<UserQuestionnaire> => {
  const url = createApiUrl("api/userquestionnaire/me/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const saveMyQuestionnaire = async (data: Partial<UserQuestionnaire>): Promise<UserQuestionnaire> => {
  const url = createApiUrl("api/userquestionnaire/me/");
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};
