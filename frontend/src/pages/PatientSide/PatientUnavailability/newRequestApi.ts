import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface UserDietPlanNewRequestLiteRow {
    id: number;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    diet_plan_details?: {
        title: string;
        code?: string;
    } | null;
    micro_kitchen_details?: {
        brand_name?: string | null;
    } | null;
}

export interface MealTypeNewRequestLiteOption {
    id: number;
    name: string;
}

export interface CreateNewRequestLitePayload {
    user_diet_plan: number;
    from_date: string;
    to_date: string;
    scope: "all" | "meal_type";
    meal_types?: number[];
    reason?: string;
    patient_comments?: string;
}

export interface CreateNewRequestLiteResponse {
    id: number;
    user_diet_plan: number;
    from_date: string;
    to_date: string;
    scope: "all" | "meal_type";
    meal_types: number[];
    reason?: string | null;
    patient_comments?: string | null;
    status: string;
}

function unwrapList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    const d = data as { results?: T[] };
    return d?.results ?? [];
}

export async function fetchUserPlansForNewRequestLite(): Promise<UserDietPlanNewRequestLiteRow[]> {
    const url = createApiUrl("api/userdietplan/all-user-plans-new-request-lite/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return unwrapList<UserDietPlanNewRequestLiteRow>(response.data);
}

export async function fetchMealTypesForNewRequestLite(): Promise<MealTypeNewRequestLiteOption[]> {
    const url = createApiUrl("api/mealtype/all-patient-lite/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return unwrapList<MealTypeNewRequestLiteOption>(response.data);
}

export async function createNewUnavailabilityRequestLite(
    payload: CreateNewRequestLitePayload
): Promise<CreateNewRequestLiteResponse> {
    const url = createApiUrl("api/patient-unavailability/create-lite/");
    const response = await axios.post(url, payload, { headers: await getAuthHeaders() });
    return response.data;
}
