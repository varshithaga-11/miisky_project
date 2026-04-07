import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type Patient = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
};

export type PatientHealthReport = {
  id: number;
  user: number;
  user_details: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  title: string | null;
  report_file: string;
  report_type: string | null;
  uploaded_on: string;
  reviews?: {
    id: number;
    comments: string;
    created_on: string;
    nutritionist_name: string;
  }[];
};

export type NutritionistReview = {
  id: number;
  user: number;
  nutritionist: number;
  reports: number[];
  report_details?: { id: number; title: string | null }[];
  comments: string;
  created_on: string;
};

export type MappedPatientResponse = {
    user: Patient;
    mapping_id: number | null;
    assigned_on: string;
    active_kitchen?: {
        current_kitchen: string | null;
        original_kitchen: string | null;
        effective_from: string | null;
    } | null;
    reassignment_details?: {
        previous_nutritionist: string | null;
        new_nutritionist: string | null;
        reason: string;
        notes: string | null;
        effective_from: string;
    } | null;
};

export const getMyPatients = async (): Promise<MappedPatientResponse[]> => {
  const url = createApiUrl("api/usernutritionistmapping/my-patients/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

/** Paginated patient list + reports + reviews for the nutritionist clinical review page. */
export type ClinicalReviewDashboardResponse = {
  count: number;
  page: number;
  page_size: number;
  next: number | null;
  previous: number | null;
  total_pages: number;
  results: MappedPatientResponse[];
  selected_user_id: number | null;
  reports: PatientHealthReport[];
  reviews: NutritionistReview[];
  reports_total: number;
  reviews_total: number;
};

export const getClinicalReviewDashboard = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
  patient_id?: number;
}): Promise<ClinicalReviewDashboardResponse> => {
  const url = createApiUrl("api/usernutritionistmapping/clinical-review-dashboard/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 5,
      search: params.search || undefined,
      patient_id: params.patient_id,
    },
  });
  return response.data;
};

export const getPatientReports = async (patientId?: number): Promise<PatientHealthReport[]> => {
  const query = patientId ? `?user=${patientId}` : "";
  const url = createApiUrl(`api/patienthealthreport/${query}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const saveNutritionistReview = async (review: Partial<NutritionistReview>): Promise<NutritionistReview> => {
  const url = createApiUrl("api/nutritionistreview/");
  const response = await axios.post(url, review, { headers: await getAuthHeaders() });
  return response.data;
};

export const getPatientReviews = async (patientId: number): Promise<NutritionistReview[]> => {
    const url = createApiUrl(`api/nutritionistreview/?user=${patientId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};
