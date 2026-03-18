import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodStep {
  id?: number;
  food: number;
  step_number: number;
  instruction: string;
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

// Create
export const createFoodStep = async (data: FoodStep) => {
  const url = createApiUrl("api/foodstep/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List (optionally filter by food)
export const getFoodStepList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  foodId?: number
): Promise<PaginatedResponses<FoodStep>> => {
  try {
    const params: Record<string, any> = { page };
    if (foodId) params.food = foodId;
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/foodstep/all/" : "api/foodstep/");
    const response = await axios.get<PaginatedResponses<FoodStep> | FoodStep[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search, food: foodId } : params,
    });

    if (isAll) {
      return {
        count: (response.data as FoodStep[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as FoodStep[],
      };
    }

    return response.data as PaginatedResponses<FoodStep>;
  } catch (error) {
    console.error("Error fetching food step list:", error);
    throw error;
  }
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
