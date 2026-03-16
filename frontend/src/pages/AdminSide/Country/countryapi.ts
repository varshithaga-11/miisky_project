import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface Country {
  id?: number;
  name: string;
  created_at?: string;
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
export const getCountryList = async (): Promise<Country[]> => {
  const url = createApiUrl("api/country/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
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