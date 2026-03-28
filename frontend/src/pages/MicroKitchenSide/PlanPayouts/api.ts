import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { PlanPayoutRecord } from "../../NutritionSide/PlanPayouts/api";

export type { PlanPayoutRecord };

export async function fetchMicroKitchenPlanPayouts(): Promise<PlanPayoutRecord[]> {
  const url = createApiUrl("api/microkitchen/plan-payouts/");
  const res = await axios.get<PlanPayoutRecord[]>(url, { headers: await getAuthHeaders() });
  return res.data;
}
