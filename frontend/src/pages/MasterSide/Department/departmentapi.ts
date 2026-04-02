import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface Department {
  id?: number;
  name: string;
  description?: string;
  head_name?: string;
  head_email?: string;
  position?: number;
  icon_class?: string;
  image?: any;
  tagline?: string;
  expertise_text?: string;
  key_features?: any;
  short_description?: string;
  is_active?: boolean;
  created_at?: string;
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

export const createDepartment = async (data: FormData | Department) => {
  const url = createApiUrl("api/website/department/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getDepartmentList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/department/");
  const params: any = {
    page,
    limit,
  };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getDepartmentById = async (id: number) => {
  const url = createApiUrl(`api/website/department/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateDepartment = async (id: number, data: FormData | Partial<Department>) => {
  const url = createApiUrl(`api/website/department/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteDepartment = async (id: number) => {
  const url = createApiUrl(`api/website/department/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
