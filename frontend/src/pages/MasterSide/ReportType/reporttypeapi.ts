import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface ReportType {
  id?: number;
  name: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createReportType = async (data: ReportType) => {
  const url = createApiUrl("api/website/reporttype/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getReportTypeList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/reporttype/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getReportTypeById = async (id: number) => {
  const url = createApiUrl(`api/website/reporttype/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateReportType = async (id: number, data: Partial<ReportType>) => {
  const url = createApiUrl(`api/website/reporttype/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteReportType = async (id: number) => {
  const url = createApiUrl(`api/website/reporttype/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
