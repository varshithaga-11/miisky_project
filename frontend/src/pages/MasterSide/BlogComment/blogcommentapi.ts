import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface BlogComment {
  id?: number;
  blog_post: number | string;
  name: string;
  email: string;
  comment: string;
  is_approved?: boolean;
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

export const createBlogComment = async (data: BlogComment) => {
  const url = createApiUrl("api/website/blogcomment/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getBlogCommentList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/blogcomment/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getBlogCommentById = async (id: number) => {
  const url = createApiUrl(`api/website/blogcomment/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateBlogComment = async (id: number, data: Partial<BlogComment>) => {
  const url = createApiUrl(`api/website/blogcomment/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteBlogComment = async (id: number) => {
  const url = createApiUrl(`api/website/blogcomment/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
