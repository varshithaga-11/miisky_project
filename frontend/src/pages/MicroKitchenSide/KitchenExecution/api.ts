import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { DailyMeal } from "../MealsBasedOnDaily/api";

export type PaginatedDailyMeals = {
    count: number;
    next: string | null;
    previous: string | null;
    results: DailyMeal[];
    current_page: number;
    total_pages: number;
};

async function getList(
    segment: string, 
    page: number = 1,
    mealDate?: string, 
    startDate?: string, 
    endDate?: string, 
    period?: string
): Promise<PaginatedDailyMeals> {
    const params: Record<string, any> = { page };
    if (mealDate) params.meal_date = mealDate;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (period && period !== 'all') params.period = period;

    const url = createApiUrl(`api/usermeal/${segment}/`);
    const response = await axios.get(url, { 
        headers: await getAuthHeaders(),
        params
    });
    return response.data;
}

export async function getExecutionList(page = 1, mealDate?: string, sd?: string, ed?: string, per?: string): Promise<PaginatedDailyMeals> {
    return getList("execution-list", page, mealDate, sd, ed, per);
}

export async function getPrepList(page = 1, mealDate?: string, sd?: string, ed?: string, per?: string): Promise<PaginatedDailyMeals> {
    return getList("prep-list", page, mealDate, sd, ed, per);
}

export async function getDeliveryList(page = 1, mealDate?: string, sd?: string, ed?: string, per?: string): Promise<PaginatedDailyMeals> {
    return getList("delivery-list", page, mealDate, sd, ed, per);
}
