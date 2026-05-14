import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface ApprovedPlanLite {
    id: number;
    user_details: { first_name: string; last_name: string; email: string } | null;
    diet_plan_details: { title: string; no_of_days: number | null } | null;
    micro_kitchen_details: { brand_name: string; cuisine_type: string | null } | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    is_plan_approved_by_patient: boolean;
    created_on: string;
    payment_status: string;
    nutritionist_notes: string | null;
}

export interface PaginatedUserDietPlan {
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
    results: ApprovedPlanLite[];
}

export const getApprovedPlansForNutritionist = async (
    status?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    isPatientApproved?: boolean
): Promise<PaginatedUserDietPlan> => {
    const url = createApiUrl("api/userdietplan/approved-plans-lite/");
    const params: any = {
        status,
        page,
        limit,
        search
    };
    if (isPatientApproved !== undefined) {
        params.is_plan_approved_by_patient = isPatientApproved;
    }
    const response = await axios.get(url, { 
        params,
        headers: await getAuthHeaders() 
    });
    return response.data;
};

export const updatePlanDates = async (
    id: number, 
    startDate: string | null,
    endDate: string | null
) => {
    const url = createApiUrl(`api/userdietplan/${id}/`);
    const response = await axios.patch(url, {
        start_date: startDate,
        end_date: endDate
    }, { headers: await getAuthHeaders() });
    return response.data;
};
