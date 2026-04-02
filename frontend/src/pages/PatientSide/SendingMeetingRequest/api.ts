import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface MeetingRequest {
    id: number;
    patient: number;
    patient_details?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    nutritionist: number;
    nutritionist_details?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    user_diet_plan: number;
    preferred_date: string;
    preferred_time: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    meeting_link?: string;
    nutritionist_notes?: string;
    scheduled_datetime?: string;
    created_on: string;
    availability_slot?: number;
}

export interface AvailabilitySlot {
    id: number;
    nutritionist: number;
    date: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

// -------------------------------------------------------------
// 📋 Patient Side API
// -------------------------------------------------------------

export const getMyActivePlan = async () => {
    const url = createApiUrl(`api/userdietplan/all-user-plans/`);
    const resp = await axios.get(url, { headers: await getAuthHeaders() });
    const plans = Array.isArray(resp.data) ? resp.data : resp.data?.results ?? [];
    // find the active one
    return plans.find((p: any) => p.status === 'active');
};

export const createMeetingRequest = async (data: Partial<MeetingRequest>) => {
    const url = createApiUrl(`api/meetingrequest/`);
    const resp = await axios.post(url, data, { headers: await getAuthHeaders() });
    return resp.data;
};

export const getMyMeetingRequests = async (): Promise<MeetingRequest[]> => {
    const url = createApiUrl(`api/meetingrequest/`);
    const resp = await axios.get(url, { headers: await getAuthHeaders() });
    const data = resp.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const getAvailableSlots = async (nutritionistId: number): Promise<AvailabilitySlot[]> => {
    const url = createApiUrl(`api/nutritionistavailability/?nutritionist=${nutritionistId}`);
    const resp = await axios.get(url, { headers: await getAuthHeaders() });
    const data = resp.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

// -------------------------------------------------------------
// 👨‍🏫 Nutritionist Side API
// -------------------------------------------------------------

export const getNutritionistMeetings = async (): Promise<MeetingRequest[]> => {
    const url = createApiUrl(`api/meetingrequest/`);
    const resp = await axios.get(url, { headers: await getAuthHeaders() });
    const data = resp.data;
    return Array.isArray(data) ? data : data?.results ?? [];
};

export const updateMeetingStatus = async (id: number, data: Partial<MeetingRequest>) => {
    const url = createApiUrl(`api/meetingrequest/${id}/`);
    const resp = await axios.patch(url, data, { headers: await getAuthHeaders() });
    return resp.data;
};
