import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { UserDietPlan } from "../SuggestPlanToPatients/api";

export const getApprovedPlansForNutritionist = async (status?: string): Promise<UserDietPlan[]> => {
    const query = status ? `?status=${status}` : "";
    const url = createApiUrl(`api/userdietplan/${query}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    
    const data = response.data;
    // Handle DRF pagination if present, though ModelViewSet with default settings might return array or object
    return Array.isArray(data) ? data : data?.results ?? [];
};
