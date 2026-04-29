import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodGroup {
  id?: number;
  name: string;
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

export const createFoodGroup = async (data: FoodGroup) => {
  const url = createApiUrl("api/foodgroup/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodGroupList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodGroup>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const isAll = limit === "all";
  const url = createApiUrl(isAll ? "api/foodgroup/all/" : "api/foodgroup/");
  const response = await axios.get<PaginatedResponses<FoodGroup> | FoodGroup[]>(url, {
    headers: await getAuthHeaders(),
    params: {
      ...(isAll ? { search } : params),
      _t: Date.now(), // Cache buster
    },
  });

  if (isAll) {
    return {
      count: (response.data as FoodGroup[]).length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: response.data as FoodGroup[],
    };
  }

  return response.data as PaginatedResponses<FoodGroup>;
};

export const getFoodGroupById = async (id: number) => {
  const url = createApiUrl(`api/foodgroup/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodGroup = async (id: number, data: Partial<FoodGroup>) => {
  const url = createApiUrl(`api/foodgroup/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodGroup = async (id: number) => {
  const url = createApiUrl(`api/foodgroup/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

