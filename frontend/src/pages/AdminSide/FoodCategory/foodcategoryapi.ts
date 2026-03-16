import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodCategory {
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

// Create
export const createFoodCategory = async (data: FoodCategory) => {
  const url = createApiUrl("api/foodcategory/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getFoodCategoryList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodCategory>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const url = createApiUrl("api/foodcategory/");
    const response = await axios.get<PaginatedResponses<FoodCategory>>(url, {
      headers: await getAuthHeaders(),
      params: limit === "all" ? { ...params, limit: 9999 } : params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching food category list:", error);
    throw error;
  }
};

// Get By ID
export const getFoodCategoryById = async (id: number) => {
  const url = createApiUrl(`api/foodcategory/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateFoodCategory = async (id: number, data: Partial<FoodCategory>) => {
  const url = createApiUrl(`api/foodcategory/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteFoodCategory = async (id: number) => {
  const url = createApiUrl(`api/foodcategory/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
