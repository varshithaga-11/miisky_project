import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodName {
  id?: number;
  name: string;
  food_group?: number | null;
  food_group_name?: string;
  code?: string | null;
  created_at?: string;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
  status_counts?: Record<string, number>;
  totals?: Record<string, number>;
}

export const createFoodName = async (data: FoodName) => {
  const url = createApiUrl("api/foodname/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodNameList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  food_group?: number | string
): Promise<PaginatedResponses<FoodName>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;
  if (food_group) params.food_group = food_group;

  const isAll = limit === "all";
  const url = createApiUrl(isAll ? "api/foodname/all/" : "api/foodname/");
  console.log(`FoodName API Call: ${isAll ? "Fetching all" : "Page " + page}, URL: ${url}`);
  const response = await axios.get<PaginatedResponses<FoodName> | FoodName[]>(url, {
    headers: await getAuthHeaders(),
    params: isAll ? { search, food_group } : params,
  });

  console.log(`FoodName API Response Status: ${response.status}, Data type: ${Array.isArray(response.data) ? "Array" : typeof response.data}`);

  if (isAll) {
    return {
      count: (response.data as FoodName[]).length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: response.data as FoodName[],
    };
  }

  return response.data as PaginatedResponses<FoodName>;
};

export const getFoodNameById = async (id: number) => {
  const url = createApiUrl(`api/foodname/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodName = async (id: number, data: Partial<FoodName>) => {
  const url = createApiUrl(`api/foodname/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodName = async (id: number) => {
  const url = createApiUrl(`api/foodname/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

