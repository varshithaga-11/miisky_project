import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../access/access";

export interface SupplyChainLeave {
  id: number;
  user: number;
  user_details?: { id: number; first_name: string; last_name: string; username?: string };
  /** ISO 8601 — includes date and time */
  start_at: string;
  end_at: string;
  notes: string | null;
  created_on: string;
}

export const fetchSupplyChainLeaves = async (): Promise<SupplyChainLeave[]> => {
  const url = createApiUrl("api/supply-chain-leave/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const createSupplyChainLeave = async (payload: {
  start_at: string;
  end_at: string;
  notes?: string | null;
}): Promise<SupplyChainLeave> => {
  const url = createApiUrl("api/supply-chain-leave/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const deleteSupplyChainLeave = async (id: number): Promise<void> => {
  const url = createApiUrl(`api/supply-chain-leave/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};
