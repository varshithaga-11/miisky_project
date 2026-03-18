import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodWaterSolubleVitamins {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  water_soluble_index?: number | null;
  thiamine_b1?: number | null;
  riboflavin_b2?: number | null;
  niacin_b3?: number | null;
  pantothenic_acid_b5?: number | null;
  biotin_b7?: number | null;
  folate_b9?: number | null;
  vitamin_b6?: number | null;
  vitamin_c?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodWaterSolubleVitamins = async (data: Partial<FoodWaterSolubleVitamins>) => {
  const url = createApiUrl("api/foodwatersolublevitamins/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodWaterSolubleVitaminsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodWaterSolubleVitamins>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodwatersolublevitamins/");
  const response = await axios.get<PaginatedResponses<FoodWaterSolubleVitamins>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodWaterSolubleVitaminsById = async (id: number) => {
  const url = createApiUrl(`api/foodwatersolublevitamins/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodWaterSolubleVitamins = async (id: number, data: Partial<FoodWaterSolubleVitamins>) => {
  const url = createApiUrl(`api/foodwatersolublevitamins/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodWaterSolubleVitamins = async (id: number) => {
  const url = createApiUrl(`api/foodwatersolublevitamins/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

