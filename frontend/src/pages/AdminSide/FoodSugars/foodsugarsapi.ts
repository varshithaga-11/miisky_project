import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodSugars {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  total_carbohydrates?: number | null;
  starch?: number | null;
  fructose?: number | null;
  glucose?: number | null;
  sucrose?: number | null;
  maltose?: number | null;
  total_sugars?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodSugars = async (data: Partial<FoodSugars>) => {
  const url = createApiUrl("api/foodsugars/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodSugarsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodSugars>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodsugars/");
  const response = await axios.get<PaginatedResponses<FoodSugars>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodSugarsById = async (id: number) => {
  const url = createApiUrl(`api/foodsugars/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodSugars = async (id: number, data: Partial<FoodSugars>) => {
  const url = createApiUrl(`api/foodsugars/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodSugars = async (id: number) => {
  const url = createApiUrl(`api/foodsugars/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

