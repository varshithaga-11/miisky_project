import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodCarotenoids {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  lutein?: number | null;
  zeaxanthin?: number | null;
  lycopene?: number | null;
  beta_cryptoxanthin?: number | null;
  beta_carotene?: number | null;
  total_carotenoids?: number | null;
  retinol_activity_equivalent?: number | null;
  carotenoid_activity?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodCarotenoids = async (data: Partial<FoodCarotenoids>) => {
  const url = createApiUrl("api/foodcarotenoids/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodCarotenoidsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  food_group?: string
): Promise<PaginatedResponses<FoodCarotenoids>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;
  if (food_group) params.food_group = food_group;

  const url = createApiUrl("api/foodcarotenoids/");
  const response = await axios.get<PaginatedResponses<FoodCarotenoids>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodCarotenoidsById = async (id: number) => {
  const url = createApiUrl(`api/foodcarotenoids/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodCarotenoids = async (id: number, data: Partial<FoodCarotenoids>) => {
  const url = createApiUrl(`api/foodcarotenoids/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodCarotenoids = async (id: number) => {
  const url = createApiUrl(`api/foodcarotenoids/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

