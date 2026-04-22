import axios, { isAxiosError } from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export const getAdminSupplyChainList = async (
  page: number = 1,
  search: string = "",
  limit: number = 10
): Promise<{
  results: unknown[];
  total_pages: number;
  count?: number;
}> => {
  const url = createApiUrl(
    `api/admin-supply-chain/?page=${page}&search=${encodeURIComponent(search)}&limit=${limit}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export type KitchenTeamRow = {
  id: number;
  role: string;
  is_active: boolean;
  zone_name: string | null;
  pincode: string | null;
  assigned_on: string;
  micro_kitchen_details: {
    id: number;
    brand_name: string | null;
    kitchen_code: string | null;
  } | null;
};

export type PaymentSnapshotRow = {
  food_subtotal: string;
  delivery_charge: string;
  grand_total: string;
  platform_amount: string;
  kitchen_amount: string;
  platform_percent: string;
  kitchen_percent: string;
} | null;

export type AdminSupplyChainOrderRow = {
  id: number;
  status: string;
  order_type: string;
  total_amount: string;
  delivery_charge: string;
  final_amount: string;
  delivery_distance_km: string | null;
  created_at: string;
  kitchen_brand: string | null;
  patient_label: string | null;
  payment_snapshot: PaymentSnapshotRow;
  receipt_uploaded: boolean;
};

function apiErrorDetail(err: unknown): string | null {
  if (isAxiosError(err)) {
    const d = err.response?.data as { detail?: unknown } | undefined;
    if (d?.detail != null) {
      return typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail);
    }
  }
  return null;
}

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

async function getJson<T>(path: string, userId: number): Promise<T> {
  const url = createApiUrl(`${path}?user=${userId}`);
  try {
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data as T;
  } catch (err) {
    const detail = apiErrorDetail(err);
    throw new Error(detail || "Request failed.");
  }
}

async function getPaginatedJson<T>(
  path: string,
  userId: number,
  page: number = 1,
  limit: number = 10,
  extraParams: Record<string, any> = {}
): Promise<PaginatedResponse<T>> {
  let paramStr = `user=${userId}&page=${page}&limit=${limit}`;
  Object.entries(extraParams).forEach(([k, v]) => {
    if (v != null && v !== "") {
      paramStr += `&${k}=${encodeURIComponent(v)}`;
    }
  });
  const url = createApiUrl(`${path}?${paramStr}`);
  try {
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data as PaginatedResponse<T>;
  } catch (err) {
    const detail = apiErrorDetail(err);
    throw new Error(detail || "Request failed.");
  }
}

/** GET api/admin-supply-chain-hub-summary/?user= */
export const fetchAdminSupplyChainHubSummary = (userId: number) =>
  getJson<{
    kitchen_count: number;
    plan_count: number;
    order_count: number;
    total_earnings: string;
    avg_rating: number;
    ticket_count: number;
  }>("api/admin-supply-chain-hub-summary/", userId);

/** GET api/admin-supply-chain-kitchen-team-nopaginate/?user= */
export const fetchAdminSupplyChainKitchenTeam = (userId: number, page = 1, limit = 10) =>
  getPaginatedJson<KitchenTeamRow>("api/admin-supply-chain-kitchen-team-nopaginate/", userId, page, limit);

/** GET api/admin-supply-chain-plan-assignments-nopaginate/?user= */
export const fetchAdminSupplyChainPlanAssignments = (userId: number, page = 1, limit = 10) =>
  getPaginatedJson<any>("api/admin-supply-chain-plan-assignments-nopaginate/", userId, page, limit);

/** GET api/admin-supply-chain-orders-nopaginate/?user= */
export const fetchAdminSupplyChainOrders = (userId: number, page = 1, limit = 10, startDate = "", endDate = "", status = "", period = "") =>
  getPaginatedJson<AdminSupplyChainOrderRow>("api/admin-supply-chain-orders-nopaginate/", userId, page, limit, { start_date: startDate, end_date: endDate, status, period });

/** GET api/admin-supply-chain-daily-work-nopaginate/?user= */
export const fetchAdminSupplyChainDailyWork = (userId: number, page = 1, limit = 10, startDate = "", endDate = "", period = "") =>
  getPaginatedJson<any>("api/admin-supply-chain-daily-work-nopaginate/", userId, page, limit, { start_date: startDate, end_date: endDate, period });

/** GET api/admin-supply-chain-delivery-profile/?user= */
export const fetchAdminSupplyChainDeliveryProfile = async (
  userId: number
): Promise<Record<string, unknown> | null> => {
  const data = await getJson<{ delivery_profile: Record<string, unknown> | null }>(
    "api/admin-supply-chain-delivery-profile/",
    userId
  );
  return data.delivery_profile ?? null;
};

/** GET api/admin-supply-chain-planned-leaves-nopaginate/?user= */
export const fetchAdminSupplyChainPlannedLeaves = (userId: number, page = 1, limit = 10) =>
  getPaginatedJson<any>("api/admin-supply-chain-planned-leaves-nopaginate/", userId, page, limit);

export type DeliveryFeedbackRow = {
  id: number;
  feedback_type: "issue" | "rating";
  rating: number | null;
  review: string | null;
  issue_type: string | null;
  description: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  order: number | null;
  user_meal: number | null;
  reported_by_details: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  } | null;
  order_details: {
    id: number;
    status: string;
    order_type: string;
    delivery_person: number | null;
  } | null;
  user_meal_details: {
    id: number;
    meal_date: string;
    status: string;
  } | null;
};

/** GET api/admin-supply-chain-delivery-ratings-nopaginate/?user= */
export const fetchAdminSupplyChainDeliveryRatings = (
  userId: number,
  page = 1,
  limit = 10,
  startDate = "",
  endDate = "",
  targetType: "all" | "order" | "user_meal" = "all",
  orderType: "all" | "patient" | "non_patient" = "all",
  feedbackType: "all" | "rating" | "issue" = "all"
) =>
  getPaginatedJson<DeliveryFeedbackRow>("api/admin-supply-chain-delivery-ratings-nopaginate/", userId, page, limit, {
    start_date: startDate,
    end_date: endDate,
    target_type: targetType,
    order_type: orderType,
    feedback_type: feedbackType,
  });

export type AdminSupplyChainEarningsPaginatedResp = PaginatedResponse<any> & {
  total_orders: number;
  total_delivery_earnings: string;
};

/** GET api/admin-supply-chain-earnings-nopaginate/?user= */
export const fetchAdminSupplyChainEarnings = (userId: number, page = 1, limit = 10, startDate = "", endDate = "") =>
  getPaginatedJson<any>("api/admin-supply-chain-earnings-nopaginate/", userId, page, limit, { start_date: startDate, end_date: endDate }) as Promise<AdminSupplyChainEarningsPaginatedResp>;

/** GET api/admin-supply-chain-tickets-nopaginate/?user= */
export const fetchAdminSupplyChainTickets = (userId: number, page = 1, limit = 10) =>
  getPaginatedJson<any>("api/admin-supply-chain-tickets-nopaginate/", userId, page, limit);
