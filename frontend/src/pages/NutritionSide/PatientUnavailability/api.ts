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

export interface PaginatedResponses<T> {
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
    results: T[];
}

export async function fetchPatientUnavailability(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    user?: string | number;
    from_date?: string;
    to_date?: string;
}): Promise<PaginatedResponses<PatientUnavailabilityItem>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);
    if (params.user) searchParams.append("user", params.user.toString());
    if (params.from_date) searchParams.append("from_date", params.from_date);
    if (params.to_date) searchParams.append("to_date", params.to_date);

    const q = searchParams.toString();
    const url = createApiUrl(q ? `api/patient-unavailability/?${q}` : "api/patient-unavailability/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
}

export async function fetchMyPatients(): Promise<any[]> {
    const url = createApiUrl("api/usernutritionistmapping/my-patients/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
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
