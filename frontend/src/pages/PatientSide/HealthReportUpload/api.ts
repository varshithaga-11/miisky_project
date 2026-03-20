import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type HealthReportReview = {
  id: number;
  comments: string;
  created_on: string;
  nutritionist_name: string;
};

export type PatientHealthReport = {
  id: number;
  user: number;
  title: string | null;
  report_file: string;
  report_type: string | null;
  uploaded_on: string;
  reviews?: HealthReportReview[];
};

export const getMyHealthReports = async (): Promise<PatientHealthReport[]> => {
  const url = createApiUrl("api/patienthealthreport/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const uploadHealthReport = async (formData: FormData): Promise<PatientHealthReport> => {
  const url = createApiUrl("api/patienthealthreport/");
  const response = await axios.post(url, formData, {
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteHealthReport = async (id: number): Promise<void> => {
  const url = createApiUrl(`api/patienthealthreport/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};
