import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";
import axios from "axios";

export interface Food {
  id?: number;
  name: string;
  category: number;
  category_name?: string;
  description?: string;
  image?: string;
}

// Create
export const createFood = async (data: FormData) => {
  const url = createApiUrl("api/food/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeadersFile(),
  });
  return response.data;
};

// Get List
export const getFoodList = async (): Promise<Food[]> => {
  const url = createApiUrl("api/food/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get By ID
export const getFoodById = async (id: number) => {
  const url = createApiUrl(`api/food/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateFood = async (id: number, data: FormData) => {
  const url = createApiUrl(`api/food/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeadersFile(),
  });
  return response.data;
};

// Delete
export const deleteFood = async (id: number) => {
  const url = createApiUrl(`api/food/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
