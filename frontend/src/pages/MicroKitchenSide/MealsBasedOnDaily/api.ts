import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface DailyMeal {
    id: number;
    user_diet_plan?: number;
    status?: string;
    user_details: {
        id: number;
        first_name: string;
        last_name: string;
        mobile?: string;
        address?: string;
    };
    meal_type_details: {
        id: number;
        name: string;
    };
    food_details: {
        id: number;
        name: string;
        image?: string;
    };
    quantity: number;
    meal_date: string;
    is_consumed: boolean;
    notes?: string;
    packaging_material_details?: { id: number; name: string } | null;
    micro_kitchen?: number | null;
    micro_kitchen_details?: {
        id: number;
        brand_name?: string | null;
        status?: string;
    } | null;
    /** Active daily DeliveryAssignment delivery person (supply chain). */
    delivery_person_details?: {
        id: number;
        first_name: string;
        last_name: string;
        mobile?: string | null;
    } | null;
    delivery_assignment_id?: number | null;
    delivery_slot_details?: {
        id: number;
        name: string;
        start_time?: string | null;
        end_time?: string | null;
    } | null;
}

export interface KitchenPatient {
    id: number;
    patient_details: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

export const getKitchenPatients = async (): Promise<KitchenPatient[]> => {
    const url = createApiUrl("api/usermeal/kitchen-patients/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return Array.isArray(response.data) ? response.data : [];
};

export const getKitchenMeals = async (params: {
    user?: string;
    meal_date?: string;
    start_date?: string;
    end_date?: string;
}): Promise<DailyMeal[]> => {
    const search = new URLSearchParams();
    if (params.user && params.user !== "all") search.append("user", params.user);
    if (params.meal_date) search.append("meal_date", params.meal_date);
    if (params.start_date) search.append("start_date", params.start_date);
    if (params.end_date) search.append("end_date", params.end_date);
    const url = createApiUrl(`api/usermeal/?${search.toString()}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const getKitchenMealsMonthly = async (
    year: number,
    month: number,
    user?: string
): Promise<DailyMeal[]> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (user && user !== "all") params.append("user", user);
    const url = createApiUrl(`api/usermeal/monthly/?${params.toString()}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const assignMealDelivery = async (
    mealId: number,
    body: {
        delivery_person_id: number;
        delivery_slot_id?: number | null;
        reason?: string;
    }
): Promise<DailyMeal> => {
    const url = createApiUrl(`api/usermeal/${mealId}/assign-delivery/`);
    const response = await axios.post(url, body, { headers: await getAuthHeaders() });
    return response.data;
};

export const bulkAssignDelivery = async (body: {
    start_date: string;
    end_date: string;
    delivery_person_id: number;
    user?: string;
    only_unassigned?: boolean;
}): Promise<{ updated: number; start_date: string; end_date: string }> => {
    const url = createApiUrl("api/usermeal/bulk-assign-delivery/");
    const response = await axios.post(url, body, { headers: await getAuthHeaders() });
    return response.data;
};
