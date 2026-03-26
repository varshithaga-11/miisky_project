import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface JobApplication {
  id?: number;
  job?: number;
  applicant_name: string;
  email: string;
  phone?: string;
  resume?: string;
  cover_letter?: string;
  status?: string;
  admin_notes?: string;
  applied_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createJobApplication = async (data: FormData | JobApplication) => {
  const url = createApiUrl("api/website/jobapplication/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getJobApplicationList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/jobapplication/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getJobApplicationById = async (id: number) => {
  const url = createApiUrl(`api/website/jobapplication/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateJobApplication = async (id: number, data: Partial<JobApplication>) => {
  const url = createApiUrl(`api/website/jobapplication/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteJobApplication = async (id: number) => {
  const url = createApiUrl(`api/website/jobapplication/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
