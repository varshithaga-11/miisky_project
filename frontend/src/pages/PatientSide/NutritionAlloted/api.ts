import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type NutritionistWithProfile = {
  mapping_id?: number;
  assigned_on?: string;
  nutritionist?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    email: string;
    mobile?: string | null;
  } | null;
  profile?: {
    qualification?: string | null;
    years_of_experience?: string | null;
    experience?: string | null;
    license_number?: string | null;
    specializations?: string | null;
    certifications?: string | null;
    education?: string | null;
    languages?: string | null;
    social_media_links_website_links?: string | null;
    rating?: number;
    total_reviews?: number;
    available_modes?: string | null;
    is_verified?: boolean;
  } | null;
};

export type NutritionistRating = {
  id?: number;
  patient?: number;
  nutritionist: number;
  rating: number;
  review?: string;
  diet_plan?: number | null;
  created_at?: string;
  patient_details?: {
    id: number;
    first_name: string;
    last_name?: string;
  };
};

export const getMyNutritionist = async (): Promise<NutritionistWithProfile> => {
  const url = createApiUrl("api/usernutritionistmapping/my-nutritionist/");
  const response = await axios.get<NutritionistWithProfile>(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const submitRating = async (data: NutritionistRating): Promise<NutritionistRating> => {
  const url = createApiUrl("api/nutritionistrating/");
  const response = await axios.post<NutritionistRating>(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getMyRatings = async (): Promise<NutritionistRating[]> => {
  const url = createApiUrl("api/nutritionistrating/");
  const response = await axios.get<NutritionistRating[]>(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const getNutritionistReviews = async (nutritionistId: number): Promise<NutritionistRating[]> => {
  const url = createApiUrl("api/nutritionistrating/");
  const response = await axios.get<NutritionistRating[]>(url, { 
    headers: await getAuthHeaders(),
    params: { nutritionist: nutritionistId }
  });
  return response.data;
};

