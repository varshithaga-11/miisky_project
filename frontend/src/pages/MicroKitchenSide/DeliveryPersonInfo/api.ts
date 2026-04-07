import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type KitchenDeliveryProfile = {
  id: number;
  user: number | null;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    mobile?: string | null;
    username?: string | null;
  } | null;
  vehicle_type?: string | null;
  other_vehicle_name?: string | null;
  vehicle_details?: string | null;
  register_number?: string | null;
  license_number?: string | null;
  license_copy?: string | null;
  rc_copy?: string | null;
  insurance_copy?: string | null;
  aadhar_number?: string | null;
  aadhar_image?: string | null;
  pan_number?: string | null;
  pan_image?: string | null;
  puc_image?: string | null;
  is_verified?: boolean;
  verified_by?: number | null;
  verified_on?: string | null;
  verified_by_details?: { id: number; first_name: string; last_name: string } | null;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  account_holder_name?: string | null;
  bank_name?: string | null;
  available_slots?: string | null;
};

export type PaginatedKitchenProfiles = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: KitchenDeliveryProfile[];
};

export const fetchKitchenDeliveryProfiles = async (
  page = 1,
  limit = 10
): Promise<PaginatedKitchenProfiles> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const url = createApiUrl(`api/deliveryprofile/kitchen-delivery-profiles/?${params.toString()}`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data;
};

export const verifyDeliveryProfile = async (profileId: number): Promise<KitchenDeliveryProfile> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/verify/`);
  const res = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return res.data;
};
