import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../../access/access";

export type SimpleUser = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  mobile?: string | null;
  role: string;
  is_patient_mapped?: boolean;
  allotted_by?: string;
  created_by?: string;
};

export type PaginatedResponses<T> = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
};

export type UserNutritionMapping = {
  id: number;
  user: number;
  nutritionist: number;
  assigned_on: string;
  is_active: boolean;
};

export const getAllUsers = async (): Promise<PaginatedResponses<SimpleUser>> => {
  const url = createApiUrl("api/usermanagement/");
  const response = await axios.get<PaginatedResponses<SimpleUser>>(url, {
    headers: await getAuthHeaders(),
    params: { limit: 9999, page: 1 },
  });
  return response.data;
};

export const createUserNutritionMapping = async (userId: number, nutritionistId: number) => {
  const url = createApiUrl("api/usernutritionistmapping/");
  const response = await axios.post(
    url,
    { user: userId, nutritionist: nutritionistId, is_active: true },
    { headers: await getAuthHeaders() }
  );
  return response.data as UserNutritionMapping;
};

export const getAllUserNutritionMappings = async (): Promise<UserNutritionMapping[]> => {
  const url = createApiUrl("api/usernutritionistmapping/");
  const response = await axios.get<UserNutritionMapping[]>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const REASSIGN_REASONS = [
  { value: "nutritionist_left", label: "Nutritionist left" },
  { value: "patient_request", label: "Patient request" },
  { value: "admin_decision", label: "Admin decision" },
  { value: "nutritionist_on_leave", label: "Nutritionist on leave" },
  { value: "other", label: "Other" },
] as const;

export type ReassignReason = (typeof REASSIGN_REASONS)[number]["value"];

export type ReassignNutritionistPayload = {
  user: number;
  new_nutritionist: number;
  reason: ReassignReason;
  notes?: string;
  effective_from?: string;
};

export const reassignNutritionist = async (payload: ReassignNutritionistPayload) => {
  const url = createApiUrl("api/usernutritionistmapping/reassign/");
  const response = await axios.post(url, payload, {
    headers: await getAuthHeaders(),
  });
  return response.data as UserNutritionMapping;
};

export const getGroupedMappings = async (): Promise<
  { nutritionist: SimpleUser; patients: SimpleUser[] }[]
> => {
  const url = createApiUrl("api/usernutritionistmapping/grouped-mappings/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getUnmappedPatients = async (): Promise<SimpleUser[]> => {
  const url = createApiUrl("api/usernutritionistmapping/unmapped-patients/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getAllNutritionists = async (): Promise<SimpleUser[]> => {
  const url = createApiUrl("api/usernutritionistmapping/all-nutritionists/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export type MappingRecord = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  created_by_name: string | null;
  nutritionist_name: string;
  allotted_by_name: string;
  is_mapped: boolean;
};

export type MappingSummaryParams = {
  page?: number;
  /** Page size; sent as `limit` (matches backend `Pagination.page_size_query_param`). */
  limit?: number;
  mapping_status?: string;
  nutritionist_id?: string;
  allotted_by?: string;
  search?: string;
};

export const getMappingSummary = async (params: MappingSummaryParams): Promise<PaginatedResponses<MappingRecord>> => {
  const url = createApiUrl("api/patient-nutrition-mapping-summary/");
  const response = await axios.get<PaginatedResponses<MappingRecord>>(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};
