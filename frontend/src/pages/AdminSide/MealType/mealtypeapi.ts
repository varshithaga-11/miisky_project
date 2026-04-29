import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface MealType {
  id?: number;
  name: string;
  posted_by_role?: string;
  posted_by_name?: string;
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
export const createMealType = async (data: MealType) => {
  const url = createApiUrl("api/mealtype/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getMealTypeList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<MealType>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/mealtype/all/" : "api/mealtype/");
    const response = await axios.get<PaginatedResponses<MealType> | MealType[]>(url, {
      headers: await getAuthHeaders(),
      params: {
        ...(isAll ? { search } : params),
        _t: Date.now(), // Cache buster
      },
    });

    if (isAll) {
      return {
        count: (response.data as MealType[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as MealType[],
      };
    }

    return response.data as PaginatedResponses<MealType>;
  } catch (error) {
    console.error("Error fetching meal type list:", error);
    throw error;
  }
};

// Get By ID
export const getMealTypeById = async (id: number) => {
  const url = createApiUrl(`api/mealtype/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updateMealType = async (id: number, data: Partial<MealType>) => {
  const url = createApiUrl(`api/mealtype/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Partial Update
export const patchMealType = async (id: number, data: Partial<MealType>) => {
  const url = createApiUrl(`api/mealtype/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deleteMealType = async (id: number) => {
  const url = createApiUrl(`api/mealtype/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
