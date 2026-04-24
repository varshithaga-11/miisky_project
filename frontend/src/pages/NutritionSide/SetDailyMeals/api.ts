import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { MappedPatientResponse } from "../UploadedDocumentsByPatient/api";
import { UserDietPlan } from "../SuggestPlanToPatients/api";
import { MealType, getMealTypeList } from "../../AdminSide/MealType/mealtypeapi";
import { Food, CuisineType, getCuisineTypeList, getFoodList } from "../../AdminSide/Food/foodapi";
import { getPackagingMaterialList, PackagingMaterial } from "../../AdminSide/PackagingMaterial/api";
import {
    getApprovedMicroKitchens,
    MicroKitchenProfile,
} from "../ListOfMicroKitchens/api";

export { getMealTypeList, getCuisineTypeList, getFoodList, getPackagingMaterialList };
export { getApprovedMicroKitchens };
export type {
    MappedPatientResponse,
    UserDietPlan,
    MealType,
    Food,
    CuisineType,
    PackagingMaterial,
    MicroKitchenProfile,
};

/** Unavailability request (patient pause / travel) — returned by plan-meals and usermeal list. */
export interface PatientUnavailability {
    id: number;
    from_date: string;
    to_date: string;
    scope: "all" | "meal_type";
    meal_types_details?: { id: number; name: string }[];
    reason?: string | null;
    patient_comments?: string | null;
    status: string;
    requested_on?: string;
    review_notes?: string | null;
}

export interface UserMeal {
    id?: number;
    user: number;
    user_diet_plan: number;
    meal_type: number;
    cuisine_type?: number;
    food: number;
    quantity: number | null;
    meal_date: string;
    notes?: string;
    packaging_material?: number | null;
    is_consumed?: boolean;
    meal_type_details?: { id: number; name: string };
    cuisine_type_details?: { id: number; name: string };
    food_details?: { id: number; name: string; image?: string };
    packaging_material_details?: { id: number; name: string } | null;
    micro_kitchen?: number | null;
    micro_kitchen_details?: { id: number; brand_name?: string | null; status?: string } | null;
    available_meal_types?: number[];
    available_meal_type_details?: { id: number; name: string }[];
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

export interface ReassignMicroKitchenPayload {
    new_micro_kitchen: number;
    reason:
        | "kitchen_closed"
        | "kitchen_suspended"
        | "patient_request"
        | "admin_decision"
        | "quality_issue";
    notes?: string;
    effective_from?: string | null;
}

export const REASSIGN_MICRO_KITCHEN_REASONS = [
    { value: "kitchen_closed", label: "Kitchen closed" },
    { value: "kitchen_suspended", label: "Kitchen suspended" },
    { value: "patient_request", label: "Patient request" },
    { value: "admin_decision", label: "Admin decision" },
    { value: "quality_issue", label: "Quality issue" },
] as const;

export const reassignMicroKitchen = async (planId: number, payload: ReassignMicroKitchenPayload) => {
    const url = createApiUrl(`api/userdietplan/${planId}/reassign-micro-kitchen/`);
    const response = await axios.post(url, payload, { headers: await getAuthHeaders() });
    return response.data;
};

export const getActivePlansForPatient = async (patientId: number): Promise<UserDietPlan[]> => {
    // We only want active or approved (payment succeeded/active)
    const url = createApiUrl(`api/userdietplan/?user=${patientId}&status=active`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    // Handle both { results: [] } and []
    const results = Array.isArray(data) ? data : data?.results ?? [];
    return results;
};

export const getUserDailyMeals = async (
    patientId: number,
    date: string,
    planId?: number
): Promise<{ meals: UserMeal[]; patient_unavailabilities: PatientUnavailability[] }> => {
    const params = new URLSearchParams({ user: String(patientId), meal_date: date });
    if (planId != null) params.set("user_diet_plan", String(planId));
    const url = createApiUrl(`api/usermeal/?${params.toString()}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    const meals = Array.isArray(data) ? data : data?.results ?? [];
    const patient_unavailabilities = Array.isArray(data?.patient_unavailabilities)
        ? data.patient_unavailabilities
        : [];
    return { meals, patient_unavailabilities };
};

export const getUserMealsList = async (
    patientId: number,
    startDate?: string,
    endDate?: string
): Promise<UserMeal[]> => {
    const params = new URLSearchParams({ user: String(patientId) });
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const url = createApiUrl(`api/usermeal/?${params.toString()}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

/** Paginated allotted patients for Set Daily Meals (nutritionist-only). */
export const getSetDailyMealsPatients = async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    patient_id?: number;
}): Promise<{
    count: number;
    page: number;
    page_size: number;
    next: number | null;
    previous: number | null;
    total_pages: number;
    results: MappedPatientResponse[];
    selected_user_id: number | null;
}> => {
    const url = createApiUrl("api/set-daily-meals/patients/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: {
            page: params.page ?? 1,
            page_size: params.page_size ?? 5,
            search: params.search || undefined,
            patient_id: params.patient_id,
        },
    });
    return response.data;
};

