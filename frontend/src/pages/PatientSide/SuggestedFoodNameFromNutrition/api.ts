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

export type RecommendationDateFilterParams = {
  period?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type PatientFoodRecommendationListResponse = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page?: number;
  total_pages?: number;
  results: PatientFoodRecommendation[];
};

export const fetchMyFoodRecommendationsFromNutrition = async (
  filters?: RecommendationDateFilterParams
): Promise<PatientFoodRecommendationListResponse> => {
  const url = createApiUrl("api/patient-food-recommendation/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: filters,
  });
  const data = res.data as
    | PatientFoodRecommendation[]
    | {
        count?: number;
        next?: number | null;
        previous?: number | null;
        current_page?: number;
        total_pages?: number;
        results?: PatientFoodRecommendation[];
      };

  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }

  return {
    count: data.count ?? 0,
    next: typeof data.next === "number" ? data.next : null,
    previous: typeof data.previous === "number" ? data.previous : null,
    current_page: typeof data.current_page === "number" ? data.current_page : undefined,
    total_pages: typeof data.total_pages === "number" ? data.total_pages : undefined,
    results: Array.isArray(data.results) ? data.results : [],
  };
};

/** Lazy-load full nutrition composition for a FoodName (GET /api/foodname/<id>/nutrition-detail/). */
export const fetchFoodNameNutritionDetail = async (foodNameId: number): Promise<FoodNameNutritionDetail> => {
  const url = createApiUrl(`api/foodname/${foodNameId}/nutrition-detail/`);
  const res = await axios.get<FoodNameNutritionDetail>(url, { headers: await getAuthHeaders() });
  return res.data;
};
