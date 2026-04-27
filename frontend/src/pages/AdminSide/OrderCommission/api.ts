import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** If `__API_URL__` already includes `/api`, `createApiUrl("api/...")` can produce `/api/api/`. */
function buildApiUrl(path: string): string {
  const url = createApiUrl(path);
  return url.replace(/\/api\/api\//g, "/api/");
}

export interface OrderCommissionConfig {
  id?: number;
  platform_commission_percent: string;
  kitchen_commission_percent: string;
  is_active: boolean;
  notes?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderPaymentSnapshot {
  id: number;
  order: number;
  order_id?: number;
  order_status?: string;
  order_type?: string;
  order_created_at?: string;
  customer_display?: string;
  food_subtotal: string;
  delivery_charge: string;
  grand_total: string;
  platform_percent: string;
  kitchen_percent: string;
  platform_amount: string;
  kitchen_amount: string;
  created_at: string;
}

/** Same values as `get_period_range` in backend `app/utils/date_utils.py` (and order list). */
export type SnapshotDatePeriod =
  | "all"
  | "today"
  | "tomorrow"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "next_month"
  | "this_quarter"
  | "this_year"
  | "custom_range";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  current_page?: number;
  total_pages?: number;
  results: T[];
  total_orders?: number;
  total_kitchen_amount?: string;
  total_platform_amount?: string;
  total_food_subtotal?: string;
  total_delivery_charge?: string;
  total_grand_total?: string;
  /** Sum of grand totals (same as total_grand_total); customer order totals for the filter. */
  total_amount?: string;
}

const COMMISSION_BASE = "api/order-commission-config/";
const SNAPSHOT_BASE = "api/order-payment-snapshot/";

export const getOrderCommissionConfigs = async (): Promise<OrderCommissionConfig[]> => {
  const res = await axios.get(buildApiUrl(COMMISSION_BASE), {
    headers: await getAuthHeaders(),
  });
  return res.data as OrderCommissionConfig[];
};

export const createOrderCommissionConfig = async (
  payload: Omit<OrderCommissionConfig, "id" | "created_at" | "updated_at">
): Promise<OrderCommissionConfig> => {
  const res = await axios.post(buildApiUrl(COMMISSION_BASE), payload, {
    headers: await getAuthHeaders(),
  });
  return res.data as OrderCommissionConfig;
};

export const updateOrderCommissionConfig = async (
  id: number,
  payload: Partial<OrderCommissionConfig>
): Promise<OrderCommissionConfig> => {
  const res = await axios.put(buildApiUrl(`${COMMISSION_BASE}${id}/`), payload, {
    headers: await getAuthHeaders(),
  });
  return res.data as OrderCommissionConfig;
};

export const getOrderPaymentSnapshots = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  options?: {
    period?: SnapshotDatePeriod;
    start_date?: string;
    end_date?: string;
    /** Filter by MicroKitchen ID. */
    kitchen?: string;
  }
): Promise<PaginatedResponse<OrderPaymentSnapshot>> => {
  const params: Record<string, string | number | undefined> = { page, limit, search: search.trim() || undefined };
  if (options?.kitchen) {
    params.kitchen = options.kitchen;
  }

  if (options?.period && options.period !== "all") {
    params.period = options.period;
    if (options.period === "custom_range") {
      if (options.start_date) params.start_date = options.start_date;
      if (options.end_date) params.end_date = options.end_date;
    }
  }
  const res = await axios.get(buildApiUrl(SNAPSHOT_BASE), {
    params,
    headers: await getAuthHeaders(),
  });
  return res.data as PaginatedResponse<OrderPaymentSnapshot>;
};
