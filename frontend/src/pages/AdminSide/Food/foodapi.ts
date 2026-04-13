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
  is_approved?: boolean;
  is_rejected?: boolean;
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
  is_approved?: boolean;
  is_rejected?: boolean;
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
  cuisine_type?: string | number,
  micro_kitchen?: string | number,
  available_only?: boolean
): Promise<PaginatedResponses<Food>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;
    if (meal_type) params.meal_type = meal_type;
    if (cuisine_type) params.cuisine_type = cuisine_type;
    if (micro_kitchen) params.micro_kitchen = micro_kitchen;
    if (available_only) params.available_only = "true";

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/food/all/" : "api/food/");
    const response = await axios.get<PaginatedResponses<Food> | Food[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search, meal_type, cuisine_type, micro_kitchen, available_only: available_only ? "true" : undefined } : params,
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

// Partial Update
export const patchFood = async (id: number, data: Partial<Food>) => {
  const url = createApiUrl(`api/food/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
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

// Kitchen menu (available foods from MicroKitchenFood - respects is_available)
export const getKitchenMenu = async (kitchenId: number): Promise<MicroKitchenFoodMenuItem[]> => {
  const url = createApiUrl(`api/microkitchenfood/menu/?micro_kitchen=${kitchenId}`);
  const response = await axios.get<MicroKitchenFoodMenuItem[]>(url, {
    headers: await getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
};

export interface MicroKitchenFoodMenuItem {
  id: number;
  food: number;
  food_details?: {
    id: number;
    name: string;
    description?: string;
    image?: string | null;
    meal_type_names?: string[];
    cuisine_type_names?: string[];
  };
  price: string | number;
  preparation_time?: number | null;
  is_available: boolean;
}

// Cuisine Type
// Partial Update for CuisineType
export const patchCuisineType = async (id: number, data: Partial<CuisineType>) => {
  const url = createApiUrl(`api/cuisinetype/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getCuisineTypeList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<CuisineType>> => {
  const isAll = limit === "all";
  const url = createApiUrl(isAll ? "api/cuisinetype/all/" : "api/cuisinetype/");
  const params: Record<string, any> = { page };
  if (!isAll) params.limit = limit;
  if (search) params.search = search;

  const response = await axios.get<PaginatedResponses<CuisineType> | CuisineType[]>(url, {
    headers: await getAuthHeaders(),
    params: isAll ? { search } : params,
  });

  if (isAll) {
    return {
      count: (response.data as CuisineType[]).length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: response.data as CuisineType[],
    };
  }

  return response.data as PaginatedResponses<CuisineType>;
};
