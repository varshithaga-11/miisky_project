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

export const fetchMyFoodRecommendationsFromNutrition = async (): Promise<PatientFoodRecommendation[]> => {
  const url = createApiUrl("api/patient-food-recommendation/");
  const res = await axios.get<PatientFoodRecommendation[]>(url, { headers: await getAuthHeaders() });
  return Array.isArray(res.data) ? res.data : [];
};
