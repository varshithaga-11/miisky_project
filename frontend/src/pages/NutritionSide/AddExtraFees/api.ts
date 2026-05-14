import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface ExtraCharge {
    id?: number;
    user?: number;
    user_diet_plan: number;
    label: string;
    amount: string | number;
    reason?: string;
    created_at?: string;
}

export interface PatientPlan {
    id: number;
    user_details: { id: number; first_name: string; last_name: string; email: string } | null;
    diet_plan_details: { title: string; no_of_days: number | null } | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
}

export interface AllotedPatient {
    user: {
        id: number;
        first_name?: string;
        last_name?: string;
        email: string;
        username: string;
    };
}

export interface AllotedPatientsLiteResponse {
    count: number;
    results: AllotedPatient[];
    total_pages: number;
}

export const getMyAllotedPatientsLite = async (params: {
    page: number;
    limit: number;
    search?: string;
}): Promise<AllotedPatientsLiteResponse> => {
    const query = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
    });
    if (params.search?.trim()) {
        query.set("search", params.search.trim());
    }
    const url = createApiUrl(`api/usernutritionistmapping/my-patients-lite/?${query.toString()}`);
    const response = await axios.get<AllotedPatientsLiteResponse>(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getPatientPlans = async (userId: number): Promise<PatientPlan[]> => {
    const url = createApiUrl("api/userdietplan/approved-plans-lite/");
    const response = await axios.get(url, {
        params: { user: userId, limit: 100 },
        headers: await getAuthHeaders()
    });
    return response.data.results;
};

export const getExtraCharges = async (planId: number) => {
    const url = createApiUrl("api/user-diet-plan-extra-charge/");
    const response = await axios.get(url, {
        params: { user_diet_plan: planId },
        headers: await getAuthHeaders()
    });
    return response.data.results;
};

export const addExtraCharge = async (data: ExtraCharge) => {
    const url = createApiUrl("api/user-diet-plan-extra-charge/");
    const response = await axios.post(url, data, {
        headers: await getAuthHeaders()
    });
    return response.data;
};

export const deleteExtraCharge = async (id: number) => {
    const url = createApiUrl(`api/user-diet-plan-extra-charge/${id}/`);
    const response = await axios.delete(url, {
        headers: await getAuthHeaders()
    });
    return response.data;
};
