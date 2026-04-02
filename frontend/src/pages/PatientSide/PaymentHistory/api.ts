import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface Transaction {
  id: string | number;
  date: string;
  amount: number | string;
  status: string;
  type: "Plan Purchase";
  reference: string;
  details: string;
  screenshot?: string | null;
}

export const getPaymentHistory = async (): Promise<Transaction[]> => {
  try {
    const response = await axios.get(createApiUrl("api/userdietplan/?limit=100"), { 
      headers: await getAuthHeaders() 
    });

    const plansData = Array.isArray(response.data) ? response.data : response.data?.results ?? [];

    const planTransactions: Transaction[] = (plansData as any[])
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

    return planTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};
