import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface Transaction {
  id: string | number;
  date: string;
  amount: number | string;
  status: string;
  type: "Meal Order";
  reference: string;
  details: string;
}

export interface OrderPagination {
    count: number;
    results: Transaction[];
    current_page: number;
    total_pages: number;
    total_orders: number;
    total_amount: number;
}

export const getOrderPaymentHistory = async (params?: {
    search?: string;
    period?: string;
    start_date?: string;
    end_date?: string;
    micro_kitchen?: string;
    page?: number;
    limit?: number;
}): Promise<OrderPagination> => {
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

    const response = await axios.get<OrderPagination>(url, { 
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
    }));

    return {
        ...response.data,
        results: orderTransactions
    };
  } catch (error) {
    console.error("Error fetching order payment history:", error);
    throw error;
  }
};
