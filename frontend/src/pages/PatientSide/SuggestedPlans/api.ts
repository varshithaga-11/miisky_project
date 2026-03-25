import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface UserDietPlan {
  id: number;
  user: number;
  user_details: { id: number; first_name: string; last_name: string; email: string } | null;
  nutritionist: number;
  nutritionist_details: { id: number; first_name: string; last_name: string; email: string } | null;
  diet_plan: number;
  diet_plan_details: {
    id: number;
    title: string;
    code: string;
    amount: string;
    discount_amount: string | null;
    final_amount: string;
    no_of_days: number | null;
    features: { id: number; feature: string; order: number }[];
  } | null;
  micro_kitchen?: number | null;
  micro_kitchen_details?: {
    id: number;
    brand_name: string;
    cuisine_type: string | null;
    time_available: string | null;
    status: string;
  } | null;
  review: number | null;
  review_details: { id: number; comments: string; created_on: string } | null;
  nutritionist_notes: string | null;
  status: string;
  user_feedback: string | null;
  decision_on: string | null;
  amount_paid: string | null;
  transaction_id: string | null;
  payment_status: string;
  payment_screenshot?: string | null;
  payment_uploaded_on?: string | null;
  start_date: string | null;
  end_date: string | null;
  suggested_on: string;
  approved_on: string | null;
  created_on: string;
  updated_on: string;
}

export const getMySuggestedPlans = async (): Promise<UserDietPlan[]> => {
  const url = createApiUrl("api/userdietplan/?limit=100");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const data = response.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const approvePlan = async (id: number, startDate?: string): Promise<UserDietPlan> => {
  const url = createApiUrl(`api/userdietplan/${id}/approve/`);
  const body = startDate ? { start_date: startDate } : {};
  const response = await axios.post(url, body, { headers: await getAuthHeaders() });
  return response.data;
};

export const rejectPlan = async (id: number, feedback?: string): Promise<UserDietPlan> => {
  const url = createApiUrl(`api/userdietplan/${id}/reject/`);
  const response = await axios.post(url, { user_feedback: feedback }, { headers: await getAuthHeaders() });
  return response.data;
};

export const uploadPaymentScreenshot = async (
  id: number,
  file: File,
  amountPaid?: string,
  transactionId?: string
): Promise<UserDietPlan> => {
  const url = createApiUrl(`api/userdietplan/${id}/upload_payment/`);
  const formData = new FormData();
  formData.append("screenshot", file);
  if (amountPaid) formData.append("amount_paid", amountPaid);
  if (transactionId) formData.append("transaction_id", transactionId);
  const { "Content-Type": _, ...headers } = (await getAuthHeaders()) as Record<string, string>;
  const response = await axios.post(url, formData, {
    headers: { ...headers },
  });
  return response.data;
};
