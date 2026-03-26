import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface CompanyInfo {
  id?: number;
  name?: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email_support?: string;
  email_general?: string;
  whatsapp_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  google_maps_url?: string;
  google_maps_embed_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  working_hours?: string;
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

export const createCompanyInfo = async (data: FormData | CompanyInfo) => {
  const url = createApiUrl("api/website/companyinfo/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getCompanyInfoList = async (page: number = 1, limit: number = 10) => {
  const url = createApiUrl("api/website/companyinfo/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return response.data;
};

export const getCompanyInfoById = async (id: number) => {
  const url = createApiUrl(`api/website/companyinfo/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateCompanyInfo = async (id: number, data: FormData | Partial<CompanyInfo>) => {
  const url = createApiUrl(`api/website/companyinfo/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteCompanyInfo = async (id: number) => {
  const url = createApiUrl(`api/website/companyinfo/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
