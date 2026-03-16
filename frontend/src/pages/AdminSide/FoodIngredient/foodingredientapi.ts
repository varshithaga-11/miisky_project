import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodIngredient {
  id?: number;
  food: number;
  ingredient: number;
  ingredient_name?: string;
  quantity: number;
  unit: number;
  unit_name?: string;
  notes?: string;
}

// Create
export const createFoodIngredient = async (data: FoodIngredient) => {
  const url = createApiUrl("api/foodingredient/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List (optionally filter by food)
export const getFoodIngredientList = async (foodId?: number): Promise<FoodIngredient[]> => {
  let url = createApiUrl("api/foodingredient/");
  if (foodId) {
    url += `?food=${foodId}`;
  }
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateFoodIngredient = async (id: number, data: Partial<FoodIngredient>) => {
  const url = createApiUrl(`api/foodingredient/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteFoodIngredient = async (id: number) => {
  const url = createApiUrl(`api/foodingredient/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
