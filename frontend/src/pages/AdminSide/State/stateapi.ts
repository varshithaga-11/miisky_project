import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface State {
  id?: number;
  name: string;
  country?: number;
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
export const createState = async (data: State) => {
  const url = createApiUrl("api/state/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get list
export const getStateList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<State>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const url = createApiUrl("api/state/");
    const response = await axios.get<PaginatedResponses<State>>(url, {
      headers: await getAuthHeaders(),
      params: limit === "all" ? { ...params, limit: 9999 } : params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching state list:", error);
    throw error;
  }
};

// Get by ID
export const getStateById = async (id: number) => {
  const url = createApiUrl(`api/state/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateState = async (id: number, data: Partial<State>) => {
  const url = createApiUrl(`api/state/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteState = async (id: number) => {
  const url = createApiUrl(`api/state/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};