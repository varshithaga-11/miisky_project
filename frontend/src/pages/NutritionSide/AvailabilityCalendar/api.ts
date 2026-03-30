import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface AvailabilitySlot {
    id: number;
    nutritionist: number;
    date: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

export const getMyAvailability = async (): Promise<AvailabilitySlot[]> => {
    const url = createApiUrl(`api/nutritionistavailability/`);
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
    });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const getNutritionistAvailability = async (nutritionistId: number): Promise<AvailabilitySlot[]> => {
    const url = createApiUrl(`api/nutritionistavailability/?nutritionist=${nutritionistId}`);
    const response = await axios.get(url, {
        headers: await getAuthHeaders(),
    });
    const data = response.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const createAvailabilitySlot = async (data: Partial<AvailabilitySlot>) => {
    const url = createApiUrl(`api/nutritionistavailability/`);
    const response = await axios.post(url, data, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};

export const deleteAvailabilitySlot = async (id: number) => {
    const url = createApiUrl(`api/nutritionistavailability/${id}/`);
    const response = await axios.delete(url, {
        headers: await getAuthHeaders(),
    });
    return response.data;
};
