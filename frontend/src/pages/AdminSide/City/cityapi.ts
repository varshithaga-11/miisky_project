import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface City {
  id?: number;
  name: string;
  state?: number;
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
export const getCityList = async (): Promise<City[]> => {
  const url = createApiUrl("api/city/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
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