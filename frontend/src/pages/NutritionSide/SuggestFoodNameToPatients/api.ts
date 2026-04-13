import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { getMealTypeList, MealType } from "../../AdminSide/MealType/mealtypeapi";

export type PatientFoodRecommendation = {
  id: number;
  patient: number;
  patient_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  food: number;
  food_details?: { id: number; name: string; code?: string | null } | null;
  quantity: string | null;
  meal_time?: number | null;
  meal_time_details?: { id: number; name: string } | null;
  notes?: string | null;
  comment?: string | null;
  recommended_by?: number;
  recommended_by_details?: { id: number; username: string } | null;
  recommended_on?: string;
};

export { getMealTypeList };
export type { MealType };

export const fetchFoodRecommendationsForPatient = async (
  patientUserId: number
): Promise<PatientFoodRecommendation[]> => {
  const url = createApiUrl(`api/patient-food-recommendation/?patient=${patientUserId}`);
  const res = await axios.get<PatientFoodRecommendation[]>(url, { headers: await getAuthHeaders() });
  return Array.isArray(res.data) ? res.data : [];
};

export const createFoodRecommendation = async (payload: {
  patient: number;
  food: number;
  quantity?: string | null;
  meal_time?: number | null;
  notes?: string | null;
  comment?: string | null;
}): Promise<PatientFoodRecommendation> => {
  const url = createApiUrl("api/patient-food-recommendation/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const deleteFoodRecommendation = async (id: number): Promise<void> => {
  const url = createApiUrl(`api/patient-food-recommendation/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};
