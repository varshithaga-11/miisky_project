import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";
import axios from "axios";

export interface FoodNutrition {
  id?: number;
  food: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  saturated_fat?: number;
  trans_fat?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  vitamin_b12?: number;
  cholesterol?: number;
  glycemic_index?: number;
  serving_size?: string;
}

export interface CuisineType {
  id: number;
  name: string;
}

export interface Food {
  id?: number;
  name: string;
  meal_types: number[];
  meal_type_names?: string[];
  cuisine_types?: number[];
  cuisine_type_names?: string[];
  description?: string;
  image?: string;
  nutrition?: FoodNutrition;
  ingredients?: any[];
  steps?: any[];
  price?: number;
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
export const createFood = async (data: FormData) => {
  const url = createApiUrl("api/food/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeadersFile(),
  });
  return response.data;
};

// Get List
export const getFoodList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  meal_type?: string | number,
  cuisine_type?: string | number
): Promise<PaginatedResponses<Food>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;
    if (meal_type) params.meal_type = meal_type;
    if (cuisine_type) params.cuisine_type = cuisine_type;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/food/all/" : "api/food/");
    const response = await axios.get<PaginatedResponses<Food> | Food[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search, meal_type, cuisine_type } : params,
    });

    if (isAll) {
      return {
        count: (response.data as Food[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as Food[],
      };
    }

    return response.data as PaginatedResponses<Food>;
  } catch (error) {
    console.error("Error fetching food list:", error);
    throw error;
  }
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

// Food Nutrition
export const createFoodNutrition = async (data: Partial<FoodNutrition>) => {
  const url = createApiUrl("api/foodnutrition/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateFoodNutrition = async (id: number, data: Partial<FoodNutrition>) => {
  const url = createApiUrl(`api/foodnutrition/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Cuisine Type
export const getCuisineTypeList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<CuisineType>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/cuisinetype/");
  const response = await axios.get<PaginatedResponses<CuisineType>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 10 } : params,
  });
  return response.data;
};
