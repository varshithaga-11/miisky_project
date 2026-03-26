import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface Testimonial {
  id?: number;
  name: string;
  designation?: string;
  organization?: string;
  photo?: string;
  testimonial_text: string;
  rating?: number;
  testimonial_type?: "patient" | "nutritionist" | "micro_kitchen" | "general";
  video_url?: string;
  is_featured?: boolean;
  is_active?: boolean;
  position?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createTestimonial = async (data: FormData | Testimonial) => {
  const url = createApiUrl("api/website/testimonial/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getTestimonialList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/testimonial/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getTestimonialById = async (id: number) => {
  const url = createApiUrl(`api/website/testimonial/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateTestimonial = async (id: number, data: FormData | Partial<Testimonial>) => {
  const url = createApiUrl(`api/website/testimonial/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteTestimonial = async (id: number) => {
  const url = createApiUrl(`api/website/testimonial/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
