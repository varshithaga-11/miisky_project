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

export interface MicroKitchenRatingPagination {
  count: number;
  results: MicroKitchenRating[];
  current_page: number;
  total_pages: number;
}

export const getMicroKitchenRatings = async (params?: { 
  search?: string; 
  order_type?: string; 
  page?: number;
  limit?: number;
}) => {
  let url = createApiUrl("api/microkitchenrating/");
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.order_type) query.append('order_type', params.order_type);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  
  if (query.toString()) url += `?${query.toString()}`;

  const response = await axios.get<MicroKitchenRatingPagination>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
