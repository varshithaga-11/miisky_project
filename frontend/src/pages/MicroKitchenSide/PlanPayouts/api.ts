import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { PlanPayoutTrackerRow } from "../../NutritionSide/PlanPayouts/api";

export type { PlanPayoutTrackerRow };

export async function fetchMicroKitchenPlanPayouts(): Promise<PlanPayoutTrackerRow[]> {
  const url = createApiUrl("api/microkitchen/plan-payouts/");
  const res = await axios.get<PlanPayoutTrackerRow[]>(url, { headers: await getAuthHeaders() });
  return res.data;
}
