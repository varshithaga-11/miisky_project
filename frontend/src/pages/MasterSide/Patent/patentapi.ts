import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface Patent {
  id?: number;
  title: string;
  patent_number?: string;
  application_number?: string;
  inventors?: string;
  abstract?: string;
  filing_date?: string;
  grant_date?: string;
  expiry_date?: string;
  jurisdiction?: string;
  status: string;
  patent_document?: string;
  external_link?: string;
  technology_area?: string;
  device?: number;
  device_name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getPatentList = async (page: number = 1, limit: number = 10, search: string = "") => {
  const url = createApiUrl("api/website/patent/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit, search },
  });
  return response.data;
};

export const createPatent = async (data: FormData | Patent) => {
  const url = createApiUrl("api/website/patent/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const updatePatent = async (id: number, data: FormData | Partial<Patent>) => {
  const url = createApiUrl(`api/website/patent/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deletePatent = async (id: number) => {
  const url = createApiUrl(`api/website/patent/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};

export const getMedicalDevices = async () => {
  const url = createApiUrl("api/website/medicaldevice/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { limit: 100 },
  });
  return response.data.results;
};
