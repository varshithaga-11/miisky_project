import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface ExtraCharge {
    id: number;
    label: string;
    amount: string;
    reason: string;
    created_at: string;
    created_by_details: {
        first_name: string;
        role: string;
    } | null;
}

export interface DailySummary {
    id: number;
    summary_date: string;
    total_meal_amount: string;
    total_meals_count: number;
    meal_breakdown: any[];
}

export interface PlanBilling {
    id: number;
    status: string;
    start_date: string | null;
    end_date: string | null;
    diet_plan_title: string;
    daily_summaries: DailySummary[];
    extra_charges: ExtraCharge[];
}

export interface PatientBilling {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    diet_plans: PlanBilling[];
}

export interface BillingOverviewResponse {
    count: number;
    results: PatientBilling[];
    total_pages: number;
}

export const getBillingOverview = async (params: { page: number; search?: string }) => {
    const url = createApiUrl("api/admin-plan-billing-overview/");
    const response = await axios.get<BillingOverviewResponse>(url, {
        params,
        headers: await getAuthHeaders()
    });
    return response.data;
};
