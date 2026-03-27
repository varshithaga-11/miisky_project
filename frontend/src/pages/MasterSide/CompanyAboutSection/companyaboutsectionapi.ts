import axios from "axios";
import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";

export interface CompanyAboutSection {
  id?: number;
  section_type: string;
  title: string;
  subtitle?: string;
  content: string;
  bullet_points?: string[];
  icon_class?: string;
  image?: string;
  entity_name?: string;
  entity_description?: string;
  entity_website?: string;
  position: number;
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
