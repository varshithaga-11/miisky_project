import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";
import axios from "axios";

export interface Food {
  id?: number;
  name: string;
  category: number;
  category_name?: string;
  description?: string;
  image?: string;
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

// Create
export const createFood = async (data: FormData) => {
  const url = createApiUrl("api/food/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeadersFile(),
  });
  return response.data;
};

// Get List
export const getFoodList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<Food>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const url = createApiUrl("api/food/");
    const response = await axios.get<PaginatedResponses<Food>>(url, {
      headers: await getAuthHeaders(),
      params: limit === "all" ? { ...params, limit: 9999 } : params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching food list:", error);
    throw error;
  }
};

// Get By ID
export const getFoodById = async (id: number) => {
  const url = createApiUrl(`api/food/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateFood = async (id: number, data: FormData) => {
  const url = createApiUrl(`api/food/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeadersFile(),
  });
  return response.data;
};

// Delete
export const deleteFood = async (id: number) => {
  const url = createApiUrl(`api/food/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
