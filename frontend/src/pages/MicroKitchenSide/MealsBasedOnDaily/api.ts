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

export interface PaginatedDailyMeals {
    count: number;
    next: string | null;
    previous: string | null;
    results: DailyMeal[];
    current_page: number;
    total_pages: number;
}

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
    page?: number;
    limit?: number;
    period?: string;
}): Promise<PaginatedDailyMeals> => {
    const search = new URLSearchParams();
    if (params.user && params.user !== "all") search.append("user", params.user);
    if (params.meal_date) search.append("meal_date", params.meal_date);
    if (params.start_date) search.append("start_date", params.start_date);
    if (params.end_date) search.append("end_date", params.end_date);
    if (params.page) search.append("page", params.page.toString());
    if (params.limit) search.append("limit", params.limit.toString());
    if (params.period && params.period !== 'all') search.append("period", params.period);

    const url = createApiUrl(`api/usermeal/?${search.toString()}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    if (Array.isArray(data)) {
        return {
            results: data,
            count: data.length,
            next: null,
            previous: null,
            current_page: 1,
            total_pages: 1
        };
    }
    return data;
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

export const getKitchenMealsCalendar = async (
    year: number,
    month: number,
    user?: string
): Promise<DailyMeal[]> => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (user && user !== "all") params.append("user", user);
    const url = createApiUrl(`api/usermeal/calendar-prep-view/?${params.toString()}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
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

export const getFoodRecipeById = async (foodId: number): Promise<FoodRecipe> => {
    const url = createApiUrl(`api/foodrecipebyid/${foodId}/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getFoodByIdNutrition = async (foodId: number): Promise<FoodNutritionById> => {
    const url = createApiUrl(`api/foodbyid/${foodId}/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};
