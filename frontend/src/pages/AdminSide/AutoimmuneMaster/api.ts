import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface AutoimmuneMaster {
  id?: number;
  name: string;
  sort_order?: number;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

const basePath = "api/autoimmune-master/";

export const createAutoimmuneMaster = async (data: AutoimmuneMaster) => {
  const response = await axios.post(createApiUrl(basePath), data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getAutoimmuneMasterList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<AutoimmuneMaster>> => {
  const params: Record<string, unknown> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;
  const isAll = limit === "all";
  const url = createApiUrl(isAll ? `${basePath}all/` : basePath);
  const response = await axios.get(url, { headers: await getAuthHeaders(), params: isAll ? { search } : params });
  if (isAll) {
    const rows = response.data as AutoimmuneMaster[];
    return { count: rows.length, next: null, previous: null, current_page: 1, total_pages: 1, results: rows };
  }
  return response.data as PaginatedResponses<AutoimmuneMaster>;
};

export const getAutoimmuneMasterById = async (id: number) => {
  return (await axios.get(createApiUrl(`${basePath}${id}/`), { headers: await getAuthHeaders() })).data;
};

export const updateAutoimmuneMaster = async (id: number, data: Partial<AutoimmuneMaster>) => {
  return (await axios.put(createApiUrl(`${basePath}${id}/`), data, { headers: await getAuthHeaders() })).data;
};

export const deleteAutoimmuneMaster = async (id: number) => {
  return (await axios.delete(createApiUrl(`${basePath}${id}/`), { headers: await getAuthHeaders() })).data;
};
