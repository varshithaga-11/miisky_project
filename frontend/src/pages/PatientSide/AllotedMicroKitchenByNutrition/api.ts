import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export const rateMicroKitchen = async (microKitchenId: number, rating: number, review?: string) => {
  const url = createApiUrl("api/microkitchenrating/rate/");
  const response = await axios.post(
    url,
    { micro_kitchen_id: microKitchenId, rating, review: review || "" },
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

export const getMyRatingForKitchen = async (microKitchenId: number) => {
  const url = createApiUrl(`api/microkitchenrating/?micro_kitchen=${microKitchenId}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const data = response.data;
  const list = Array.isArray(data) ? data : data?.results || [];
  return list.length > 0 ? list[0] : null;
};

export type UserMicroKitchenMapping = {
  id: number;
  patient: number;
  nutritionist_details?: {
    first_name: string;
    last_name: string;
  };
  micro_kitchen: number;
  kitchen_details?: {
      brand_name: string;
      cuisine_type: string;
      photo_exterior?: string;
      city?: string;
      state?: string;
      latitude?: number | null;
      longitude?: number | null;
  };
  diet_plan_details?: {
      plan_name: string;
      start_date: string;
      end_date: string;
  };
  status: 'suggested' | 'accepted' | 'rejected';
  suggested_at?: string;
  responded_at?: string;
  is_active: boolean;
};

export const getMyKitchenSuggestions = async () => {
  const url = createApiUrl("api/usermicrokitchenmapping/");
  const response = await axios.get<UserMicroKitchenMapping[]>(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const respondToKitchenSuggestion = async (id: number, status: 'accepted' | 'rejected') => {
    const url = createApiUrl(`api/usermicrokitchenmapping/${id}/`);
    const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
    return response.data;
};
