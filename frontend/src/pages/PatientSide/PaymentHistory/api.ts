import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface Transaction {
  id: string | number;
  date: string;
  amount: number | string;
  status: string;
  type: "Plan Purchase" | "Meal Order";
  reference: string;
  details: string;
  screenshot?: string | null;
  originalData?: any;
}

export interface PaymentPagination {
    count: number;
    results: Transaction[];
    current_page: number;
    total_pages: number;
    total_orders?: number;
    total_amount?: number;
}

/** 
 * Fetches diet plan purchases for the current user.
 * The user requested no pagination for this part.
 */
export const getDietPlanHistory = async (): Promise<Transaction[]> => {
  try {
    const response = await axios.get(createApiUrl("api/userdietplan/all-user-plans/"), { 
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
        screenshot: p.payment_screenshot,
        originalData: p
      }));

    return planTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching plan history:", error);
    throw error;
  }
};

/** 
 * Fetches meal orders for the current user with pagination and filters.
 */
export const getOrderHistory = async (params?: {
    search?: string;
    period?: string;
    start_date?: string;
    end_date?: string;
    micro_kitchen?: string;
    page?: number;
    limit?: number;
}): Promise<PaymentPagination> => {
    try {
      let url = createApiUrl("api/order/");
      const query = new URLSearchParams();
      if (params?.search) query.append("search", params.search);
      if (params?.period) query.append("period", params.period);
      if (params?.start_date) query.append("start_date", params.start_date);
      if (params?.end_date) query.append("end_date", params.end_date);
      if (params?.micro_kitchen) query.append("micro_kitchen", params.micro_kitchen);
      if (params?.page) query.append("page", params.page.toString());
      if (params?.limit) query.append("limit", params.limit.toString());
      
      if (query.toString()) url += `?${query.toString()}`;
  
      const response = await axios.get<PaymentPagination>(url, { 
        headers: await getAuthHeaders() 
      });
  
      const results = response.data.results || [];
  
      const orderTransactions: Transaction[] = results.map((o: any) => ({
          id: `order-${o.id}`,
          date: o.created_at,
          amount: o.final_amount || o.total_amount,
          status: o.status === 'delivered' ? 'Paid' : o.status === 'cancelled' ? 'Cancelled' : 'Pending',
          type: "Meal Order",
          reference: `#${o.id}`,
          details: o.kitchen_details?.brand_name || "Meal Order",
          originalData: o
      }));
  
      return {
          ...response.data,
          results: orderTransactions
      };
    } catch (error) {
      console.error("Error fetching order history:", error);
      throw error;
    }
};
