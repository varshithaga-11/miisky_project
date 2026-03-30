import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface UserMeal {
    id: number;
    user: number;
    user_diet_plan: number;
    meal_type: number;
    meal_type_details?: { name: string };
    food: number;
    food_details?: { 
        name: string; 
        image?: string;
        nutrition?: {
            calories?: number;
            protein?: number;
            carbohydrates?: number;
            fats?: number;
        }
    };
    quantity: number;
    meal_date: string;
    is_consumed: boolean;
    consumed_at?: string;
    notes?: string;
    packaging_material?: number | null;
    packaging_material_details?: { id: number; name: string } | null;
    micro_kitchen?: number | null;
    micro_kitchen_details?: {
        id: number;
        brand_name?: string | null;
        status?: string;
    } | null;
}

export const getMyMeals = async (): Promise<UserMeal[]> => {
    const url = createApiUrl(`api/usermeal/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const markAsConsumed = async (mealId: number): Promise<UserMeal> => {
    const url = createApiUrl(`api/usermeal/${mealId}/`);
    const response = await axios.patch(url, { is_consumed: true, consumed_at: new Date().toISOString() }, { headers: await getAuthHeaders() });
    return response.data;
};

export const updateMealNote = async (mealId: number, notes: string): Promise<UserMeal> => {
    const url = createApiUrl(`api/usermeal/${mealId}/`);
    const response = await axios.patch(url, { notes }, { headers: await getAuthHeaders() });
    return response.data;
};
