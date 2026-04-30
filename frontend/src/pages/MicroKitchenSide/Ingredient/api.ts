import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface MicroKitchenIngredient {
    id?: number;
    name: string;
    unit: number;
    unit_name?: string;
}

export interface PaginatedIngredients {
    results: MicroKitchenIngredient[];
    count: number;
    total_pages?: number;
    current_page?: number;
}

export const fetchIngredients = async (page: number = 1, pageSize: number = 10, search: string = ""): Promise<PaginatedIngredients> => {
    const url = createApiUrl(`api/microkitchen-ingredient/?page=${page}&page_size=${pageSize}&search=${search}`);
    const res = await axios.get(url, { headers: await getAuthHeaders() });
    return res.data;
};

export const createIngredient = async (data: MicroKitchenIngredient): Promise<MicroKitchenIngredient> => {
    const url = createApiUrl("api/microkitchen-ingredient/");
    const res = await axios.post(url, data, { headers: await getAuthHeaders() });
    return res.data;
};

export const updateIngredient = async (id: number, data: MicroKitchenIngredient): Promise<MicroKitchenIngredient> => {
    const url = createApiUrl(`api/microkitchen-ingredient/${id}/`);
    const res = await axios.patch(url, data, { headers: await getAuthHeaders() });
    return res.data;
};

export const deleteIngredient = async (id: number): Promise<void> => {
    const url = createApiUrl(`api/microkitchen-ingredient/${id}/`);
    await axios.delete(url, { headers: await getAuthHeaders() });
};
