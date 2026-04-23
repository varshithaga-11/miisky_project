import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { AllottedPlanPayoutPatientRow } from "../shared/AdminAllottedPlanPayoutsPanel";

export type NutritionistProfile = {
  id: number;
  user: number;
  user_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    photo: string | null;
  } | null;
  qualification: string | null;
  years_of_experience: string | null;
  experience: string | null;
  license_number: string | null;
  specializations: string | null;
  certifications: string | null;
  education: string | null;
  languages: string | null;
  rating: number;
  total_reviews: number;
  available_modes: string | null;
  is_verified: boolean;
  allotted_patients: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  }[];
};

export const getNutritionistInformation = async (): Promise<NutritionistProfile[]> => {
  const url = createApiUrl("api/nutritionistprofile/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.results || [];
};

export const getAdminNutritionistList = async (page: number = 1, search: string = "", limit: number = 10): Promise<any> => {
    const url = createApiUrl(`api/admin-nutritionists/?page=${page}&search=${search}&limit=${limit}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getAdminNutritionistDetails = async (id: number): Promise<any> => {
    const url = createApiUrl(`api/admin-nutritionists/${id}/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistPatientsNoPaginate = async (nutritionistId: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-patients-nopaginate/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistDietPlansNoPaginate = async (nutritionistId: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-dietplans-optimized-nopaginate/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistDietPlansOptimizedNoPaginate = async (nutritionistId: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-dietplans-optimized-nopaginate/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistMealsNoPaginate = async (nutritionistId: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-meals-nopaginate/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistMeetingsNoPaginate = async (nutritionistId: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-meetings-nopaginate/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistMeetingsPaginated = async (nutritionistId: number, page: number = 1, limit: number = 10): Promise<any> => {
    const url = createApiUrl(`api/admin-nutritionist-meetings-paginated/?nutritionist=${nutritionistId}&page=${page}&limit=${limit}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistReviewsPaginated = async (nutritionistId: number, page: number = 1, limit: number = 10): Promise<any> => {
    const url = createApiUrl(`api/admin-nutritionist-reviews-paginated/?nutritionist=${nutritionistId}&page=${page}&limit=${limit}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistTicketsPaginated = async (userId: number, page: number = 1, limit: number = 10): Promise<any> => {
    const url = createApiUrl(`api/admin-nutritionist-tickets-paginated/?user=${userId}&page=${page}&limit=${limit}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistMealsWithMonth = async (nutritionistId: number, month: number, year: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-meals-nopaginate/?nutritionist=${nutritionistId}&month=${month}&year=${year}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};
export const getNutritionistPayoutsNoPaginate = async (nutritionistId: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-payouts-nopaginate/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getNutritionistAvailabilityNoPaginate = async (nutritionistId: number): Promise<any[]> => {
    const url = createApiUrl(`api/admin-nutritionist-availability-nopaginate/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

/** Admin hub: allotted patients only, diet-plan payout lines for this nutritionist (user id). */
export async function getNutritionAllottedPlanPayouts(
    nutritionUserId: number,
    search = ""
): Promise<AllottedPlanPayoutPatientRow[]> {
    const q = search.trim();
    const sp = q ? `&search=${encodeURIComponent(q)}` : "";
    const url = createApiUrl(
        `api/admin/nutrition-allotted-plan-payouts/?nutrition_id=${nutritionUserId}${sp}`
    );
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return (response.data?.results ?? []) as AllottedPlanPayoutPatientRow[];
}
