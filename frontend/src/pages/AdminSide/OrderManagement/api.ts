import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** Same period keys as `get_period_range` in backend `app/utils/date_utils.py`. */
export type OrderListDatePeriod =
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

export interface AdminAllOrdersResponse {
  count: number;
  next: number | null;
  previous: number | null;
  current_page?: number;
  total_pages?: number;
  results: unknown[];
  /** Count of orders matching filters (same as `count`). */
  total_orders?: number;
  /** Sum of `final_amount` for filtered orders. */
  total_amount?: string;
  /** Sum of `delivery_charge` for filtered orders. */
  total_delivery_charge?: string;
  /** Sum of snapshot kitchen splits for filtered orders (0 if no snapshot). */
  total_kitchen_amount?: string;
  /** Sum of snapshot platform splits for filtered orders (0 if no snapshot). */
  total_platform_amount?: string;
}

/**
 * Fetches all orders (Patient and Non-Patient) for the administrative overview.
 * Optional `billing_month` (YYYY-MM) overrides `period`. Dates filter on order `created_at`.
 */
export const getAllOrders = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  microkitchen: string = "",
  options?: {
    period?: OrderListDatePeriod;
    start_date?: string;
    end_date?: string;
    billing_month?: string;
  }
): Promise<AdminAllOrdersResponse> => {
  const url = createApiUrl("api/admin/all-orders/");
  const params: Record<string, string | number | undefined> = {
    page,
    limit,
    search: search.trim() || undefined,
    microkitchen: microkitchen || undefined,
  };
  if (options?.billing_month?.trim()) {
    params.billing_month = options.billing_month.trim();
  } else if (options?.period) {
    params.period = options.period;
    if (options.period === "custom_range") {
      if (options.start_date) params.start_date = options.start_date;
      if (options.end_date) params.end_date = options.end_date;
    }
  }
  const response = await axios.get(url, {
    params,
    headers: await getAuthHeaders(),
  });
  return response.data as AdminAllOrdersResponse;
};

export const getMicroKitchens = async () => {
  const url = createApiUrl("api/microkitchenprofile/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders()
  });
  return response.data;
};

export interface KitchenPayoutRow {
  id: number;
  kitchen_name: string;
  total_sales: number;
  order_commission_example: number;
  diet_plan_payout_pending: number;
  diet_plan_payout_disbursed: number;
  payout_status: string;
}

/**
 * Fetches kitchen payout reports (orders + diet plan payout totals).
 */
export const getKitchenPayouts = async (page: number = 1, limit: number = 10, search: string = "") => {
  const url = createApiUrl("api/admin/kitchen-payouts/");
  const response = await axios.get(url, {
    params: { page, limit, search },
    headers: await getAuthHeaders()
  });
  return response.data;
};
/**
 * Fetches details for a specific order by its ID.
 */
export const getOrderById = async (id: number | string) => {
  const url = createApiUrl(`api/order/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders()
  });
  return response.data;
};
