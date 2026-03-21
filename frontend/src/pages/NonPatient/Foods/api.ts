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

export const getAvailableMicroKitchenFoods = async (
  microKitchenId?: string | number,
  search?: string
): Promise<MicroKitchenFoodItem[]> => {
  const params = new URLSearchParams();
  if (microKitchenId) params.append("micro_kitchen", String(microKitchenId));
  if (search) params.append("search", search);
  const query = params.toString();
  const url = createApiUrl(query ? `api/microkitchenfood/available/?${query}` : "api/microkitchenfood/available/");
  const response = await axios.get<MicroKitchenFoodItem[]>(url, {
    headers: await getAuthHeaders(),
  });
  return Array.isArray(response.data) ? response.data : [];
};
