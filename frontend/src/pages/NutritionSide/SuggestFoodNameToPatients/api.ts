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
  food_details?: { id: number; name: string; code?: string | null, image?: string | null } | null;
  quantity: string | null;
  meal_time?: number | null;
  meal_time_details?: { id: number; name: string } | null;
  notes?: string | null;
  comment?: string | null;
  recommended_by?: number;
  recommended_by_details?: { id: number; username: string } | null;
  recommended_on?: string;
};

export type PatientFoodRecommendationPage = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: PatientFoodRecommendation[];
};

export { getMealTypeList };
export type { MealType };

export const fetchAllFoodRecommendations = async (
  params: {
    patient?: number | string;
    period?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<PatientFoodRecommendationPage> => {
  const { patient, period, start_date, end_date, search, page = 1, limit = 10 } = params;
  
  let query = `page=${page}&limit=${limit}`;
  if (patient) query += `&patient=${patient}`;
  if (period) query += `&period=${period}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;

  const url = createApiUrl(`api/patient-food-recommendation/?${query}`);
  const res = await axios.get<PatientFoodRecommendationPage | PatientFoodRecommendation[]>(url, {
    headers: await getAuthHeaders(),
  });

  if (Array.isArray(res.data)) {
    const list = res.data;
    return {
      count: list.length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: list,
    };
  }

  return {
    count: res.data.count ?? 0,
    next: res.data.next ?? null,
    previous: res.data.previous ?? null,
    current_page: res.data.current_page ?? page,
    total_pages: res.data.total_pages ?? 1,
    results: Array.isArray(res.data.results) ? res.data.results : [],
  };
};

export const fetchFoodRecommendationsForPatient = async (
  patientUserId: number,
  page: number = 1,
  limit: number = 10
): Promise<PatientFoodRecommendationPage> => {
  return fetchAllFoodRecommendations({ patient: patientUserId, page, limit });
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
