import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { getMyPatients, MappedPatientResponse } from "../UploadedDocumentsByPatient/api";
import { UserDietPlan } from "../SuggestPlanToPatients/api";
import { MealType, getMealTypeList } from "../../AdminSide/MealType/mealtypeapi";
import { Food, CuisineType, getCuisineTypeList, getFoodList } from "../../AdminSide/Food/foodapi";
import { getPackagingMaterialList, PackagingMaterial } from "../../AdminSide/PackagingMaterial/api";
import {
    getApprovedMicroKitchens,
    MicroKitchenProfile,
} from "../ListOfMicroKitchens/api";

export { getMyPatients, getMealTypeList, getCuisineTypeList, getFoodList, getPackagingMaterialList };
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

export const getUserDailyMeals = async (patientId: number, date: string): Promise<UserMeal[]> => {
    const url = createApiUrl(`api/usermeal/?user=${patientId}&meal_date=${date}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
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

export const saveBulkMeals = async (meals: UserMeal[]): Promise<any> => {
    const payload = meals.map((m) => ({
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
