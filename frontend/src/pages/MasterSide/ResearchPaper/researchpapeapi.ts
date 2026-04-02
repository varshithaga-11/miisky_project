import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface ResearchPaper {
  id?: number;
  device?: number;
  title: string;
  authors?: string;
  abstract?: string;
  publication_date?: string;
  published_date?: string;
  document?: any;
  document_url?: string;
  document_1?: any;
  document_1_url?: string;
  document_2?: any;
  document_2_url?: string;
  pdf_file?: string; // Kept for legacy if needed, but primary is document
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

export const createResearchPaper = async (data: FormData | ResearchPaper) => {
  const url = createApiUrl("api/website/researchpaper/");
  const response = await axios.post(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const getResearchPaperList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/researchpaper/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getResearchPaperById = async (id: number) => {
  const url = createApiUrl(`api/website/researchpaper/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateResearchPaper = async (id: number, data: FormData | Partial<ResearchPaper>) => {
  const url = createApiUrl(`api/website/researchpaper/${id}/`);
  const response = await axios.patch(url, data, {
    headers: data instanceof FormData ? { ...await getAuthHeaders(), "Content-Type": "multipart/form-data" } : await getAuthHeaders(),
  });
  return response.data;
};

export const deleteResearchPaper = async (id: number) => {
  const url = createApiUrl(`api/website/researchpaper/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
