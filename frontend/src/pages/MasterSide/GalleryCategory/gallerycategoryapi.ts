import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface GalleryCategory {
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

export const createGalleryCategory = async (data: GalleryCategory) => {
  const url = createApiUrl("api/website/gallerycategory/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getGalleryCategoryList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/gallerycategory/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getGalleryCategoryById = async (id: number) => {
  const url = createApiUrl(`api/website/gallerycategory/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateGalleryCategory = async (id: number, data: Partial<GalleryCategory>) => {
  const url = createApiUrl(`api/website/gallerycategory/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteGalleryCategory = async (id: number) => {
  const url = createApiUrl(`api/website/gallerycategory/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
