import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodFatSolubleVitamins {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  retinol?: number | null;
  alpha_tocopherol?: number | null;
  beta_tocopherol?: number | null;
  gamma_tocopherol?: number | null;
  delta_tocopherol?: number | null;
  alpha_tocotrienol?: number | null;
  beta_tocotrienol?: number | null;
  gamma_tocotrienol?: number | null;
  delta_tocotrienol?: number | null;
  total_vitamin_e?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodFatSolubleVitamins = async (data: Partial<FoodFatSolubleVitamins>) => {
  const url = createApiUrl("api/foodfatsolublevitamins/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodFatSolubleVitaminsList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  food_group?: string
): Promise<PaginatedResponses<FoodFatSolubleVitamins>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;
  if (food_group) params.food_group = food_group;

  const isAll = limit === "all";
  const url = createApiUrl(isAll ? "api/foodfatsolublevitamins/all/" : "api/foodfatsolublevitamins/");
  const response = await axios.get<PaginatedResponses<FoodFatSolubleVitamins> | FoodFatSolubleVitamins[]>(url, {
    headers: await getAuthHeaders(),
    params: isAll ? { search, food_group } : params,
  });

  if (isAll) {
    return {
      count: (response.data as FoodFatSolubleVitamins[]).length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: response.data as FoodFatSolubleVitamins[],
    };
  }

  return response.data as PaginatedResponses<FoodFatSolubleVitamins>;
};

export const getFoodFatSolubleVitaminsById = async (id: number) => {
  const url = createApiUrl(`api/foodfatsolublevitamins/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodFatSolubleVitamins = async (id: number, data: Partial<FoodFatSolubleVitamins>) => {
  const url = createApiUrl(`api/foodfatsolublevitamins/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodFatSolubleVitamins = async (id: number) => {
  const url = createApiUrl(`api/foodfatsolublevitamins/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

