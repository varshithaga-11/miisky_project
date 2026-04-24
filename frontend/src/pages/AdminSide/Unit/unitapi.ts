import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface Unit {
  id?: number;
  name: string;
  posted_by_role?: string;
  posted_by_name?: string;
}

// Create
export const createUnit = async (data: Unit) => {
  const url = createApiUrl("api/unit/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

// Get List
export const getUnitList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<Unit>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/unit/all/" : "api/unit/");
    const response = await axios.get<PaginatedResponses<Unit> | Unit[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search } : params,
    });

    if (isAll) {
      return {
        count: (response.data as Unit[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as Unit[],
      };
    }

    return response.data as PaginatedResponses<Unit>;
  } catch (error) {
    console.error("Error fetching unit list:", error);
    throw error;
  }
};

// Get By ID
export const getUnitById = async (id: number) => {
  const url = createApiUrl(`api/unit/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateUnit = async (id: number, data: Partial<Unit>) => {
  const url = createApiUrl(`api/unit/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Partial Update
export const patchUnit = async (id: number, data: Partial<Unit>) => {
  const url = createApiUrl(`api/unit/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteUnit = async (id: number) => {
  const url = createApiUrl(`api/unit/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
