import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

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
  food_subtotal: string;
  delivery_charge: string;
  grand_total: string;
  platform_percent: string;
  kitchen_percent: string;
  platform_amount: string;
  kitchen_amount: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  current_page?: number;
  total_pages?: number;
  results: T[];
}

const COMMISSION_BASE = "api/order-commission-config/";
const SNAPSHOT_BASE = "api/order-payment-snapshot/";

export const getOrderCommissionConfigs = async (): Promise<OrderCommissionConfig[]> => {
  const res = await axios.get(createApiUrl(COMMISSION_BASE), {
    headers: await getAuthHeaders(),
  });
  return res.data as OrderCommissionConfig[];
};

export const createOrderCommissionConfig = async (
  payload: Omit<OrderCommissionConfig, "id" | "created_at" | "updated_at">
): Promise<OrderCommissionConfig> => {
  const res = await axios.post(createApiUrl(COMMISSION_BASE), payload, {
    headers: await getAuthHeaders(),
  });
  return res.data as OrderCommissionConfig;
};

export const updateOrderCommissionConfig = async (
  id: number,
  payload: Partial<OrderCommissionConfig>
): Promise<OrderCommissionConfig> => {
  const res = await axios.put(createApiUrl(`${COMMISSION_BASE}${id}/`), payload, {
    headers: await getAuthHeaders(),
  });
  return res.data as OrderCommissionConfig;
};

export const getOrderPaymentSnapshots = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<PaginatedResponse<OrderPaymentSnapshot>> => {
  const res = await axios.get(createApiUrl(SNAPSHOT_BASE), {
    params: { page, limit, search },
    headers: await getAuthHeaders(),
  });
  return res.data as PaginatedResponse<OrderPaymentSnapshot>;
};
