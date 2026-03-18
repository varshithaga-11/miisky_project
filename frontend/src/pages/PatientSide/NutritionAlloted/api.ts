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

export const getMyNutritionist = async (): Promise<NutritionistWithProfile> => {
  const url = createApiUrl("api/usernutritionistmapping/my-nutritionist/");
  const response = await axios.get<NutritionistWithProfile>(url, { headers: await getAuthHeaders() });
  return response.data;
};

