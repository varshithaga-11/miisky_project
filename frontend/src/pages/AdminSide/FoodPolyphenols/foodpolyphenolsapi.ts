import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodPolyphenols {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  benzoic_acid?: number | null;
  benzaldehyde?: number | null;
  protocatechuic_acid?: number | null;
  vanillic_acid?: number | null;
  gallic_acid?: number | null;
  cinnamic_acid?: number | null;
  o_coumaric_acid?: number | null;
  p_coumaric_acid?: number | null;
  caffeic_acid?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodPolyphenols = async (data: Partial<FoodPolyphenols>) => {
  const url = createApiUrl("api/foodpolyphenols/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodPolyphenolsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodPolyphenols>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodpolyphenols/");
  const response = await axios.get<PaginatedResponses<FoodPolyphenols>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodPolyphenolsById = async (id: number) => {
  const url = createApiUrl(`api/foodpolyphenols/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodPolyphenols = async (id: number, data: Partial<FoodPolyphenols>) => {
  const url = createApiUrl(`api/foodpolyphenols/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodPolyphenols = async (id: number) => {
  const url = createApiUrl(`api/foodpolyphenols/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

