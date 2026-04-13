import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { DailyMeal } from "../MealsBasedOnDaily/api";

function unwrap(data: unknown): DailyMeal[] {
    if (Array.isArray(data)) return data as DailyMeal[];
    const d = data as { results?: DailyMeal[] };
    return d?.results ?? [];
}

async function getList(segment: string, mealDate?: string): Promise<DailyMeal[]> {
    const qs = mealDate ? `?meal_date=${encodeURIComponent(mealDate)}` : "";
    const url = createApiUrl(`api/usermeal/${segment}/${qs}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return unwrap(response.data);
}

/** All scheduled meals for the kitchen for a date (skipped excluded). */
export async function getExecutionList(mealDate: string): Promise<DailyMeal[]> {
    return getList("execution-list", mealDate);
}

export async function getPrepList(mealDate: string): Promise<DailyMeal[]> {
    return getList("prep-list", mealDate);
}

export async function getDeliveryList(mealDate: string): Promise<DailyMeal[]> {
    return getList("delivery-list", mealDate);
}
