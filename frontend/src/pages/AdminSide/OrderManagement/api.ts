import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/**
 * Fetches all orders (Patient and Non-Patient) for the administrative overview.
 */
export const getAllOrders = async (page: number = 1, limit: number = 10, search: string = "") => {
  const url = createApiUrl("api/admin/all-orders/");
  const response = await axios.get(url, {
    params: { page, limit, search },
    headers: await getAuthHeaders()
  });
  return response.data;
};

/**
 * Fetches kitchen payout reports.
 */
export const getKitchenPayouts = async (page: number = 1, limit: number = 10, search: string = "") => {
  const url = createApiUrl("api/admin/kitchen-payouts/");
  const response = await axios.get(url, {
    params: { page, limit, search },
    headers: await getAuthHeaders()
  });
  return response.data;
};
