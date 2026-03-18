import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodPhytochemicals {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  raffinose?: number | null;
  stachyose?: number | null;
  verbascose?: number | null;
  ajugose?: number | null;
  campesterol?: number | null;
  stigmasterol?: number | null;
  beta_sitosterol?: number | null;
  phytate?: number | null;
  saponin?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodPhytochemicals = async (data: Partial<FoodPhytochemicals>) => {
  const url = createApiUrl("api/foodphytochemicals/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodPhytochemicalsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodPhytochemicals>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodphytochemicals/");
  const response = await axios.get<PaginatedResponses<FoodPhytochemicals>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodPhytochemicalsById = async (id: number) => {
  const url = createApiUrl(`api/foodphytochemicals/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodPhytochemicals = async (id: number, data: Partial<FoodPhytochemicals>) => {
  const url = createApiUrl(`api/foodphytochemicals/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodPhytochemicals = async (id: number) => {
  const url = createApiUrl(`api/foodphytochemicals/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

