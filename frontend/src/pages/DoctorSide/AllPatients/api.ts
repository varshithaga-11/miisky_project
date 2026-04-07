import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import {
  fetchAdminPatientList,
  fetchQuestionnairesForPatient,
  fetchHealthReportsForPatient,
  unwrapResults,
  resolveMediaUrl,
  type PatientUserRow,
  type PaginatedResponse,
} from "../../AdminSide/PatientOverview/api";

export type {
  PatientUserRow,
  PaginatedResponse,
};

export { fetchAdminPatientList, resolveMediaUrl };

export const fetchDietPlansForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const url = createApiUrl("api/userdietplan/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: patientUserId, limit: 200, page: 1 },
  });
  return unwrapResults(response.data);
};

export const fetchQuestionnaireForPatient = async (patientUserId: number): Promise<unknown | null> => {
  const rows = await fetchQuestionnairesForPatient(patientUserId);
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0];
};

export const fetchHealthReportsForPatientDoctor = fetchHealthReportsForPatient;

export type HealthReportReviewRow = {
  id: number;
  comments: string;
  created_on: string;
  nutritionist_name: string;
  doctor_name?: string | null;
  reviewer_role?: string;
};

export type PatientHealthReportRow = {
  id: number;
  user: number;
  title: string | null;
  report_file: string;
  report_type: string | null;
  uploaded_on: string;
  reviews?: HealthReportReviewRow[];
};

export const saveReviewForPatient = async (payload: {
  user: number;
  comments: string;
  reports: number[];
}): Promise<unknown> => {
  const url = createApiUrl("api/nutritionistreview/");
  const response = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return response.data;
};
