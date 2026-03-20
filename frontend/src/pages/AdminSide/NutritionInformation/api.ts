import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

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
  // Robustly handle both paginated and non-paginated responses
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.results || [];
};
