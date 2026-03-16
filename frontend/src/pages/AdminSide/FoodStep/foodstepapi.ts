import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodStep {
  id?: number;
  food: number;
  step_number: number;
  instruction: string;
}

// Create
export const createFoodStep = async (data: FoodStep) => {
  const url = createApiUrl("api/foodstep/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List (optionally filter by food)
export const getFoodStepList = async (foodId?: number): Promise<FoodStep[]> => {
  let url = createApiUrl("api/foodstep/");
  if (foodId) {
    url += `?food=${foodId}`;
  }
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateFoodStep = async (id: number, data: Partial<FoodStep>) => {
  const url = createApiUrl(`api/foodstep/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteFoodStep = async (id: number) => {
  const url = createApiUrl(`api/foodstep/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
