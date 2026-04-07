import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface SymptomMaster {
  id?: number;
  name: string;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

const basePath = "api/symptom-master/";

export const createSymptomMaster = async (data: SymptomMaster) => {
  const url = createApiUrl(basePath);
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getSymptomMasterList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<SymptomMaster>> => {
  const params: Record<string, unknown> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;
  const isAll = limit === "all";
  const url = createApiUrl(isAll ? `${basePath}all/` : basePath);
  const response = await axios.get(url, { headers: await getAuthHeaders(), params: isAll ? { search } : params });
  if (isAll) {
    const rows = response.data as SymptomMaster[];
    return { count: rows.length, next: null, previous: null, current_page: 1, total_pages: 1, results: rows };
  }
  return response.data as PaginatedResponses<SymptomMaster>;
};

export const getSymptomMasterById = async (id: number) => {
  const response = await axios.get(createApiUrl(`${basePath}${id}/`), { headers: await getAuthHeaders() });
  return response.data;
};

export const updateSymptomMaster = async (id: number, data: Partial<SymptomMaster>) => {
  const response = await axios.put(createApiUrl(`${basePath}${id}/`), data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteSymptomMaster = async (id: number) => {
  const response = await axios.delete(createApiUrl(`${basePath}${id}/`), { headers: await getAuthHeaders() });
  return response.data;
};
