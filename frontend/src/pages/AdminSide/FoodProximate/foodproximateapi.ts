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
  search?: string,
  food_group?: number | string
): Promise<PaginatedResponses<FoodProximate>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;
  if (food_group) params.food_group = food_group;

  const isAll = limit === "all";
  const url = createApiUrl(isAll ? "api/foodproximate/all/" : "api/foodproximate/");
  const response = await axios.get<PaginatedResponses<FoodProximate> | FoodProximate[]>(url, {
    headers: await getAuthHeaders(),
    params: isAll ? { search, food_group } : params,
  });

  if (isAll) {
    return {
      count: (response.data as FoodProximate[]).length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: response.data as FoodProximate[],
    };
  }

  return response.data as PaginatedResponses<FoodProximate>;
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

