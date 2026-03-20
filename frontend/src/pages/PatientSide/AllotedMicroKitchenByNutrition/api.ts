import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

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
