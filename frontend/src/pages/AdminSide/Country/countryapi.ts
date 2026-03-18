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

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/country/all/" : "api/country/");
    const response = await axios.get<PaginatedResponses<Country> | Country[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search } : params,
    });

    if (isAll) {
      return {
        count: (response.data as Country[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as Country[],
      };
    }

    return response.data as PaginatedResponses<Country>;
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