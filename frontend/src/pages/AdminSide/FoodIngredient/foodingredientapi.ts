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
  is_approved?: boolean;
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
export const createFoodIngredient = async (data: FoodIngredient) => {
  const url = createApiUrl("api/foodingredient/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List (optionally filter by food)
export const getFoodIngredientList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  foodId?: number,
  ingredient?: number | string,
  unit?: number | string
): Promise<PaginatedResponses<FoodIngredient>> => {
  try {
    const params: Record<string, any> = { page };
    if (foodId) params.food = foodId;
    if (ingredient) params.ingredient = ingredient;
    if (unit) params.unit = unit;
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/foodingredient/all/" : "api/foodingredient/");
    const response = await axios.get<PaginatedResponses<FoodIngredient> | FoodIngredient[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search, food: foodId, ingredient, unit } : params,
    });

    if (isAll) {
      return {
        count: (response.data as FoodIngredient[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as FoodIngredient[],
      };
    }

    return response.data as PaginatedResponses<FoodIngredient>;
  } catch (error) {
    console.error("Error fetching food ingredient list:", error);
    throw error;
  }
};

// Update
export const updateFoodIngredient = async (id: number, data: Partial<FoodIngredient>) => {
  const url = createApiUrl(`api/foodingredient/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Partial Update
export const patchFoodIngredient = async (id: number, data: Partial<FoodIngredient>) => {
  const url = createApiUrl(`api/foodingredient/${id}/`);
  const response = await axios.patch(url, data, {
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
