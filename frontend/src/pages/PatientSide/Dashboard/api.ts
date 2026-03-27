import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface PatientDashboardStats {
  questionnaire: number;
  healthReports: number;
  nutritionistAllotted: number;
  dietPlans: number;
  microKitchens: number;
  suggestedPlans: number;
  mealsAllotted: number;
  consultations: number;
  foods: number;
  cartItems: number;
  bookings: number;
  supportTickets: number;
  plansPaymentPending: number;
  plansActive: number;
  plansCompleted: number;
  consultationsPending: number;
}

export const getPatientDashboardStats = async (): Promise<PatientDashboardStats> => {
  const response = await axios.get(createApiUrl("api/dashboard-counts/patient/"), {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
