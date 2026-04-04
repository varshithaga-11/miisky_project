import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface BlogPost {
  id?: number;
  category?: number;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  read_time?: string;
  author_name?: string;
  author_designation?: string;
  author_image?: any;
  featured_image?: string;
  image?: any;
  video_file?: any;
  video_url?: string;
  published_at?: string;
  position?: number;
  views_count?: number;
  likes_count?: number;
  engagement?: number;
  is_active?: boolean;
  status?: "draft" | "published";
  tag_ids?: number[];
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

export const createBlogPost = async (data: FormData | BlogPost) => {
  const url = createApiUrl("api/website/blogpost/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getBlogPostList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string,
  tag?: string
) => {
  const url = createApiUrl("api/website/blogpost/");
  const params: any = { page, limit };
  if (search) params.search = search;
  if (category) params.category = category;
  if (tag) params.tag = tag;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getBlogPostById = async (id: number) => {
  const url = createApiUrl(`api/website/blogpost/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateBlogPost = async (id: number, data: FormData | Partial<BlogPost>) => {
  const url = createApiUrl(`api/website/blogpost/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteBlogPost = async (id: number) => {
  const url = createApiUrl(`api/website/blogpost/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
