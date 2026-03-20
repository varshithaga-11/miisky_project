import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type UserMicroKitchenMapping = {
  id?: number;
  patient: number;
  patient_details?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  nutritionist?: number;
  nutritionist_details?: {
    first_name: string;
    last_name: string;
  };
  micro_kitchen: number;
  kitchen_details?: {
      brand_name: string;
      cuisine_type: string;
  };
  diet_plan: number;
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

export const suggestKitchen = async (data: Partial<UserMicroKitchenMapping>) => {
  const url = createApiUrl("api/usermicrokitchenmapping/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getKitchenSuggestions = async (params: { patient?: number; diet_plan?: number } = {}) => {
  const query = new URLSearchParams();
  if (params.patient) query.append("patient", params.patient.toString());
  if (params.diet_plan) query.append("diet_plan", params.diet_plan.toString());
  
  const url = createApiUrl(`api/usermicrokitchenmapping/?${query.toString()}`);
  const response = await axios.get<UserMicroKitchenMapping[]>(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateKitchenSuggestionStatus = async (id: number, status: string) => {
    const url = createApiUrl(`api/usermicrokitchenmapping/${id}/`);
    const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
    return response.data;
};
