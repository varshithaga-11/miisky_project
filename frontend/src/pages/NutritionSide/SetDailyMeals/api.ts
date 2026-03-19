import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { getMyPatients, MappedPatientResponse } from "../UploadedDocumentsByPatient/api";
import { UserDietPlan } from "../SuggestPlanToPatients/api";
import { MealType, getMealTypeList } from "../../AdminSide/MealType/mealtypeapi";
import { Food, CuisineType, getCuisineTypeList, getFoodList } from "../../AdminSide/Food/foodapi";

export { getMyPatients, getMealTypeList, getCuisineTypeList, getFoodList };
export type { MappedPatientResponse, UserDietPlan, MealType, Food, CuisineType };

export interface UserMeal {
    id?: number;
    user: number;
    user_diet_plan: number;
    meal_type: number;
    food: number;
    quantity: number | null;
    meal_date: string;
    notes?: string;
    is_consumed?: boolean;
    meal_type_details?: { id: number; name: string };
    food_details?: { id: number; name: string; image?: string };
}

export const getActivePlansForPatient = async (patientId: number): Promise<UserDietPlan[]> => {
    // We only want active or approved (payment succeeded/active)
    const url = createApiUrl(`api/userdietplan/?user=${patientId}&status=active`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    // Handle both { results: [] } and []
    const results = Array.isArray(data) ? data : data?.results ?? [];
    return results;
};

export const getUserDailyMeals = async (patientId: number, date: string): Promise<UserMeal[]> => {
    const url = createApiUrl(`api/usermeal/?user=${patientId}&meal_date=${date}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const saveBulkMeals = async (meals: UserMeal[]): Promise<any> => {
    const url = createApiUrl("api/usermeal/bulk-create/");
    const response = await axios.post(url, meals, { headers: await getAuthHeaders() });
    return response.data;
};
