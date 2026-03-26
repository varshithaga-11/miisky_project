import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface BlogCategory {
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

export const createBlogCategory = async (data: FormData | BlogCategory) => {
  const url = createApiUrl("api/website/blogcategory/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getBlogCategoryList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/blogcategory/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getBlogCategoryById = async (id: number) => {
  const url = createApiUrl(`api/website/blogcategory/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateBlogCategory = async (id: number, data: FormData | Partial<BlogCategory>) => {
  const url = createApiUrl(`api/website/blogcategory/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteBlogCategory = async (id: number) => {
  const url = createApiUrl(`api/website/blogcategory/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
