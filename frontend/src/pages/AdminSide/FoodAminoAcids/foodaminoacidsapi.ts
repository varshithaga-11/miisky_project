import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodAminoAcids {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  histidine?: number | null;
  isoleucine?: number | null;
  leucine?: number | null;
  lysine?: number | null;
  methionine?: number | null;
  cystine?: number | null;
  phenylalanine?: number | null;
  threonine?: number | null;
  tryptophan?: number | null;
  valine?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodAminoAcids = async (data: Partial<FoodAminoAcids>) => {
  const url = createApiUrl("api/foodaminoacids/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodAminoAcidsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodAminoAcids>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodaminoacids/");
  const response = await axios.get<PaginatedResponses<FoodAminoAcids>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodAminoAcidsById = async (id: number) => {
  const url = createApiUrl(`api/foodaminoacids/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodAminoAcids = async (id: number, data: Partial<FoodAminoAcids>) => {
  const url = createApiUrl(`api/foodaminoacids/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodAminoAcids = async (id: number) => {
  const url = createApiUrl(`api/foodaminoacids/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

