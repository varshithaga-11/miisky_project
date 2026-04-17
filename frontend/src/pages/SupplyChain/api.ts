import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../access/access";

export interface SupplyChainLeave {
  id: number;
  user: number;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    username?: string;
    mobile?: string | null;
  };
  leave_type: "full_day" | "partial";
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  /** Micro kitchen: meal reassignments / leave coverage progress */
  kitchen_handling_status?: "not_started" | "in_progress" | "complete";
  created_on: string;
}

export const fetchSupplyChainLeaves = async (): Promise<SupplyChainLeave[]> => {
  const url = createApiUrl("api/supply-chain-leave/?limit=500");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const createSupplyChainLeave = async (payload: {
  leave_type: "full_day" | "partial";
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
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
