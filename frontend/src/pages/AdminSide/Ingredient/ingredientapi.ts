import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface Ingredient {
  id?: number;
  name: string;
}

// Create
export const createIngredient = async (data: Ingredient) => {
  const url = createApiUrl("api/ingredient/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getIngredientList = async (): Promise<Ingredient[]> => {
  const url = createApiUrl("api/ingredient/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get By ID
export const getIngredientById = async (id: number) => {
  const url = createApiUrl(`api/ingredient/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateIngredient = async (id: number, data: Partial<Ingredient>) => {
  const url = createApiUrl(`api/ingredient/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteIngredient = async (id: number) => {
  const url = createApiUrl(`api/ingredient/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
