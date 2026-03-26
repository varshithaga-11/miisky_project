import axios from "axios";
import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";

export interface GalleryItem {
  id?: number;
  category?: number;
  category_name?: string;
  title: string;
  description?: string;
  media_type?: 'image' | 'video';
  image?: File | string | null;
  image_url?: string;
  video_url?: string;
  thumbnail?: File | string | null;
  thumbnail_url?: string;
  position?: number;
  is_featured?: boolean;
  is_active?: boolean;
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

export const createGalleryItem = async (data: FormData | GalleryItem) => {
  const url = createApiUrl("api/website/galleryitem/");
  const isFormData = data instanceof FormData;
  const headers = isFormData ? await getAuthHeadersFile() : await getAuthHeaders();
  
  const response = await axios.post(url, data, { headers });
  return response.data;
};

export const getGalleryItemList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/galleryitem/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getGalleryItemById = async (id: number) => {
  const url = createApiUrl(`api/website/galleryitem/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateGalleryItem = async (id: number, data: FormData | Partial<GalleryItem>) => {
  const url = createApiUrl(`api/website/galleryitem/${id}/`);
  const isFormData = data instanceof FormData;
  const headers = isFormData ? await getAuthHeadersFile() : await getAuthHeaders();

  const response = await axios.patch(url, data, { headers });
  return response.data;
};

export const deleteGalleryItem = async (id: number) => {
  const url = createApiUrl(`api/website/galleryitem/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
