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

type PaginatedResponse<T> = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
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

export const updateRating = async (
  ratingId: number,
  data: Partial<NutritionistRating>
): Promise<NutritionistRating> => {
  const url = createApiUrl(`api/nutritionistrating/${ratingId}/`);
  const response = await axios.patch<NutritionistRating>(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getMyRatings = async (): Promise<NutritionistRating[]> => {
  const url = createApiUrl("api/nutritionistrating/");
  const response = await axios.get<NutritionistRating[]>(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const getNutritionistReviews = async (
  nutritionistId: number,
  page = 1,
  limit = 5
): Promise<PaginatedResponse<NutritionistRating>> => {
  const url = createApiUrl("api/nutritionistrating/");
  const response = await axios.get<PaginatedResponse<NutritionistRating> | NutritionistRating[]>(url, { 
    headers: await getAuthHeaders(),
    params: { nutritionist: nutritionistId, page, limit }
  });
  const data = response.data;

  // Backward compatibility if backend returns array.
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: data,
    };
  }

  return {
    count: data.count ?? 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    current_page: data.current_page ?? page,
    total_pages: data.total_pages ?? 1,
    results: Array.isArray(data.results) ? data.results : [],
  };
};

