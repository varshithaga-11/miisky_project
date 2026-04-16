import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type UserDietPlanRow = {
  id: number;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  diet_plan_details?: {
    id: number;
    title: string;
  } | null;
};

export type UserMealLite = {
  id: number;
  meal_date: string;
  status: string;
  meal_type_details?: {
    id: number;
    name: string;
  } | null;
  food_details?: {
    id: number;
    name: string;
  } | null;
};

export type DeliveryIssuePayload = {
  user_meal: number;
  issue_type: "not_home" | "wrong_address" | "food_damaged" | "late_delivery" | "kitchen_delay" | "other";
  description?: string;
};

export async function fetchMyDietPlans(): Promise<UserDietPlanRow[]> {
  const url = createApiUrl("api/userdietplan/all-user-plans/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return Array.isArray(response.data) ? response.data : [];
}

export async function fetchMealsByPlanDate(
  userDietPlan: number,
  mealDate: string
): Promise<UserMealLite[]> {
  const url = createApiUrl(
    `api/usermeal/?user_diet_plan=${userDietPlan}&meal_date=${mealDate}&limit=200`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  if (Array.isArray(response.data)) return response.data;
  return Array.isArray(response.data?.results) ? response.data.results : [];
}

export async function submitDeliveryIssue(payload: DeliveryIssuePayload) {
  const url = createApiUrl("api/delivery-feedback/");
  const response = await axios.post(
    url,
    {
      feedback_type: "issue",
      user_meal: payload.user_meal,
      issue_type: payload.issue_type,
      description: payload.description || "",
    },
    { headers: await getAuthHeaders() }
  );
  return response.data;
}
