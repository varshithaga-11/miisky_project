import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type AllotedPatient = {
  mapping_id: number;
  assigned_on: string;
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    email: string;
    mobile?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    country?: string | null;
    is_patient_mapped?: boolean;
    latitude?: number | null;
    longitude?: number | null;
  };
  questionnaire: any | null;
  active_kitchen?: {
    current_kitchen: string | null;
    original_kitchen: string | null;
    effective_from: string | null;
  } | null;
  reassignment_details?: {
    previous_nutritionist: string;
    new_nutritionist: string;
    reason: string;
    notes: string | null;
    effective_from: string;
  } | null;
};

export const getMyAllotedPatients = async (): Promise<AllotedPatient[]> => {
  const url = createApiUrl("api/usernutritionistmapping/my-patients/");
  const response = await axios.get<AllotedPatient[]>(url, { headers: await getAuthHeaders() });
  return response.data;
};

export type MicroKitchenForDistance = {
  id: number;
  brand_name: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type MicroKitchenListPage = {
  results: MicroKitchenForDistance[];
  next: number | null;
};

export const fetchAllApprovedMicroKitchens = async (): Promise<MicroKitchenForDistance[]> => {
  const all: MicroKitchenForDistance[] = [];
  let page = 1;
  for (;;) {
    const url = createApiUrl(`api/microkitchenprofile/?status=approved&page=${page}&limit=10`);
    const response = await axios.get<MicroKitchenListPage>(url, { headers: await getAuthHeaders() });
    const { results, next } = response.data;
    all.push(...(results || []));
    if (!next) break;
    page = next;
  }
  return all;
};

