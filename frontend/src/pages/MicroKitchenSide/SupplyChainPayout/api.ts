import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type SupplyChainPayoutRow = {
  id: number;
  micro_kitchen: number | null;
  micro_kitchen_name: string;
  delivery_person: number | null;
  delivery_person_name: string;
  user_diet_plan: number | null;
  plan_name: string;
  patient: number | null;
  patient_name: string;
  amount: string;
  status: "pending" | "paid";
  period_from: string | null;
  period_to: string | null;
  notes: string | null;
  paid_on: string | null;
  paid_by: number | null;
  paid_by_name: string;
  created_at: string;
  updated_at: string;
};

export type PaginatedSupplyChainPayouts = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: SupplyChainPayoutRow[];
  total_amount?: string;
  paid_amount?: string;
  pending_amount?: string;
};

export type CreateSupplyChainPayoutPayload = {
  delivery_person: number;
  user_diet_plan?: number | null;
  patient?: number | null;
  amount: string;
  status?: "pending" | "paid";
  period_from?: string;
  period_to?: string;
  notes?: string;
};

export type SupplyChainPayoutFilters = {
  status?: string;
  patient_id?: number | "";
  delivery_person_id?: number | "";
  period?: string;
  start_date?: string;
  end_date?: string;
};

export async function fetchMicroKitchenSupplyChainPayouts(
  page = 1,
  limit = 10,
  search = "",
  filters: SupplyChainPayoutFilters = {}
): Promise<PaginatedSupplyChainPayouts> {
  const params: Record<string, string | number> = { page, limit };
  if (search.trim()) params.search = search.trim();
  if (filters.status) params.status = filters.status;
  if (filters.patient_id) params.patient_id = Number(filters.patient_id);
  if (filters.delivery_person_id) params.delivery_person_id = Number(filters.delivery_person_id);
  if (filters.period) params.period = filters.period;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  const url = createApiUrl("api/microkitchen/supply-chain-payouts/");
  const res = await axios.get<PaginatedSupplyChainPayouts>(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return res.data;
}

export async function createMicroKitchenSupplyChainPayout(
  payload: CreateSupplyChainPayoutPayload
): Promise<SupplyChainPayoutRow> {
  const url = createApiUrl("api/microkitchen/supply-chain-payouts/");
  const res = await axios.post<SupplyChainPayoutRow>(url, payload, {
    headers: await getAuthHeaders(),
  });
  return res.data;
}

export async function updateMicroKitchenSupplyChainPayout(
  id: number,
  payload: Partial<CreateSupplyChainPayoutPayload>
): Promise<SupplyChainPayoutRow> {
  const url = createApiUrl(`api/microkitchen/supply-chain-payouts/${id}/`);
  const res = await axios.patch<SupplyChainPayoutRow>(url, payload, {
    headers: await getAuthHeaders(),
  });
  return res.data;
}
