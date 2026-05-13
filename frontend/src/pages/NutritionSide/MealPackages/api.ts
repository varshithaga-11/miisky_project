import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface MealPackage {
  id?: number;
  name: string;
  meal_types: number[];
  meal_type_names?: string[];
  description?: string;
  is_active: boolean;
  sort_order: number;
  estimation_amount?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

// Create Meal Package
export const createMealPackage = async (data: MealPackage) => {
  const url = createApiUrl("api/mealpackage/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get Meal Package List
export const getMealPackageList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<MealPackage>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/mealpackage/all/" : "api/mealpackage/");
    const response = await axios.get<PaginatedResponses<MealPackage> | MealPackage[]>(url, {
      headers: await getAuthHeaders(),
      params: {
        ...(isAll ? { search } : params),
        _t: Date.now(), // Cache buster
      },
    });

    if (isAll) {
      return {
        count: (response.data as MealPackage[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as MealPackage[],
      };
    }

    return response.data as PaginatedResponses<MealPackage>;
  } catch (error) {
    console.error("Error fetching meal package list:", error);
    throw error;
  }
};

// Get Meal Package by ID
export const getMealPackageById = async (id: number) => {
  const url = createApiUrl(`api/mealpackage/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update Meal Package
export const updateMealPackage = async (id: number, data: Partial<MealPackage>) => {
  const url = createApiUrl(`api/mealpackage/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete Meal Package
export const deleteMealPackage = async (id: number) => {
  const url = createApiUrl(`api/mealpackage/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get Meal Types (for dropdown)
export const getMealTypeList = async () => {
    const url = createApiUrl("api/mealtype/all/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};
