import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** Matches backend PayoutTrackerSerializer */
export interface PlanPayoutTrackerRow {
  id: number;
  snapshot: number;
  snapshot_total: string;
  payout_type: string;
  nutritionist: number | null;
  micro_kitchen: number | null;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  period_from: string | null;
  period_to: string | null;
  status: string;
  is_closed: boolean;
  closed_reason: string | null;
  closed_on: string | null;
  created_at: string;
  patient_name: string | null;
  plan_title: string | null;
}

export async function fetchNutritionistPlanPayouts(): Promise<PlanPayoutTrackerRow[]> {
  const url = createApiUrl("api/nutrition/plan-payouts/");
  const res = await axios.get<PlanPayoutTrackerRow[]>(url, { headers: await getAuthHeaders() });
  return res.data;
}
