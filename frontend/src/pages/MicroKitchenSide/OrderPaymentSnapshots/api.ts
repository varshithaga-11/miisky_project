import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type OrderPaymentSnapshotRow = {
  id: number;
  order_id: number;
  order_status: string;
  order_type: string;
  order_created_at: string;
  customer_display: string;
  food_subtotal: string;
  delivery_charge: string;
  grand_total: string;
  platform_percent: string;
  kitchen_percent: string;
  platform_amount: string;
  kitchen_amount: string;
  created_at: string;
};

export type PaginatedOrderPaymentSnapshots = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: OrderPaymentSnapshotRow[];
  total_orders?: number;
  total_kitchen_amount?: string;
  total_platform_amount?: string;
};

export async function getMicroKitchenOrderPaymentSnapshots(
  page = 1,
  limit = 10,
  search = "",
  period = "",
  startDate = "",
  endDate = "",
  deliveryPerson = "",
  orderType = ""
): Promise<PaginatedOrderPaymentSnapshots> {
  const params: Record<string, string | number> = { page, limit };
  if (search.trim()) params.search = search.trim();
  if (period && period !== "all") params.period = period;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (deliveryPerson && deliveryPerson !== "all") params.delivery_person = deliveryPerson;
  if (orderType && orderType !== "all") params.order_type = orderType;

  const url = createApiUrl("api/microkitchen/order-payment-snapshots/");
  const res = await axios.get<PaginatedOrderPaymentSnapshots>(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return res.data;
}
