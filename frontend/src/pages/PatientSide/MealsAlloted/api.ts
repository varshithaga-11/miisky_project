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
    delivery?: {
        id: number;
        status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'rescheduled';
        scheduled_date: string;
        delivery_person_details?: {
            username: string;
            mobile?: string;
        };
    } | null;
}

export interface FoodNutritionById {
    id: number;
    food: number;
    food_name: string;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
    sugar: number | null;
    saturated_fat: number | null;
    trans_fat: number | null;
    sodium: number | null;
    potassium: number | null;
    calcium: number | null;
    iron: number | null;
    vitamin_a: number | null;
    vitamin_c: number | null;
    vitamin_d: number | null;
    vitamin_b12: number | null;
    cholesterol: number | null;
    glycemic_index: number | null;
    serving_size: string | null;
}

export const getMyMeals = async (): Promise<UserMeal[]> => {
    const url = createApiUrl(`api/usermeal/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const getTimelineMeals = async (startDate?: string, endDate?: string): Promise<UserMeal[]> => {
    let url = createApiUrl(`api/usermeal/timeline/`);
    if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        url += `?${params.toString()}`;
    }
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getMonthlyMeals = async (month: number, year: number): Promise<UserMeal[]> => {
    const url = createApiUrl(`api/usermeal/monthly/?month=${month}&year=${year}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
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

export const getFoodByIdNutrition = async (foodId: number): Promise<FoodNutritionById> => {
    const url = createApiUrl(`api/foodbyid/${foodId}/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export interface FoodRecipe {
    id: number;
    name: string;
    description: string;
    image: string | null;
    ingredients: {
        id: number;
        ingredient_name: string;
        quantity: number;
        unit_name: string;
        notes: string | null;
    }[];
    steps: {
        id: number;
        step_number: number;
        instruction: string;
    }[];
}

export const getFoodRecipeById = async (foodId: number): Promise<FoodRecipe> => {
    const url = createApiUrl(`api/foodrecipebyid/${foodId}/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};
