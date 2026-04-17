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

export interface PaginatedSupplyChainLeaves {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: SupplyChainLeave[];
}

export const fetchSupplyChainLeaves = async (): Promise<SupplyChainLeave[]> => {
  const url = createApiUrl("api/supply-chain-leave/?limit=500");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const fetchSupplyChainLeavesPaginated = async (params: {
  page?: number;
  limit?: number;
  period?: string;
  start_date?: string;
  end_date?: string;
}): Promise<PaginatedSupplyChainLeaves> => {
  const q = new URLSearchParams();
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 10));
  if (params.period && params.period !== "all") q.set("period", params.period);
  if (params.start_date) q.set("start_date", params.start_date);
  if (params.end_date) q.set("end_date", params.end_date);
  const url = createApiUrl(`api/supply-chain-leave/?${q.toString()}`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data || {};
  return {
    count: data.count ?? 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    current_page: data.current_page ?? 1,
    total_pages: data.total_pages ?? 1,
    results: Array.isArray(data.results) ? data.results : [],
  };
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
