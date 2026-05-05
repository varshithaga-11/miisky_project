import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type MicroKitchenProfile = {
  id: number;
  brand_name: string | null;
  kitchen_code: string | null;
  cuisine_type: string | null;
  meal_type: string | null;
  photo_exterior: string | null;
  religion: string | null;
  caste: string | null;
  languages: string | null;
  time_available: string | null;
  status: string;
  user_details: {
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  latitude?: number | null;
  longitude?: number | null;
  latest_inspection: {
    overall_score: number | null;
    status: string;
    inspection_date: string;
    notes: string | null;
    recommendation: string | null;
  } | null;
};

export interface MicroKitchenListResponse {
  results: MicroKitchenProfile[];
  count: number;
}

export const getApprovedMicroKitchens = async (search = ""): Promise<MicroKitchenListResponse> => {
  // For nutritionists, show approved ones as well
  const url = createApiUrl(`api/microkitchenprofile/?status=approved&search=${search}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};
