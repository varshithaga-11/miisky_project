import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface NormalRange {
    id?: number;
    health_parameter: number;
    health_parameter_name?: string;
    raw_value?: string;
    min_value?: number;
    max_value?: number;
    unit?: string;
    reference_text?: string;
    qualitative_value?: string;
    interpretation_flag?: string;
    remarks?: string;
    created_at?: string;
    is_active?: boolean;
    created_by?: number;
}

export interface PaginatedResponse<T> {
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
    results: T[];
}

export const createNormalRange = async (data: Partial<NormalRange>) => {
    const url = createApiUrl("api/normalrange/");
    const response = await axios.post(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const getNormalRangeList = async (
    page: number = 1,
    limit: number | "all" = 10,
    search?: string
): Promise<PaginatedResponse<NormalRange>> => {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (limit === "all") params.limit = 1000;
    if (search) params.search = search;

    const url = createApiUrl("api/normalrange/");
    const response = await axios.get<PaginatedResponse<NormalRange>>(url, {
        headers: await getAuthHeaders(),
        params,
    });
    return response.data;
};

export const getNormalRangeById = async (id: number) => {
    const url = createApiUrl(`api/normalrange/${id}/`);
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const updateNormalRange = async (id: number, data: Partial<NormalRange>) => {
    const url = createApiUrl(`api/normalrange/${id}/`);
    const response = await axios.put(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const deleteNormalRange = async (id: number) => {
    const url = createApiUrl(`api/normalrange/${id}/`);
    const response = await axios.delete(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};
