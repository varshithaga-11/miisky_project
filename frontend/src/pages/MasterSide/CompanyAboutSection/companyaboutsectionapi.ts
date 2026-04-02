import axios from "axios";
import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";

export interface CompanyAboutSection {
  id?: number;
  // About Us
  about_tagline: string;
  about_title: string;
  about_description?: string;
  about_specialties?: string[];
  about_vision?: string[];
  about_experience_years: number;
  about_experience_text: string;
  about_image_1?: string | File | null;
  about_image_1_url?: string;

  // Why Choose Us
  choose_tagline: string;
  choose_title: string;
  choose_description?: string;
  speciality_label: string;
  speciality_title: string;
  speciality_description?: string;
  speciality_points?: string[];
  video_url?: string;
  video_image?: string | File | null;
  video_image_url?: string;

  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getAboutSectionList = async (page: number = 1, limit: number = 10, search: string = "") => {
  const url = createApiUrl("api/website/companyaboutsection/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit, search },
  });
  return response.data;
};

export const createAboutSection = async (data: FormData | CompanyAboutSection) => {
  const url = createApiUrl("api/website/companyaboutsection/");
  const isFormData = data instanceof FormData;
  const headers = isFormData ? await getAuthHeadersFile() : await getAuthHeaders();

  const response = await axios.post(url, data, { headers });
  return response.data;
};

export const updateAboutSection = async (id: number, data: FormData | Partial<CompanyAboutSection>) => {
  const url = createApiUrl(`api/website/companyaboutsection/${id}/`);
  const isFormData = data instanceof FormData;
  const headers = isFormData ? await getAuthHeadersFile() : await getAuthHeaders();

  const response = await axios.patch(url, data, { headers });
  return response.data;
};

export const deleteAboutSection = async (id: number) => {
  const url = createApiUrl(`api/website/companyaboutsection/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
