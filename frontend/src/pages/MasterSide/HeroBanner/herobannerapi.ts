import axios from "axios";
import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";

export interface HeroBanner {
  id: number;
  page: string;
  title: string;
  subtitle: string;
  description: string;
  background_image?: string;
  background_image_url?: string; // New read-only URL from API
  background_video_url?: string;
  background_color?: string;
  cta_text: string;
  cta_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getHeroBannerList = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  const url = createApiUrl("api/website/herobanner/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    params,
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getHeroBannerById = async (id: number) => {
  const url = createApiUrl(`api/website/herobanner/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const createHeroBanner = async (data: FormData | Partial<HeroBanner>) => {
  const url = createApiUrl("api/website/herobanner/");
  
  // CRITICAL: Switch to File Headers if sending FormData
  const isFormData = data instanceof FormData;
  const headers = isFormData ? await getAuthHeadersFile() : await getAuthHeaders();
  
  const response = await axios.post(url, data, { headers });
  return response.data;
};

export const updateHeroBanner = async (id: number, data: FormData | Partial<HeroBanner>) => {
  const url = createApiUrl(`api/website/herobanner/${id}/`);
  
  // CRITICAL: Switch to File Headers if sending FormData
  const isFormData = data instanceof FormData;
  const headers = isFormData ? await getAuthHeadersFile() : await getAuthHeaders();

  const response = await axios.patch(url, data, { headers });
  return response.data;
};

export const deleteHeroBanner = async (id: number) => {
  const url = createApiUrl(`api/website/herobanner/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
