import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodMinerals {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  calcium?: number | null;
  phosphorus?: number | null;
  magnesium?: number | null;
  sodium?: number | null;
  potassium?: number | null;
  iron?: number | null;
  zinc?: number | null;
  copper?: number | null;
  manganese?: number | null;
  selenium?: number | null;
  chromium?: number | null;
  molybdenum?: number | null;
  cobalt?: number | null;
  aluminium?: number | null;
  arsenic?: number | null;
  cadmium?: number | null;
  mercury?: number | null;
  lead?: number | null;
  nickel?: number | null;
  lithium?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodMinerals = async (data: Partial<FoodMinerals>) => {
  const url = createApiUrl("api/foodminerals/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodMineralsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  food_group?: string
): Promise<PaginatedResponses<FoodMinerals>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;
  if (food_group) params.food_group = food_group;

  const isAll = limit === "all";
  const url = createApiUrl(isAll ? "api/foodminerals/all/" : "api/foodminerals/");
  const response = await axios.get<PaginatedResponses<FoodMinerals> | FoodMinerals[]>(url, {
    headers: await getAuthHeaders(),
    params: isAll ? { search, food_group } : params,
  });

  if (isAll) {
    return {
      count: (response.data as FoodMinerals[]).length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: response.data as FoodMinerals[],
    };
  }

  return response.data as PaginatedResponses<FoodMinerals>;
};

export const getFoodMineralsById = async (id: number) => {
  const url = createApiUrl(`api/foodminerals/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodMinerals = async (id: number, data: Partial<FoodMinerals>) => {
  const url = createApiUrl(`api/foodminerals/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodMinerals = async (id: number) => {
  const url = createApiUrl(`api/foodminerals/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

