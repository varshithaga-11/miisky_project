import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodCategory {
  id?: number;
  name: string;
}

// Create
export const createFoodCategory = async (data: FoodCategory) => {
  const url = createApiUrl("api/foodcategory/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getFoodCategoryList = async (): Promise<FoodCategory[]> => {
  const url = createApiUrl("api/foodcategory/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get By ID
export const getFoodCategoryById = async (id: number) => {
  const url = createApiUrl(`api/foodcategory/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateFoodCategory = async (id: number, data: Partial<FoodCategory>) => {
  const url = createApiUrl(`api/foodcategory/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteFoodCategory = async (id: number) => {
  const url = createApiUrl(`api/foodcategory/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
