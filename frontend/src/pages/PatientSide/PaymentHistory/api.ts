import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { UserDietPlan } from "../SuggestedPlans/api";
import { Order } from "../../NonPatient/orderapi";

export interface Transaction {
  id: string | number;
  date: string;
  amount: number | string;
  status: string;
  type: "Plan Purchase" | "Meal Order";
  reference: string;
  details: string;
  screenshot?: string | null;
}

export const getPaymentHistory = async (): Promise<Transaction[]> => {
  try {
    const [plansResponse, ordersResponse] = await Promise.all([
      axios.get(createApiUrl("api/userdietplan/?limit=100"), { headers: await getAuthHeaders() }),
      axios.get(createApiUrl("api/order/"), { headers: await getAuthHeaders() })
    ]);

    const plansData = Array.isArray(plansResponse.data) ? plansResponse.data : plansResponse.data?.results ?? [];
    const ordersData = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data?.results ?? [];

    const planTransactions: Transaction[] = (plansData as UserDietPlan[])
      .filter(p => p.amount_paid || p.payment_status === 'verified' || p.payment_status === 'pending')
      .map(p => ({
        id: `plan-${p.id}`,
        date: p.payment_uploaded_on || p.created_on,
        amount: p.amount_paid || p.diet_plan_details?.final_amount || 0,
        status: p.payment_status,
        type: "Plan Purchase",
        reference: p.transaction_id || "N/A",
        details: p.diet_plan_details?.title || "Health Plan",
        screenshot: p.payment_screenshot
      }));

    const orderTransactions: Transaction[] = (ordersData as Order[])
      .map(o => ({
        id: `order-${o.id}`,
        date: o.created_at,
        amount: o.final_amount || o.total_amount,
        status: o.status === 'delivered' ? 'Paid' : o.status === 'cancelled' ? 'Cancelled' : 'Pending',
        type: "Meal Order",
        reference: `#${o.id}`,
        details: o.kitchen_details?.brand_name || "Meal Order",
      }));

    return [...planTransactions, ...orderTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};
