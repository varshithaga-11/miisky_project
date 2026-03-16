import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface Unit {
  id?: number;
  name: string;
}

// Create
export const createUnit = async (data: Unit) => {
  const url = createApiUrl("api/unit/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getUnitList = async (): Promise<Unit[]> => {
  const url = createApiUrl("api/unit/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
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

// Delete
export const deleteUnit = async (id: number) => {
  const url = createApiUrl(`api/unit/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
