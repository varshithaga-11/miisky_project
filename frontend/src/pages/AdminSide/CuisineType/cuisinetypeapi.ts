import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface CuisineType {
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
}

// Create
export const createCuisineType = async (data: CuisineType) => {
  const url = createApiUrl("api/cuisinetype/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getCuisineTypeList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<CuisineType>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const url = createApiUrl("api/cuisinetype/");
    const response = await axios.get<PaginatedResponses<CuisineType>>(url, {
      headers: await getAuthHeaders(),
      params: limit === "all" ? { ...params, limit: 9999 } : params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cuisine type list:", error);
    throw error;
  }
};

// Get By ID
export const getCuisineTypeById = async (id: number) => {
  const url = createApiUrl(`api/cuisinetype/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateCuisineType = async (id: number, data: Partial<CuisineType>) => {
  const url = createApiUrl(`api/cuisinetype/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteCuisineType = async (id: number) => {
  const url = createApiUrl(`api/cuisinetype/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
