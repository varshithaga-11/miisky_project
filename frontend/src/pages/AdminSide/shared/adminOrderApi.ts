import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** Admin-only: list orders for a customer user. Supports pagination for infinite scroll. */
export async function fetchOrdersForUserAdmin(
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ count: number; next: string | null; results: unknown[] }> {
  const url = createApiUrl("api/admin/patient-orders-summary/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: userId, limit, page },
  });
  return res.data;
}

/** Fetch detailed order payload including items, distance, etc. */
export async function fetchOrderDetailsAdmin(orderId: number) {
  const url = createApiUrl(`api/admin/patient-orders-details/${orderId}/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return res.data;
}
