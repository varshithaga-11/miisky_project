import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type DeliveryEarningReceipt = {
  id: number;
  receipt_image_url: string | null;
  notes: string;
  updated_at: string | null;
} | null;

export type DeliveryEarningRow = {
  id: number;
  kitchen_name: string | null;
  customer_display: string;
  order_type: string;
  status: string;
  delivery_earning: string;
  snapshot_delivery_charge: string | null;
  final_amount: string;
  created_at: string;
  receipt: DeliveryEarningReceipt;
};

export type PaginatedDeliveryEarnings = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: DeliveryEarningRow[];
  total_orders?: number;
  total_delivery_earnings?: string;
};

export async function getSupplyChainDeliveryEarnings(
  page = 1,
  limit = 10,
  search = ""
): Promise<PaginatedDeliveryEarnings> {
  const params: Record<string, string | number> = { page, limit };
  if (search.trim()) params.search = search.trim();
  const url = createApiUrl("api/supply-chain/delivery-earnings/");
  const res = await axios.get<PaginatedDeliveryEarnings>(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return res.data;
}

/**
 * Create or update receipt for a delivered order assigned to you.
 * First upload requires `file`. Later you can send only `notes`, or a new `file` to replace the image.
 */
export async function upsertOrderDeliveryReceipt(
  orderId: number,
  notes: string,
  file: File | null
): Promise<unknown> {
  const fd = new FormData();
  fd.append("order_id", String(orderId));
  fd.append("notes", notes);
  if (file) fd.append("receipt_image", file);
  const headers = await getAuthHeaders();
  const { Authorization } = headers;
  const url = createApiUrl("api/supply-chain/order-delivery-receipt/");
  const res = await axios.post(url, fd, {
    headers: { Authorization },
  });
  return res.data;
}
