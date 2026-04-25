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
  next: number | null;
  previous: number | null;
  results: MicroKitchenRating[];
  current_page: number;
  total_pages: number;
}

export const getMicroKitchenRatings = async (params?: {
  search?: string;
  order_type?: string;
  page?: number;
  limit?: number;
  period?: string;
  start_date?: string;
  end_date?: string;
}) => {
  let url = createApiUrl("api/microkitchenrating/");
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.order_type && params.order_type !== 'all') query.append('order_type', params.order_type);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.period && params.period !== 'all') query.append('period', params.period);
  if (params?.start_date) query.append('start_date', params.start_date);
  if (params?.end_date) query.append('end_date', params.end_date);

  if (query.toString()) url += `?${query.toString()}`;

  const response = await axios.get<MicroKitchenRatingPagination>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getAllKitchenReviews = async (
  kitchenId: number,
  page = 1,
  limit = 5
): Promise<MicroKitchenRatingPagination> => {
  const url = createApiUrl("api/microkitchenrating/all-reviews/");
  const response = await axios.get<MicroKitchenRatingPagination | MicroKitchenRating[]>(url, {
    headers: await getAuthHeaders(),
    params: { kitchen_id: kitchenId, page, limit },
  });

  const data = response.data;
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
      current_page: 1,
      total_pages: 1,
    };
  }

  return {
    count: data.count ?? 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: Array.isArray(data.results) ? data.results : [],
    current_page: data.current_page ?? page,
    total_pages: data.total_pages ?? 1,
  };
};
