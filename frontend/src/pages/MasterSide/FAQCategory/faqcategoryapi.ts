import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface FAQCategory {
  id?: number;
  name: string;
  description?: string;
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

export const createFAQCategory = async (data: FAQCategory) => {
  const url = createApiUrl("api/website/faqcategory/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getFAQCategoryList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/faqcategory/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getFAQCategoryById = async (id: number) => {
  const url = createApiUrl(`api/website/faqcategory/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateFAQCategory = async (id: number, data: Partial<FAQCategory>) => {
  const url = createApiUrl(`api/website/faqcategory/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteFAQCategory = async (id: number) => {
  const url = createApiUrl(`api/website/faqcategory/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
