import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface ContactUsInfo {
  id?: number;
  uid?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email_support?: string;
  email_general?: string;
  whatsapp_number?: string;
  google_maps_url?: string;
  google_maps_embed_url?: string;
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

export const createContactUsInfo = async (data: ContactUsInfo) => {
  const url = createApiUrl("api/website/contactusinfo/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getContactUsInfoList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/contactusinfo/");
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

export const getContactUsInfoByUid = async (uid: string) => {
  const url = createApiUrl(`api/website/contactusinfo/${uid}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateContactUsInfo = async (uid: string, data: Partial<ContactUsInfo>) => {
  const url = createApiUrl(`api/website/contactusinfo/${uid}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteContactUsInfo = async (uid: string) => {
  const url = createApiUrl(`api/website/contactusinfo/${uid}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
