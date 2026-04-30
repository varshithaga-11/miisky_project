import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface InventoryIngredient {
    id?: number;
    micro_kitchen?: number;
    kitchen_name?: string;
    ingredient: number;
    ingredient_name?: string;
    unit_name?: string;
    quantity: number;
    low_stock_threshold: number;
    last_updated?: string;
}

export interface PaginatedInventory {
    results: InventoryIngredient[];
    count: number;
    total_pages?: number;
    current_page?: number;
}

export const fetchInventory = async (page: number = 1, pageSize: number = 10, search: string = "", lowStock: boolean = false): Promise<PaginatedInventory> => {
    let url = createApiUrl(`api/inventory-ingredient/?page=${page}&limit=${pageSize}&search=${search}`);
    if (lowStock) url += `&low_stock=true`;
    const res = await axios.get(url, { headers: await getAuthHeaders() });
    return res.data;
};

export const createInventoryItem = async (data: Partial<InventoryIngredient>): Promise<InventoryIngredient> => {
    const url = createApiUrl("api/inventory-ingredient/");
    const res = await axios.post(url, data, { headers: await getAuthHeaders() });
    return res.data;
};

export const updateInventoryItem = async (id: number, data: Partial<InventoryIngredient>): Promise<InventoryIngredient> => {
    const url = createApiUrl(`api/inventory-ingredient/${id}/`);
    const res = await axios.patch(url, data, { headers: await getAuthHeaders() });
    return res.data;
};

export const deleteInventoryItem = async (id: number): Promise<void> => {
    const url = createApiUrl(`api/inventory-ingredient/${id}/`);
    await axios.delete(url, { headers: await getAuthHeaders() });
};
