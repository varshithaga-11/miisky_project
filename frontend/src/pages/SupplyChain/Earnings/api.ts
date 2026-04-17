import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type SupplyChainPayoutRow = {
  id: number;
  micro_kitchen_name: string | null;
  patient: number | null;
  patient_name: string;
  plan_name: string;
  amount: string;
  status: "pending" | "paid";
  period_from: string | null;
  period_to: string | null;
  transaction_reference: string | null;
  payment_screenshot_url: string | null;
  paid_on: string | null;
  created_at: string;
};

export type PaginatedSupplyChainPayoutEarnings = {
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

export type SupplyChainEarningsFilters = {
  status?: string;
  patient_id?: number | "";
  period?: string;
  start_date?: string;
  end_date?: string;
};

export async function getSupplyChainPayoutEarnings(
  page = 1,
  limit = 10,
  search = "",
  filters: SupplyChainEarningsFilters = {}
): Promise<PaginatedSupplyChainPayoutEarnings> {
  const params: Record<string, string | number> = { page, limit };
  if (search.trim()) params.search = search.trim();
  if (filters.status) params.status = filters.status;
  if (filters.patient_id) params.patient_id = Number(filters.patient_id);
  if (filters.period) params.period = filters.period;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  const url = createApiUrl("api/supply-chain/payout-earnings/");
  const res = await axios.get<PaginatedSupplyChainPayoutEarnings>(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return res.data;
}

export async function upsertSupplyChainPayoutProof(
  payoutId: number,
  transactionReference: string,
  screenshot: File | null
): Promise<unknown> {
  const url = createApiUrl(`api/supply-chain/payout-earnings/${payoutId}/proof/`);
  const fd = new FormData();
  fd.append("transaction_reference", transactionReference);
  if (screenshot) fd.append("payment_screenshot", screenshot);
  const headers = await getAuthHeaders();
  const { Authorization } = headers;
  const res = await axios.patch(url, fd, { headers: { Authorization } });
  return res.data;
}
