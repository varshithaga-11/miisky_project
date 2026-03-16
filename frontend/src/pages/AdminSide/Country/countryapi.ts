import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface Country {
  id?: number;
  name: string;
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

// Create Country
export const createCountry = async (data: Country) => {
  const url = createApiUrl("api/country/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get Country List
export const getCountryList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<Country>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const url = createApiUrl("api/country/");
    const response = await axios.get<PaginatedResponses<Country>>(url, {
      headers: await getAuthHeaders(),
      params: limit === "all" ? { ...params, limit: 9999 } : params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching country list:", error);
    throw error;
  }
};

// Get Country by ID
export const getCountryById = async (id: number) => {
  const url = createApiUrl(`api/country/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update Country
export const updateCountry = async (id: number, data: Partial<Country>) => {
  const url = createApiUrl(`api/country/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete Country
export const deleteCountry = async (id: number) => {
  const url = createApiUrl(`api/country/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};