import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface DeviceFeature {
  id?: number;
  device?: number;
  feature: string;
  position?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createDeviceFeature = async (data: DeviceFeature) => {
  const url = createApiUrl("api/website/devicefeature/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getDeviceFeatureList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/devicefeature/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getDeviceFeatureById = async (id: number) => {
  const url = createApiUrl(`api/website/devicefeature/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateDeviceFeature = async (id: number, data: Partial<DeviceFeature>) => {
  const url = createApiUrl(`api/website/devicefeature/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteDeviceFeature = async (id: number) => {
  const url = createApiUrl(`api/website/devicefeature/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