export type FilterOptionsBlock = {
    count: number;
    page: number;
    limit: number;
    total_pages: number;
    next: number | null;
    previous: number | null;
    results: { id: number; name: string }[];
};

export const getSetDailyMealsFilterOptions = async (params: {
    meal_types_page?: number;
    cuisines_page?: number;
    limit?: number;
    meal_type_id?: number | "";
    cuisine_id?: number | "";
}): Promise<{ meal_types: FilterOptionsBlock; cuisine_types: FilterOptionsBlock }> => {
    const url = createApiUrl("api/set-daily-meals/filter-options/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: {
            meal_types_page: params.meal_types_page ?? 1,
            cuisines_page: params.cuisines_page ?? 1,
            limit: params.limit ?? 5,
            meal_type_id: params.meal_type_id || undefined,
            cuisine_id: params.cuisine_id || undefined,
        },
    });
    return response.data;
};

export const getSetDailyMealsPatientDetail = async (userId: number): Promise<{
    user: { id: number; first_name: string; last_name: string; email: string; mobile: string };
    questionnaire: Record<string, unknown> | null;
    kitchen: Record<string, unknown> | null;
    reassignment_details: Record<string, unknown> | null;
    today_food: UserMeal[];
}> => {
    const url = createApiUrl("api/set-daily-meals/patient-detail/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: { user_id: userId },
    });
    return response.data;
};

export const getSetDailyMealsPlanMeals = async (params: {
    user_id: number;
    plan_id: number;
    offset_days?: number;
    days?: number;
}): Promise<{
    plan_id: number;
    range_start: string | null;
    range_end: string | null;
    offset_days: number;
    days: number;
    next_offset_days: number | null;
    has_more: boolean;
    meals: UserMeal[];
    patient_unavailabilities: PatientUnavailability[];
}> => {
    const url = createApiUrl("api/set-daily-meals/plan-meals/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: {
            user_id: params.user_id,
            plan_id: params.plan_id,
            offset_days: params.offset_days ?? 0,
            days: params.days ?? 10,
        },
    });
    return response.data;
};

/** Explicit start/end window (max 60 days on server). Same meals + patient_unavailabilities shape as plan-meals. */
export const getSetDailyMealsPlanMealsByRange = async (params: {
    user_id: number;
    plan_id: number;
    start_date: string;
    end_date: string;
}): Promise<{
    plan_id: number;
    requested_start: string | null;
    requested_end: string | null;
    range_start: string | null;
    range_end: string | null;
    meals: UserMeal[];
    patient_unavailabilities: PatientUnavailability[];
}> => {
    const url = createApiUrl("api/set-daily-meals/plan-meals-range/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: {
            user_id: params.user_id,
            plan_id: params.plan_id,
            start_date: params.start_date,
            end_date: params.end_date,
        },
    });
    return response.data;
};

export const getSetDailyMealsCalendarMonth = async (params: {
    user_id: number;
    plan_id: number;
    month: number;
    year: number;
}): Promise<{ month: number; year: number; meals: UserMeal[] }> => {
    const url = createApiUrl("api/set-daily-meals/calendar-month/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: {
            user_id: params.user_id,
            plan_id: params.plan_id,
            month: params.month,
            year: params.year,
        },
    });
    return response.data;
};

export const getSetDailyMealsFoods = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    meal_type?: number | "";
    cuisine_type?: number | "";
}): Promise<{
    count: number;
    page: number;
    limit: number;
    total_pages: number;
    next: number | null;
    previous: number | null;
    results: Food[];
}> => {
    const url = createApiUrl("api/set-daily-meals/foods/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            search: params.search || undefined,
            meal_type: params.meal_type || undefined,
            cuisine_type: params.cuisine_type || undefined,
        },
    });
    return response.data;
};

export const getFoodByIdNutrition = async (foodId: number): Promise<FoodNutritionById> => {
    const url = createApiUrl(`api/foodbyid/${foodId}/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const saveBulkMeals = async (meals: UserMeal[]): Promise<unknown> => {
    const payload = meals.map((m) => ({
        ...(m.id != null && { id: m.id }),
        user: m.user,
        user_diet_plan: m.user_diet_plan,
        meal_type: m.meal_type,
        food: m.food,
        quantity: m.quantity ?? 1,
        meal_date: m.meal_date,
        ...(m.notes != null && m.notes !== "" && { notes: m.notes }),
        packaging_material: m.packaging_material ?? null,
    }));
    const url = createApiUrl("api/usermeal/bulk-create/");
    const response = await axios.post(url, payload, { headers: await getAuthHeaders() });
    return response.data;
};
