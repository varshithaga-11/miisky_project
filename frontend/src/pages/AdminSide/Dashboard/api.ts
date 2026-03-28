import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface AdminDashboardStats {
  countries: number;
  states: number;
  cities: number;
  users: number;
  patients: number;
  nonPatients: number;
  nutritionists: number;
  microKitchens: number;
  allottedPatients: number;
  patents: number;
  supportTickets: number;
  healthParameters: number;
  mealTypes: number;
  cuisineTypes: number;
  packaging: number;
  recipes: number;
  foodGroups: number;
  foodNames: number;
  nutrients: number;
  dietPlans: number;
  verifications: number;
  ticketsOpen: number;
  ticketsInProgress: number;
  ticketsResolved: number;
  plansPaymentPending: number;
  plansActive: number;
  plansCompleted: number;
}

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const response = await axios.get(createApiUrl("api/dashboard-counts/admin/"), {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
