import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodProximate {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  proximate?: number | null;
  water?: number | null;
  protein?: number | null;
  fat?: number | null;
  ash?: number | null;
  fat_crude_extract?: number | null;
  fiber_total?: number | null;
  fiber_insoluble?: number | null;
  fiber_soluble?: number | null;
  carbohydrates?: number | null;
  energy?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodProximate = async (data: Partial<FoodProximate>) => {
  const url = createApiUrl("api/foodproximate/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodProximateList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodProximate>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodproximate/");
  const response = await axios.get<PaginatedResponses<FoodProximate>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodProximateById = async (id: number) => {
  const url = createApiUrl(`api/foodproximate/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodProximate = async (id: number, data: Partial<FoodProximate>) => {
  const url = createApiUrl(`api/foodproximate/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodProximate = async (id: number) => {
  const url = createApiUrl(`api/foodproximate/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

