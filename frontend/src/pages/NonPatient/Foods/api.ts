import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { getApprovedMicroKitchens, MicroKitchenProfile } from "../../PatientSide/ListOfMicroKitchen/api";

export { getApprovedMicroKitchens };
export type { MicroKitchenProfile };

export interface MicroKitchenFoodItem {
  id: number;
  micro_kitchen: number;
  micro_kitchen_details?: { id: number; brand_name: string | null };
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

export interface PaginatedMicroKitchenFoodResponse {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: MicroKitchenFoodItem[];
}

export const getAvailableMicroKitchenFoods = async (
  microKitchenId?: string | number,
  search?: string,
  page = 1,
  limit = 20
): Promise<PaginatedMicroKitchenFoodResponse> => {
  const params = new URLSearchParams();
  if (microKitchenId) params.append("micro_kitchen", String(microKitchenId));
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("limit", String(limit));
  const query = params.toString();
  const url = createApiUrl(query ? `api/microkitchenfood/available/?${query}` : "api/microkitchenfood/available/");
  const response = await axios.get<PaginatedMicroKitchenFoodResponse | MicroKitchenFoodItem[]>(url, {
    headers: await getAuthHeaders(),
  });
  const data = response.data;

  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: data,
    };
  }

  return {
    count: data.count ?? 0,
    next: typeof data.next === "number" ? data.next : null,
    previous: typeof data.previous === "number" ? data.previous : null,
    current_page: data.current_page ?? page,
    total_pages: data.total_pages ?? 1,
    results: Array.isArray(data.results) ? data.results : [],
  };
};
