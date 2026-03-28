import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** Admin-only: list orders for a customer user (`user` query param on `api/order/`). */
export async function fetchOrdersForUserAdmin(userId: number): Promise<unknown[]> {
  const url = createApiUrl("api/order/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: userId, limit: 200, page: 1 },
  });
  const d = res.data;
  return Array.isArray(d) ? d : d?.results ?? [];
}
