import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import {
  getMyPatients,
  MappedPatientResponse,
  getPatientReviews,
  NutritionistReview,
} from "../UploadedDocumentsByPatient/api";
import type { DietPlan } from "../../AdminSide/DietPlan/dietplanapi";
import { getDietPlanList } from "../../AdminSide/DietPlan/dietplanapi";

export { getMyPatients, getPatientReviews, getDietPlanList };
export type { MappedPatientResponse, NutritionistReview, DietPlan };

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
  start_date: string | null;
  end_date: string | null;
  suggested_on: string;
  approved_on: string | null;
  created_on: string;
  updated_on: string;
}

export const suggestPlanToPatient = async (data: {
  user: number;
  diet_plan: number;
  micro_kitchen?: number;
  review?: number;
  nutritionist_notes?: string;
}): Promise<UserDietPlan> => {
  const url = createApiUrl("api/userdietplan/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getSuggestedPlansForPatient = async (patientId: number): Promise<UserDietPlan[]> => {
  const url = createApiUrl(`api/userdietplan/?user=${patientId}&limit=100`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const data = response.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};
