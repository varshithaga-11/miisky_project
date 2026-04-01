import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { UserDietPlan } from "../SuggestPlanToPatients/api";

export interface PaginatedUserDietPlan {
    count: number;
    next: number | null;
    previous: number | null;
    current_page: number;
    total_pages: number;
    results: UserDietPlan[];
}

export const getApprovedPlansForNutritionist = async (
    status?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
): Promise<PaginatedUserDietPlan> => {
    const url = createApiUrl("api/userdietplan/");
    const params = {
        status,
        page,
        limit,
        search
    };
    const response = await axios.get(url, { 
        params,
        headers: await getAuthHeaders() 
    });
    return response.data;
};
