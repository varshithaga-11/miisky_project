import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface IngredientUnit {
    id?: number;
    unit: string;
}

export const fetchIngredientUnits = async (): Promise<IngredientUnit[]> => {
    const url = createApiUrl("api/microkitchen-ingredient-unit/");
    const res = await axios.get(url, { headers: await getAuthHeaders() });
    return res.data;
};

export const createIngredientUnit = async (data: IngredientUnit): Promise<IngredientUnit> => {
    const url = createApiUrl("api/microkitchen-ingredient-unit/");
    const res = await axios.post(url, data, { headers: await getAuthHeaders() });
    return res.data;
};

export const updateIngredientUnit = async (id: number, data: IngredientUnit): Promise<IngredientUnit> => {
    const url = createApiUrl(`api/microkitchen-ingredient-unit/${id}/`);
    const res = await axios.patch(url, data, { headers: await getAuthHeaders() });
    return res.data;
};

export const deleteIngredientUnit = async (id: number): Promise<void> => {
    const url = createApiUrl(`api/microkitchen-ingredient-unit/${id}/`);
    await axios.delete(url, { headers: await getAuthHeaders() });
};
