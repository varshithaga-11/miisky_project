import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface LegalPage {
  id?: number;
  page_type: string;
  title: string;
  slug?: string;
  content: string;
  version?: string;
  effective_date?: string;
  last_updated?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getLegalPageList = async (page: number = 1, limit: number = 10) => {
  const url = createApiUrl("api/website/legalpage/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return response.data;
};

export const createLegalPage = async (data: LegalPage) => {
  const url = createApiUrl("api/website/legalpage/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateLegalPage = async (id: number, data: Partial<LegalPage>) => {
  const url = createApiUrl(`api/website/legalpage/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteLegalPage = async (id: number) => {
  const url = createApiUrl(`api/website/legalpage/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
