import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type DeliveryChargeSlab = {
  id: number;
  micro_kitchen: number;
  min_km: string;
  max_km: string;
  charge: string;
};

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results: T[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export const listMyDeliverySlabs = async (): Promise<DeliveryChargeSlab[]> => {
  const url = createApiUrl("api/deliverychargeslab/");
  const res = await axios.get(url, { headers: await getAuthHeaders(), params: { limit: 100, page: 1 } });
  return unwrap<DeliveryChargeSlab>(res.data);
};

export const createDeliverySlab = async (payload: { min_km: number; max_km: number; charge: number }) => {
  const url = createApiUrl("api/deliverychargeslab/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data as DeliveryChargeSlab;
};

export const updateDeliverySlab = async (
  id: number,
  payload: Partial<{ min_km: number; max_km: number; charge: number }>
) => {
  const url = createApiUrl(`api/deliverychargeslab/${id}/`);
  const res = await axios.patch(url, payload, { headers: await getAuthHeaders() });
  return res.data as DeliveryChargeSlab;
};

export const deleteDeliverySlab = async (id: number) => {
  const url = createApiUrl(`api/deliverychargeslab/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};
