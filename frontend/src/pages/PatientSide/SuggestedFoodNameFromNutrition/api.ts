import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type PatientFoodRecommendation = {
  id: number;
  patient: number;
  food: number;
  food_details?: { id: number; name: string; code?: string | null } | null;
  quantity: string | null;
  meal_time: string | null;
  notes: string | null;
  comment: string | null;
  recommended_by: number | null;
  recommended_by_details?: { id: number; first_name: string; last_name: string } | null;
  recommended_on: string;
};

export type FoodGroupDetail = {
  id: number;
  name: string;
};

/** Full catalog row + composition tables (nullable per section). */
export type FoodNameNutritionDetail = {
  id: number;
  name: string;
  code: string | null;
  created_at: string;
  food_group: number | null;
  food_group_detail: FoodGroupDetail | null;
  proximate: Record<string, unknown> | null;
  water_soluble_vitamins: Record<string, unknown> | null;
  fat_soluble_vitamins: Record<string, unknown> | null;
  carotenoids: Record<string, unknown> | null;
  minerals: Record<string, unknown> | null;
  sugars: Record<string, unknown> | null;
  amino_acids: Record<string, unknown> | null;
  organic_acids: Record<string, unknown> | null;
  polyphenols: Record<string, unknown> | null;
  phytochemicals: Record<string, unknown> | null;
  fatty_acid_profile: Record<string, unknown> | null;
};

export const fetchMyFoodRecommendationsFromNutrition = async (): Promise<PatientFoodRecommendation[]> => {
  const url = createApiUrl("api/patient-food-recommendation/");
  const res = await axios.get<PatientFoodRecommendation[]>(url, { headers: await getAuthHeaders() });
  return Array.isArray(res.data) ? res.data : [];
};

/** Lazy-load full nutrition composition for a FoodName (GET /api/foodname/<id>/nutrition-detail/). */
export const fetchFoodNameNutritionDetail = async (foodNameId: number): Promise<FoodNameNutritionDetail> => {
  const url = createApiUrl(`api/foodname/${foodNameId}/nutrition-detail/`);
  const res = await axios.get<FoodNameNutritionDetail>(url, { headers: await getAuthHeaders() });
  return res.data;
};
