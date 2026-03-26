import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface MedicalDeviceCategory {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  position?: number;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createMedicalDeviceCategory = async (data: FormData | MedicalDeviceCategory) => {
  const url = createApiUrl("api/website/medicaldevicecategory/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getMedicalDeviceCategoryList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/medicaldevicecategory/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getMedicalDeviceCategoryById = async (id: number) => {
  const url = createApiUrl(`api/website/medicaldevicecategory/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateMedicalDeviceCategory = async (id: number, data: FormData | Partial<MedicalDeviceCategory>) => {
  const url = createApiUrl(`api/website/medicaldevicecategory/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteMedicalDeviceCategory = async (id: number) => {
  const url = createApiUrl(`api/website/medicaldevicecategory/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
