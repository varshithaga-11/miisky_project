import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface WebsiteReport {
  id?: number;
  report_type?: number;
  requested_by_name: string;
  requested_by_email: string;
  message?: string;
  status?: string;
  created_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createWebsiteReport = async (data: WebsiteReport) => {
  const url = createApiUrl("api/website/websitereport/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getWebsiteReportList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/websitereport/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getWebsiteReportById = async (id: number) => {
  const url = createApiUrl(`api/website/websitereport/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateWebsiteReport = async (id: number, data: Partial<WebsiteReport>) => {
  const url = createApiUrl(`api/website/websitereport/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteWebsiteReport = async (id: number) => {
  const url = createApiUrl(`api/website/websitereport/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
