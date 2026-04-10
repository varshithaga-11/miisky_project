import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface JobListing {
  id?: number;
  title: string;
  slug?: string;
  department?: number;
  job_type?: string;
  location?: string;
  experience_required?: string;
  qualification_required?: string;
  salary_range?: string;
  openings?: number;
  short_description?: string;
  tagline?: string;
  expertise_text?: string;
  detailed_description?: string;
  application_form_link?: string;
  job_description: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createJobListing = async (data: JobListing) => {
  const url = createApiUrl("api/website/joblisting/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getJobListingList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  department?: number
) => {
  const url = createApiUrl("api/website/joblisting/");
  const params: any = { page, limit };
  if (search) params.search = search;
  if (department) params.department = department;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getJobListingById = async (id: number) => {
  const url = createApiUrl(`api/website/joblisting/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateJobListing = async (id: number, data: Partial<JobListing>) => {
  const url = createApiUrl(`api/website/joblisting/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteJobListing = async (id: number) => {
  const url = createApiUrl(`api/website/joblisting/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
