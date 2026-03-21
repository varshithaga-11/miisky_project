import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type MicroKitchenFoodItem = {
  id: number;
  micro_kitchen: number;
  food: number;
  food_details?: {
    id: number;
    name: string;
    description?: string;
    image?: string | null;
    meal_type_names?: string[];
    cuisine_type_names?: string[];
  };
  is_available: boolean;
  price: string | number;
  preparation_time?: number | null;
};

export const getMyKitchenFoods = async () => {
  const url = createApiUrl("api/microkitchenfood/");
  const response = await axios.get<MicroKitchenFoodItem[] | { results: MicroKitchenFoodItem[] }>(
    url,
    { headers: await getAuthHeaders() }
  );
  const data = response.data;
  return Array.isArray(data) ? data : (data as { results: MicroKitchenFoodItem[] }).results || [];
};

export const updateKitchenFood = async (
  id: number,
  payload: { is_available?: boolean; price?: number; preparation_time?: number | null }
) => {
  const url = createApiUrl(`api/microkitchenfood/${id}/`);
  const response = await axios.patch(url, payload, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const createKitchenFood = async (payload: {
  food: number;
  price: number;
  is_available: boolean;
}) => {
  const url = createApiUrl("api/microkitchenfood/");
  const response = await axios.post(url, payload, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
