import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface PlanPayoutRecord {
  id: number;
  ledger: number;
  ledger_gross: string;
  recipient_role: string;
  nutritionist: number | null;
  micro_kitchen: number | null;
  amount: string;
  period_from: string | null;
  period_to: string | null;
  reason: string;
  status: string;
  paid_on: string | null;
  created_at: string;
  patient_name: string | null;
  plan_title: string | null;
}

export async function fetchNutritionistPlanPayouts(): Promise<PlanPayoutRecord[]> {
  const url = createApiUrl("api/nutrition/plan-payouts/");
  const res = await axios.get<PlanPayoutRecord[]>(url, { headers: await getAuthHeaders() });
  return res.data;
}
