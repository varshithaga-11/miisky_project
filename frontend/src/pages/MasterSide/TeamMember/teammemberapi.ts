import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface TeamMember {
  id?: number;
  name: string;
  designation: string;
  department?: number;
  bio?: string;
  qualification?: string;
  experience_years?: number;
  photo?: string;
  linkedin_url?: string;
  email?: string;
  phone?: string;
  position?: number;
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

export const createTeamMember = async (data: FormData | TeamMember) => {
  const url = createApiUrl("api/website/teammember/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getTeamMemberList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/teammember/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getTeamMemberById = async (id: number) => {
  const url = createApiUrl(`api/website/teammember/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateTeamMember = async (id: number, data: FormData | Partial<TeamMember>) => {
  const url = createApiUrl(`api/website/teammember/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteTeamMember = async (id: number) => {
  const url = createApiUrl(`api/website/teammember/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
