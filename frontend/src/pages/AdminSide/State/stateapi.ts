import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface State {
  id?: number;
  name: string;
  country?: number;
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
export const getStateList = async (): Promise<State[]> => {
  const url = createApiUrl("api/state/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
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