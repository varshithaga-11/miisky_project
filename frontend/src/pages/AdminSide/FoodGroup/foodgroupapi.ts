import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodGroup {
  id?: number;
  name: string;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
  status_counts?: Record<string, number>;
  totals?: Record<string, number>;
}

export const createFoodGroup = async (data: FoodGroup) => {
  const url = createApiUrl("api/foodgroup/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodGroupList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodGroup>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodgroup/");
  const response = await axios.get<PaginatedResponses<FoodGroup>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodGroupById = async (id: number) => {
  const url = createApiUrl(`api/foodgroup/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodGroup = async (id: number, data: Partial<FoodGroup>) => {
  const url = createApiUrl(`api/foodgroup/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodGroup = async (id: number) => {
  const url = createApiUrl(`api/foodgroup/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

