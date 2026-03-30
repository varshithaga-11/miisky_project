import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface PayoutTrackerLine {
  id: number;
  payout_type: string;
  recipient_label: string;
  period_from: string | null;
  period_to: string | null;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: string;
  is_closed: boolean;
  closed_reason: string | null;
}

export interface PlanPaymentOverviewRow {
  id: number;
  user_diet_plan: number;
  created_at: string;
  total_amount: string;
  platform_percent: string;
  nutrition_percent: string;
  kitchen_percent: string;
  platform_amount: string;
  nutrition_amount: string;
  kitchen_amount: string;
  patient: { id: number; name: string; email: string | null } | null;
  diet_plan: { id: number; title: string; code: string | null; no_of_days: number | null } | null;
  nutritionist: { id: number; name: string } | null;
  micro_kitchen: { id: number; brand_name: string } | null;
  user_diet_plan_status: string;
  payment_status: string;
  is_payment_verified: boolean;
  amount_paid_reported: string | null;
  transaction_id: string | null;
  verified_on: string | null;
  verified_by_name: string | null;
  plan_start_date: string | null;
  plan_end_date: string | null;
  total_disbursed: string;
  total_outstanding: string;
  payout_trackers: PayoutTrackerLine[];
}

export interface PaginatedPlanPayments {
  count: number;
  results: PlanPaymentOverviewRow[];
  current_page: number;
  total_pages: number;
}

export async function fetchPlanPaymentsOverview(
  page = 1,
  limit = 12,
  search = ""
): Promise<PaginatedPlanPayments> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) params.set("search", search.trim());
  const url = createApiUrl(`api/admin/plan-payments-overview/?${params.toString()}`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data as PaginatedPlanPayments;
}
