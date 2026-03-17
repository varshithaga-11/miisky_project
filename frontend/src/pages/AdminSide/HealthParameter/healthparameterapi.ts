import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface HealthParameter {
    id?: number;
    name: string;
    posted_by?: number;
    created_at?: string;
    is_active?: boolean;
    normal_ranges?: any[];
}

export interface PaginatedResponse<T> {
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
    results: T[];
}

export const createHealthParameter = async (data: Partial<HealthParameter>) => {
    const url = createApiUrl("api/healthparameter/");
    const response = await axios.post(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const getHealthParameterList = async (
    page: number = 1,
    limit: number | "all" = 10,
    search?: string
): Promise<PaginatedResponse<HealthParameter>> => {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (limit === "all") params.limit = 1000;
    if (search) params.search = search;

    const url = createApiUrl("api/healthparameter/");
    const response = await axios.get<PaginatedResponse<HealthParameter>>(url, {
        headers: await getAuthHeaders(),
        params,
    });
    return response.data;
};

export const getHealthParameterById = async (id: number) => {
    const url = createApiUrl(`api/healthparameter/${id}/`);
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const updateHealthParameter = async (id: number, data: Partial<HealthParameter>) => {
    const url = createApiUrl(`api/healthparameter/${id}/`);
    const response = await axios.put(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const deleteHealthParameter = async (id: number) => {
    const url = createApiUrl(`api/healthparameter/${id}/`);
    const response = await axios.delete(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};
