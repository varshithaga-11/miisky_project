import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface Partner {
  id?: number;
  name: string;
  logo?: string;
  description?: string;
  website_url?: string;
  logo_alt_text?: string;
  display_on_home?: boolean;
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

export const createPartner = async (data: FormData | Partner) => {
  const url = createApiUrl("api/website/partner/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getPartnerList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/partner/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getPartnerById = async (id: number) => {
  const url = createApiUrl(`api/website/partner/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updatePartner = async (id: number, data: FormData | Partial<Partner>) => {
  const url = createApiUrl(`api/website/partner/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deletePartner = async (id: number) => {
  const url = createApiUrl(`api/website/partner/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
