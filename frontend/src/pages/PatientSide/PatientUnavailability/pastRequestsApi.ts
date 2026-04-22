import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { PatientUnavailabilityItem } from "./api";

export interface PastUnavailabilityLiteMealType {
    id: number;
    name: string;
}

export interface PastUnavailabilityLiteItem {
    id: number;
    from_date: string;
    to_date: string;
    scope: "all" | "meal_type";
    meal_types_details?: PastUnavailabilityLiteMealType[];
    status: string;
    reason?: string | null;
    patient_comments?: string | null;
}

export interface PaginatedPastUnavailabilityLiteResponse {
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
    results: PastUnavailabilityLiteItem[];
}

function unwrapList(data: unknown): PatientUnavailabilityItem[] {
    if (Array.isArray(data)) return data;
    const d = data as { results?: PatientUnavailabilityItem[] };
    return d?.results ?? [];
}

function unwrapLiteList(data: unknown): PastUnavailabilityLiteItem[] {
    if (Array.isArray(data)) return data as PastUnavailabilityLiteItem[];
    const d = data as { results?: PastUnavailabilityLiteItem[] };
    return d?.results ?? [];
}

function unwrapPaginatedLiteResponse(data: unknown): PaginatedPastUnavailabilityLiteResponse {
    if (Array.isArray(data)) {
        const rows = data as PastUnavailabilityLiteItem[];
        return {
            count: rows.length,
            next: null,
            previous: null,
            current_page: 1,
            total_pages: 1,
            results: rows,
        };
    }
    const d = data as Partial<PaginatedPastUnavailabilityLiteResponse>;
    const rows = Array.isArray(d.results) ? d.results : [];
    return {
        count: typeof d.count === "number" ? d.count : rows.length,
        next: typeof d.next === "number" ? d.next : null,
        previous: typeof d.previous === "number" ? d.previous : null,
        current_page: typeof d.current_page === "number" ? d.current_page : 1,
        total_pages: typeof d.total_pages === "number" ? d.total_pages : 1,
        results: rows,
    };
}

export async function fetchPastUnavailabilityRequests(): Promise<PatientUnavailabilityItem[]> {
    const url = createApiUrl("api/patient-unavailability/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return unwrapList(response.data);
}

export async function cancelPastUnavailabilityRequest(
    id: number,
    review_notes?: string
): Promise<PatientUnavailabilityItem> {
    const url = createApiUrl(`api/patient-unavailability/${id}/cancel/`);
    const response = await axios.post(url, { review_notes }, { headers: await getAuthHeaders() });
    return response.data;
}

export async function fetchPastUnavailabilityRequestsLite(
    page = 1,
    limit = 10
): Promise<PaginatedPastUnavailabilityLiteResponse> {
    const url = createApiUrl("api/patient-unavailability/past-requests-lite/");
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
        params: { page, limit },
    });
    return unwrapPaginatedLiteResponse(response.data);
}

export async function cancelPastUnavailabilityRequestLite(
    id: number,
    review_notes?: string
): Promise<PastUnavailabilityLiteItem> {
    const url = createApiUrl(`api/patient-unavailability/${id}/cancel-lite/`);
    const response = await axios.post(url, { review_notes }, { headers: await getAuthHeaders() });
    return response.data;
}
