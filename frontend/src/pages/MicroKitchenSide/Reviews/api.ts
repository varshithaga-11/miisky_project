import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type MicroKitchenRating = {
  id: number;
  user: number;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  micro_kitchen: number;
  kitchen_details?: {
    id: number;
    brand_name: string;
  };
  rating: number;
  review: string | null;
  order: number | null;
  order_type: "patient" | "non_patient" | "general";
  created_at: string;
};

export const getMicroKitchenRatings = async () => {
  const url = createApiUrl("api/microkitchenrating/");
  const response = await axios.get<MicroKitchenRating[]>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
