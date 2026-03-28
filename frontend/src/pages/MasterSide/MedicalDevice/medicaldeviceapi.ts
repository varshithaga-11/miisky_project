import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface MedicalDevice {
  id?: number;
  category?: number;
  name: string;
  slug?: string;
  short_description?: string;
  description?: string;
  long_description?: string;
  primary_technology?: string;
  is_non_invasive?: boolean;
  is_continuous_monitoring?: boolean;
  connectivity?: string;
  parameters_monitored?: any;
  viral_diseases_detected?: any;
  bacterial_diseases_detected?: any;
  image?: string;
  thumbnail?: string;
  video_url?: string;
  presentation_file?: string;
  brochure_file?: string;
  research_paper_file?: string;
  patent_document?: string;
  patent_number?: string;
  position?: number;
  is_featured?: boolean;
  is_active?: boolean;
  price?: number;
  is_available?: boolean;
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

export const createMedicalDevice = async (data: FormData | MedicalDevice) => {
  const url = createApiUrl("api/website/medicaldevice/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getMedicalDeviceList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/medicaldevice/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getMedicalDeviceById = async (id: number) => {
  const url = createApiUrl(`api/website/medicaldevice/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateMedicalDevice = async (id: number, data: FormData | Partial<MedicalDevice>) => {
  const url = createApiUrl(`api/website/medicaldevice/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteMedicalDevice = async (id: number) => {
  const url = createApiUrl(`api/website/medicaldevice/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
