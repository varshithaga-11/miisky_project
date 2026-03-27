import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface NonPatientDashboardStats {
  foods: number;
  microKitchens: number;
  cartItems: number;
  bookings: number;
  supportTickets: number;
  ordersPending: number;
  ordersCompleted: number;
}

export const getNonPatientDashboardStats = async (): Promise<NonPatientDashboardStats> => {
  const response = await axios.get(createApiUrl("api/dashboard-counts/non-patient/"), {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
