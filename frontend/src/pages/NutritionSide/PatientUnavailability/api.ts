import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type UnavailabilityStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface PatientUnavailabilityItem {
    id: number;
    user: number | null;
    user_details?: {
        id: number;
        first_name: string;
        last_name: string;
        email?: string;
        mobile?: string | null;
    } | null;
    user_diet_plan: number | null;
    user_diet_plan_details?: {
        id: number;
        status: string;
        start_date?: string | null;
        end_date?: string | null;
    } | null;
    from_date: string;
    to_date: string;
    scope: "all" | "meal_type";
    meal_types?: number[];
    meal_types_details?: { id: number; name: string }[];
    reason: string | null;
    patient_comments?: string | null;
    status: UnavailabilityStatus | string;
    requested_on: string;
    reviewed_by: number | null;
    reviewed_on: string | null;
    review_notes: string | null;
    skip_meal_count?: number;
}

function unwrapList(data: unknown): PatientUnavailabilityItem[] {
    if (Array.isArray(data)) return data;
    const d = data as { results?: PatientUnavailabilityItem[] };
    return d?.results ?? [];
}

export async function fetchPatientUnavailability(params: {
    status?: string;
    user?: string;
    from_date?: string;
    to_date?: string;
}): Promise<PatientUnavailabilityItem[]> {
    const search = new URLSearchParams();
    if (params.status) search.append("status", params.status);
    if (params.user) search.append("user", params.user);
    if (params.from_date) search.append("from_date", params.from_date);
    if (params.to_date) search.append("to_date", params.to_date);
    const q = search.toString();
    const url = createApiUrl(q ? `api/patient-unavailability/?${q}` : "api/patient-unavailability/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return unwrapList(response.data);
}

export async function approveUnavailability(
    id: number,
    body?: { review_notes?: string }
): Promise<PatientUnavailabilityItem & { skipped_meals_count?: number }> {
    const url = createApiUrl(`api/patient-unavailability/${id}/approve/`);
    const response = await axios.post(url, body ?? {}, { headers: await getAuthHeaders() });
    return response.data;
}

export async function rejectUnavailability(
    id: number,
    body?: { review_notes?: string }
): Promise<PatientUnavailabilityItem> {
    const url = createApiUrl(`api/patient-unavailability/${id}/reject/`);
    const response = await axios.post(url, body ?? {}, { headers: await getAuthHeaders() });
    return response.data;
}

export async function fetchImpact(id: number): Promise<{
    request: PatientUnavailabilityItem;
    impact_rows: Array<{
        meal_date: string;
        meal_type_id: number | null;
        meal_type_name: string | null;
        meal_count: number;
    }>;
    total_meals: number;
}> {
    const url = createApiUrl(`api/patient-unavailability/${id}/impact/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
}
