import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type MicroKitchenProfile = {
  id: number;
  brand_name: string | null;
  kitchen_code: string | null;
  is_verified: boolean;
  user: number;
  user_details: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
  } | null;
  // Other fields from the model
  fssai_no: string | null;
  pan_no: string | null;
  gst_no: string | null;
  bank_name: string | null;
  acc_no: string | null;
  ifsc_code: string | null;
  kitchen_area: number | null;
  platform_area: number | null;
  water_source: string | null;
  cuisine_type: string | null;
  meal_type: string | null;
  lpg_cylinders: number | null;
  no_of_staff: number | null;
  time_available: string | null;
  purification_type: string | null;
  has_pets: boolean;
  pet_details: string | null;
  has_pests: boolean;
  pest_details: string | null;
  pest_control_frequency: string | null;
  has_hobs: boolean;
  has_refrigerator: boolean;
  has_mixer: boolean;
  has_grinder: boolean;
  has_blender: boolean;
  other_equipment: string | null;
  about_you: string | null;
  passion_for_cooking: string | null;
  health_info: string | null;
  constraints: string | null;
  photo_exterior: string | null;
  photo_entrance: string | null;
  photo_kitchen: string | null;
  photo_platform: string | null;
  fssai_cert: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type MicroKitchenListResponse = {
  count: number;
  next: number | null;
  previous: number | null;
  results: MicroKitchenProfile[];
  total_pages: number;
};

export const getMicroKitchenList = async (page = 1, search = "", verified?: boolean): Promise<MicroKitchenListResponse> => {
  let url = createApiUrl(`api/microkitchenprofile/?page=${page}&search=${search}`);
  if (verified !== undefined) {
    url += `&is_verified=${verified}`;
  }
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const toggleMicroKitchenVerification = async (id: number, isVerified: boolean): Promise<MicroKitchenProfile> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  const response = await axios.patch(url, { is_verified: isVerified }, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteMicroKitchen = async (id: number): Promise<void> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};
