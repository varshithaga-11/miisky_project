import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface MicroKitchenDashboardStats {
  questionnaire: number;
  inspectionReports: number;
  patients: number;
  dailyPrep: number;
  orders: number;
  availableFoods: number;
  kitchenReviews: number;
  supportTickets: number;
  ordersPending: number;
  ordersCompleted: number;
  foodsAvailable: number;
  foodsOutOfStock: number;
}

export const getMicroKitchenDashboardStats = async (): Promise<MicroKitchenDashboardStats> => {
  const response = await axios.get(createApiUrl("api/dashboard-counts/microkitchen/"), {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
