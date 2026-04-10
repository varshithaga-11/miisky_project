import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface FAQ {
  id?: number;
  category?: number;
  question: string;
  answer: string;
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

export const createFAQ = async (data: FAQ) => {
  const url = createApiUrl("api/website/faq/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getFAQList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: number
) => {
  const url = createApiUrl("api/website/faq/");
  const params: any = { page, limit };
  if (search) params.search = search;
  if (category) params.category = category;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getFAQById = async (id: number) => {
  const url = createApiUrl(`api/website/faq/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateFAQ = async (id: number, data: Partial<FAQ>) => {
  const url = createApiUrl(`api/website/faq/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteFAQ = async (id: number) => {
  const url = createApiUrl(`api/website/faq/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
