import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface HealthConditionMaster {
  id?: number;
  name: string;
  category: string;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

const basePath = "api/health-condition-master/";

export const createHealthConditionMaster = async (data: HealthConditionMaster) => {
  const url = createApiUrl(basePath);
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getHealthConditionMasterList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<HealthConditionMaster>> => {
  const params: Record<string, unknown> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const isAll = limit === "all";
  const url = createApiUrl(isAll ? `${basePath}all/` : basePath);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: isAll ? { search } : params,
  });

  if (isAll) {
    const rows = response.data as HealthConditionMaster[];
    return {
      count: rows.length,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1,
      results: rows,
    };
  }

  return response.data as PaginatedResponses<HealthConditionMaster>;
};

export const getHealthConditionMasterById = async (id: number) => {
  const url = createApiUrl(`${basePath}${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateHealthConditionMaster = async (id: number, data: Partial<HealthConditionMaster>) => {
  const url = createApiUrl(`${basePath}${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteHealthConditionMaster = async (id: number) => {
  const url = createApiUrl(`${basePath}${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};
