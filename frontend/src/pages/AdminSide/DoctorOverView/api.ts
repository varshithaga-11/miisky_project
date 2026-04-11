import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type PaginatedResponse<T> = {
  count: number;
  current_page: number;
  total_pages: number;
  next: number | null;
  previous: number | null;
  results: T[];
};

export const getAdminDoctorList = async (
  page: number = 1,
  search: string = "",
  limit: number = 10
): Promise<PaginatedResponse<unknown>> => {
  const url = createApiUrl(
    `api/admin-doctors/?page=${page}&search=${encodeURIComponent(search)}&limit=${limit}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

/** Distinct patients (with doctor comments), paginated */
export type DoctorOverviewPatientRow = {
  patient: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string | null;
  } | null;
  comment_count: number;
  last_comment_at: string | null;
};

export const getAdminDoctorPatients = async (
  doctorId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<DoctorOverviewPatientRow>> => {
  const url = createApiUrl(
    `api/admin-doctor-patients/?doctor=${doctorId}&page=${page}&limit=${limit}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

/** Paginated comment entries for one doctor + patient */
export type DoctorPatientComment = {
  id: number;
  comments: string;
  created_on: string;
  patient_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string | null;
  } | null;
  report_details: {
    id: number;
    title: string | null;
    report_type: string | null;
    uploaded_on: string;
    report_file: string | null;
  }[];
};

export const getDoctorPatientCommentsPaginated = async (
  doctorId: number,
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<DoctorPatientComment>> => {
  const url = createApiUrl(
    `api/admin-doctor-patient-comments/?doctor=${doctorId}&patient=${patientId}&page=${page}&limit=${limit}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};
