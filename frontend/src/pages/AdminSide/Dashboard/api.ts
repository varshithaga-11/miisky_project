import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface AdminDashboardStats {
  countries: number;
  states: number;
  cities: number;
  users: number;
  patients: number;
  nutritionists: number;
  microKitchens: number;
  allottedPatients: number;
  patents: number;
  supportTickets: number;
  healthParameters: number;
}

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const response = await axios.get(createApiUrl("api/dashboard-counts/admin/"), {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
