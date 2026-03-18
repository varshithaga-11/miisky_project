import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

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
  health_conditions?: any;
  symptoms?: any;
  deficiencies?: any;
  autoimmune_diseases?: any;
  digestive_issues?: any;
  family_history?: any;
  has_diabetes?: boolean | null;
  has_thyroid?: boolean | null;
  has_bp?: "high" | "low" | "normal" | null;
  has_cardiac_issues?: boolean | null;
  is_anemic?: boolean | null;
  surgery_history?: boolean | null;
  on_medication?: boolean | null;
  alcohol_per_week?: number | null;
  smoking_per_day?: number | null;
  sleep_quality?: "fresh" | "not_fresh" | null;
  stress_level?: "low" | "medium" | "high" | null;
  falls_sick_frequency?: "once" | "twice" | "frequent" | null;
  food_preferences?: any;
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

