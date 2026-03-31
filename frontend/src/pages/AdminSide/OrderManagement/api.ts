import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/**
 * Fetches all orders (Patient and Non-Patient) for the administrative overview.
 */
export const getAllOrders = async (page: number = 1, limit: number = 10, search: string = "", microkitchen: string = "") => {
  const url = createApiUrl("api/admin/all-orders/");
  const response = await axios.get(url, {
    params: { page, limit, search, microkitchen },
    headers: await getAuthHeaders()
  });
  return response.data;
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
