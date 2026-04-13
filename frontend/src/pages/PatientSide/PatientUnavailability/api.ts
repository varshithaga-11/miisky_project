import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { PatientUnavailabilityItem } from "../../NutritionSide/PatientUnavailability/api";

export type { PatientUnavailabilityItem };

function unwrapList(data: unknown): PatientUnavailabilityItem[] {
    if (Array.isArray(data)) return data;
    const d = data as { results?: PatientUnavailabilityItem[] };
    return d?.results ?? [];
}

export async function fetchMyUnavailability(): Promise<PatientUnavailabilityItem[]> {
    const url = createApiUrl("api/patient-unavailability/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return unwrapList(response.data);
}

export interface CreateUnavailabilityPayload {
    user_diet_plan: number;
    from_date: string;
    to_date: string;
    scope: "all" | "meal_type";
    /** Required when scope is meal_type (one or more MealType ids). */
    meal_types?: number[];
    reason?: string;
    patient_comments?: string;
}

export async function createUnavailability(
    payload: CreateUnavailabilityPayload
): Promise<PatientUnavailabilityItem> {
    const url = createApiUrl("api/patient-unavailability/");
    const response = await axios.post(url, payload, { headers: await getAuthHeaders() });
    return response.data;
}

export async function cancelUnavailability(id: number, review_notes?: string): Promise<PatientUnavailabilityItem> {
    const url = createApiUrl(`api/patient-unavailability/${id}/cancel/`);
    const response = await axios.post(url, { review_notes }, { headers: await getAuthHeaders() });
    return response.data;
}

/** Matches UserDietPlanSerializer fields used on the patient unavailability page. */
export interface UserDietPlanRow {
    id: number;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    diet_plan?: number | null;
    diet_plan_details?: {
        id: number;
        title: string;
        code?: string;
    } | null;
    micro_kitchen_details?: {
        id: number;
        brand_name?: string | null;
    } | null;
}

export async function fetchMyDietPlans(): Promise<UserDietPlanRow[]> {
    const url = createApiUrl("api/userdietplan/all-user-plans/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : [];
}
