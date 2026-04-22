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

export type AllotedPatientsLiteResponse = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: AllotedPatient[];
};

export const getMyAllotedPatients = async (): Promise<AllotedPatient[]> => {
  const url = createApiUrl("api/usernutritionistmapping/my-patients/");
  const response = await axios.get<AllotedPatient[]>(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const getMyAllotedPatientsLite = async (params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<AllotedPatientsLiteResponse> => {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  const url = createApiUrl(`api/usernutritionistmapping/my-patients-lite/?${query.toString()}`);
  const response = await axios.get<AllotedPatientsLiteResponse>(url, { headers: await getAuthHeaders() });
  return response.data;
};

type PatientQuestionnairesResponse = {
  count: number;
  results: Array<{
    user: number;
    [key: string]: any;
  }>;
};

export const getMyPatientsQuestionnaires = async (userIds?: number[]) => {
  const query = new URLSearchParams();
  if (userIds && userIds.length > 0) {
    query.set("user_ids", userIds.join(","));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const url = createApiUrl(`api/usernutritionistmapping/my-patients-questionnaires/${suffix}`);
  const response = await axios.get<PatientQuestionnairesResponse>(url, { headers: await getAuthHeaders() });
  return response.data.results || [];
};

export const getPatientQuestionnaireByUser = async (userId: number) => {
  const url = createApiUrl(`api/userquestionnaire/?user=${userId}`);
  const response = await axios.get<any[]>(url, { headers: await getAuthHeaders() });
  const rows = Array.isArray(response.data) ? response.data : [];
  const exact = rows.find((row) => Number(row?.user) === Number(userId));
  return exact || rows[0] || null;
};

export type PatientKitchenDistanceRow = {
  id: number;
  brand_name: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  distance_km: number | null;
};

type PatientKitchenDistanceResponse = {
  patient_id: number;
  patient_name: string;
  patient_latitude: number | null;
  patient_longitude: number | null;
  count: number;
  results: PatientKitchenDistanceRow[];
};

export const fetchPatientKitchenDistances = async (
  patientUserId: number
): Promise<PatientKitchenDistanceRow[]> => {
  const url = createApiUrl(
    `api/usernutritionistmapping/patient-kitchen-distances/?patient_id=${patientUserId}`
  );
  const response = await axios.get<PatientKitchenDistanceResponse>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data.results || [];
};

