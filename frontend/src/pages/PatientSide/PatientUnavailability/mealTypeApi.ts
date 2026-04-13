import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/**
 * Matches backend `MealType` / `MealTypeSerializer` (id, name, is_approved).
 * @see backend/app/models.py — MealType
 */
export interface MealTypeOption {
    id: number;
    name: string;
    is_approved?: boolean;
}

function unwrapList(data: unknown): MealTypeOption[] {
    if (Array.isArray(data)) return data as MealTypeOption[];
    const d = data as { results?: MealTypeOption[] };
    return d?.results ?? [];
}

/**
 * GET `api/mealtype/all/` — full list for dropdowns; non-admin users get
 * `is_approved=True` rows only (MealTypeViewSet.get_queryset).
 */
export async function fetchMealTypesForPatient(): Promise<MealTypeOption[]> {
    const url = createApiUrl("api/mealtype/all/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return unwrapList(response.data);
}
