import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface DeliveryAssignment {
    id: number;
    user_meal: number;
    user_meal_details?: {
        meal_type_details: { name: string };
        meal_date: string;
        user_details: { first_name: string; last_name: string; address: string; mobile: string };
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

export const getMyAssignments = async (): Promise<DeliveryAssignment[]> => {
    const url = createApiUrl(`api/mealdeliveryassignment/`);
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
