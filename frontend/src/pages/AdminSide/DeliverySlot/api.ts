import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface KitchenMinimal {
  id: number;
  brand_name: string | null;
  cuisine_type?: string | null;
}

export const fetchApprovedKitchensMinimal = async (): Promise<KitchenMinimal[]> => {
  const url = createApiUrl("api/microkitchenprofile/list_minimal/?status=approved");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return Array.isArray(res.data) ? res.data : [];
};

export interface DeliverySlot {
  id: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  micro_kitchen: number | null;
  micro_kitchen_brand?: string | null;
}

export const fetchDeliverySlots = async (): Promise<DeliverySlot[]> => {
  const url = createApiUrl("api/delivery-slot/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const createDeliverySlot = async (payload: {
  name: string;
  start_time?: string | null;
  end_time?: string | null;
  micro_kitchen?: number | null;
}): Promise<DeliverySlot> => {
  const url = createApiUrl("api/delivery-slot/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const updateDeliverySlot = async (
  id: number,
  payload: Partial<{
    name: string;
    start_time: string | null;
    end_time: string | null;
    micro_kitchen: number | null;
  }>
): Promise<DeliverySlot> => {
  const url = createApiUrl(`api/delivery-slot/${id}/`);
  const res = await axios.patch(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const deleteDeliverySlot = async (id: number): Promise<void> => {
  const url = createApiUrl(`api/delivery-slot/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};
