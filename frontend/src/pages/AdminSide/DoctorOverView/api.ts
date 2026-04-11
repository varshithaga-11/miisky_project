import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export const getAdminDoctorList = async (
  page: number = 1,
  search: string = "",
  limit: number = 10
): Promise<{
  results: unknown[];
  total_pages: number;
  count?: number;
}> => {
  const url = createApiUrl(
    `api/admin-doctors/?page=${page}&search=${encodeURIComponent(search)}&limit=${limit}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

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

export const getDoctorPatientComments = async (
  doctorId: number
): Promise<DoctorPatientComment[]> => {
  const url = createApiUrl(
    `api/admin-doctor-patient-comments-nopaginate/?doctor=${doctorId}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return Array.isArray(response.data) ? response.data : [];
};
