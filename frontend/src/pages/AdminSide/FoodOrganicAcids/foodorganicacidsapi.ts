import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodOrganicAcids {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  oxalate_total?: number | null;
  oxalate_soluble?: number | null;
  oxalate_insoluble?: number | null;
  citric_acid?: number | null;
  fumaric_acid?: number | null;
  malic_acid?: number | null;
  quinic_acid?: number | null;
  succinic_acid?: number | null;
  tartaric_acid?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodOrganicAcids = async (data: Partial<FoodOrganicAcids>) => {
  const url = createApiUrl("api/foodorganicacids/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodOrganicAcidsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodOrganicAcids>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodorganicacids/");
  const response = await axios.get<PaginatedResponses<FoodOrganicAcids>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodOrganicAcidsById = async (id: number) => {
  const url = createApiUrl(`api/foodorganicacids/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodOrganicAcids = async (id: number, data: Partial<FoodOrganicAcids>) => {
  const url = createApiUrl(`api/foodorganicacids/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodOrganicAcids = async (id: number) => {
  const url = createApiUrl(`api/foodorganicacids/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

