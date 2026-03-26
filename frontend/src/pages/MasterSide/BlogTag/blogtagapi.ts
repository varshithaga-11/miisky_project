import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface BlogTag {
  id?: number;
  name: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createBlogTag = async (data: BlogTag) => {
  const url = createApiUrl("api/website/blogtag/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getBlogTagList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/blogtag/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getBlogTagById = async (id: number) => {
  const url = createApiUrl(`api/website/blogtag/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateBlogTag = async (id: number, data: Partial<BlogTag>) => {
  const url = createApiUrl(`api/website/blogtag/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteBlogTag = async (id: number) => {
  const url = createApiUrl(`api/website/blogtag/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
