import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type SimpleUser = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  mobile?: string | null;
  role: string;
  is_patient_mapped?: boolean;
};

export type PaginatedResponses<T> = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
};

export const getAllUsers = async (): Promise<PaginatedResponses<SimpleUser>> => {
  const url = createApiUrl("api/usermanagement/");
  const response = await axios.get<PaginatedResponses<SimpleUser>>(url, { headers: await getAuthHeaders(), params: { limit: 9999, page: 1 } });
  return response.data;
};

export const createUserNutritionMapping = async (userId: number, nutritionistId: number) => {
  const url = createApiUrl("api/usernutritionistmapping/");
  const response = await axios.post(
    url,
    { user: userId, nutritionist: nutritionistId, is_active: true },
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

