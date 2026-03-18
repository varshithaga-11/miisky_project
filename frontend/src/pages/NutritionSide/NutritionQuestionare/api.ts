import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type NutritionistProfile = {
  id?: number;
  user?: number;
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
};

export const getMyNutritionProfile = async (): Promise<NutritionistProfile> => {
  const url = createApiUrl("api/nutritionistprofile/me/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const saveMyNutritionProfile = async (data: Partial<NutritionistProfile>): Promise<NutritionistProfile> => {
  const url = createApiUrl("api/nutritionistprofile/me/");
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

