import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface DietPlanFeature {
    id?: number;
    diet_plan: number;
    feature: string;
    order: number;
}

export interface DietPlan {
    id?: number;
    title: string;
    code: string;
    amount: string | number;
    discount_amount?: string | number;
    no_of_days?: number;
    is_active?: boolean;
    created_at?: string;
    created_by?: number;
    final_amount?: string | number;
    features?: DietPlanFeature[];
    /** Optional override; all three must be set (sum 100) or leave all empty for platform defaults */
    platform_fee_percent?: string | number | null;
    nutritionist_share_percent?: string | number | null;
    kitchen_share_percent?: string | number | null;
}

export interface PaginatedResponse<T> {
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
    results: T[];
}

// Diet Plan APIs
export const createDietPlan = async (data: Partial<DietPlan>) => {
    const url = createApiUrl("api/dietplan/");
    const response = await axios.post(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const getDietPlanList = async (
    page: number = 1,
    limit: number | "all" = 10,
    search?: string
): Promise<PaginatedResponse<DietPlan>> => {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (limit === "all") params.limit = 1000;
    if (search) params.search = search;

    const url = createApiUrl("api/dietplan/");
    const response = await axios.get<PaginatedResponse<DietPlan>>(url, {
        headers: await getAuthHeaders(),
        params,
    });
    return response.data;
};

export const getDietPlanById = async (id: number) => {
    const url = createApiUrl(`api/dietplan/${id}/`);
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const updateDietPlan = async (id: number, data: Partial<DietPlan>) => {
    const url = createApiUrl(`api/dietplan/${id}/`);
    const response = await axios.put(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const deleteDietPlan = async (id: number) => {
    const url = createApiUrl(`api/dietplan/${id}/`);
    const response = await axios.delete(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

// Diet Plan Feature APIs
export const createDietPlanFeature = async (data: Partial<DietPlanFeature>) => {
    const url = createApiUrl("api/dietplanfeature/");
    const response = await axios.post(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const updateDietPlanFeature = async (id: number, data: Partial<DietPlanFeature>) => {
    const url = createApiUrl(`api/dietplanfeature/${id}/`);
    const response = await axios.put(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const deleteDietPlanFeature = async (id: number) => {
    const url = createApiUrl(`api/dietplanfeature/${id}/`);
    const response = await axios.delete(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};
