import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface DeliveryAssignment {
    id: number;
    user_meal: number;
    user_meal_details?: {
        meal_type_details: { name: string };
        meal_date: string;
        user_details: {
            first_name: string;
            last_name: string;
            address: string;
            mobile: string;
            latitude?: number | null;
            longitude?: number | null;
        };
        food_details: { name: string };
        micro_kitchen_details: { brand_name: string; address: string };
    };
    status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'rescheduled';
    scheduled_date: string;
    scheduled_time: string | null;
    picked_up_at: string | null;
    delivered_at: string | null;
    delivery_notes: string | null;
}

export const getMyAssignments = async (params?: {
    period?: "today" | "tomorrow" | "this_week" | "last_week" | "this_month" | "last_month" | "next_month" | "custom_range";
    start_date?: string;
    end_date?: string;
    month?: number;
    year?: number;
}): Promise<DeliveryAssignment[]> => {
    const q = new URLSearchParams();
    if (params?.period) q.append("period", params.period);
    if (params?.start_date) q.append("start_date", params.start_date);
    if (params?.end_date) q.append("end_date", params.end_date);
    if (params?.month != null) q.append("month", String(params.month));
    if (params?.year != null) q.append("year", String(params.year));
    const url = createApiUrl(`api/mealdeliveryassignment/${q.toString() ? `?${q.toString()}` : ""}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const updateDeliveryStatus = async (id: number, status: string, notes?: string): Promise<DeliveryAssignment> => {
    const url = createApiUrl(`api/mealdeliveryassignment/${id}/`);
    const payload: any = { status };
    if (notes) payload.delivery_notes = notes;
    if (status === 'picked_up') payload.picked_up_at = new Date().toISOString();
    if (status === 'delivered') payload.delivered_at = new Date().toISOString();
    
    const response = await axios.patch(url, payload, { headers: await getAuthHeaders() });
    return response.data;
};
