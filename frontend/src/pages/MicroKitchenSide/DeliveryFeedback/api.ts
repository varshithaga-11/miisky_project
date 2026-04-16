import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type DeliveryFeedbackType = "issue" | "rating";

export type DeliveryFeedbackRow = {
  id: number;
  feedback_type: DeliveryFeedbackType;
  order: number | null;
  user_meal: number | null;
  rating: number | null;
  review: string | null;
  issue_type: string | null;
  description: string | null;
  created_at: string;
  reported_by_details?: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  } | null;
  order_details?: {
    id: number;
    status: string;
    order_type: string;
    delivery_person: number | null;
  } | null;
  user_meal_details?: {
    id: number;
    meal_date: string;
    status: string;
    user_diet_plan: number | null;
    delivery_assignment_id: number | null;
  } | null;
};

export type Paginated<T> = {
  count: number;
  next?: number | null;
  previous?: number | null;
  current_page?: number;
  total_pages?: number;
  results: T[];
};

export async function fetchMicroKitchenDeliveryFeedbackList(params: {
  page?: number;
  limit?: number;
  feedback_type?: "all" | DeliveryFeedbackType;
  target_type?: "all" | "order" | "user_meal";
  order_type?: "all" | "patient" | "non_patient";
  search?: string;
  order?: string;
  user_meal?: string;
}): Promise<Paginated<DeliveryFeedbackRow>> {
  const q = new URLSearchParams();
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  if (params.feedback_type && params.feedback_type !== "all") q.set("feedback_type", params.feedback_type);
  if (params.target_type && params.target_type !== "all") q.set("target_type", params.target_type);
  if (params.order_type && params.order_type !== "all") q.set("order_type", params.order_type);
  if (params.search) q.set("search", params.search);
  if (params.order) q.set("order", params.order);
  if (params.user_meal) q.set("user_meal", params.user_meal);

  const url = createApiUrl(`api/microkitchen/delivery-feedback-list/?${q.toString()}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const data = response.data;
  return {
    count: data?.count ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
    current_page: data?.current_page ?? 1,
    total_pages: data?.total_pages ?? 1,
    results: Array.isArray(data?.results) ? data.results : [],
  };
}
