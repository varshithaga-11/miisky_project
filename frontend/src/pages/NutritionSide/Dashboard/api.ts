import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface NutritionDashboardStats {
  questionnaire: number;
  allottedPatients: number;
  mealOptimizer: number;
  microKitchens: number;
  patientDocuments: number;
  suggestedPlans: number;
  approvedPlans: number;
  meetingRequests: number;
  supportTickets: number;
}

export const getNutritionDashboardStats = async (): Promise<NutritionDashboardStats> => {
  const response = await axios.get(createApiUrl("api/dashboard-counts/nutrition/"), {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
