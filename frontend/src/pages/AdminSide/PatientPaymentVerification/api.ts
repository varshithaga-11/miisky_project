import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface UserDietPlanPayment {
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
    final_amount: string;
    no_of_days: number | null;
  } | null;
  micro_kitchen: number | null;
  micro_kitchen_details: {
    id: number;
    brand_name: string;
    cuisine_type: string | null;
    time_available: string | null;
    status: string;
  } | null;
  status: string;
  payment_status: string;
  payment_screenshot: string | null;
  payment_uploaded_on: string | null;
  is_payment_verified: boolean;
  start_date: string | null;
  end_date: string | null;
  suggested_on: string;
  approved_on: string | null;
}

export const getPendingPaymentVerifications = async (
  paymentStatus = "uploaded"
): Promise<UserDietPlanPayment[]> => {
  const url = createApiUrl(`api/userdietplan/?payment_status=${paymentStatus}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const data = response.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const verifyPayment = async (
  id: number,
  startDate?: string
): Promise<UserDietPlanPayment> => {
  const url = createApiUrl(`api/userdietplan/${id}/verify_payment/`);
  const response = await axios.post(
    url,
    startDate ? { start_date: startDate } : {},
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

export const rejectPayment = async (id: number): Promise<UserDietPlanPayment> => {
  const url = createApiUrl(`api/userdietplan/${id}/reject_payment/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};
