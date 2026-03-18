import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface City {
  id?: number;
  name: string;
  state?: number;
  state_name?: string;
  country_name?: string;
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
export const createCity = async (data: City) => {
  const url = createApiUrl("api/city/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getCityList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  state?: string | number,
  country?: string | number
): Promise<PaginatedResponses<City>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;
    if (state) params.state = state;
    if (country) params.country = country;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/city/all/" : "api/city/");
    const response = await axios.get<PaginatedResponses<City> | City[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search, state, country } : params,
    });

    if (isAll) {
      return {
        count: (response.data as City[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as City[],
      };
    }

    return response.data as PaginatedResponses<City>;
  } catch (error) {
    console.error("Error fetching city list:", error);
    throw error;
  }
};

// Get By ID
export const getCityById = async (id: number) => {
  const url = createApiUrl(`api/city/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateCity = async (id: number, data: Partial<City>) => {
  const url = createApiUrl(`api/city/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteCity = async (id: number) => {
  const url = createApiUrl(`api/city/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};