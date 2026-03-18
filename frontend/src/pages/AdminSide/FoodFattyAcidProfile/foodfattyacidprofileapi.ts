import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface FoodFattyAcidProfile {
  id?: number;
  food_name?: number | null;
  food_name_display?: string;
  base_unit?: string | null;
  butyric?: number | null;
  caproic?: number | null;
  caprylic?: number | null;
  capric?: number | null;
  lauric?: number | null;
  myristic?: number | null;
  palmitic?: number | null;
  stearic?: number | null;
  arachidic?: number | null;
  behenic?: number | null;
  lignoceric?: number | null;
  myristoleic?: number | null;
  palmitoleic?: number | null;
  oleic?: number | null;
  elaidic?: number | null;
  eicosenoic?: number | null;
  erucic?: number | null;
  linoleic?: number | null;
  alpha_linolenic?: number | null;
  total_sfa?: number | null;
  total_mufa?: number | null;
  total_pufa?: number | null;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createFoodFattyAcidProfile = async (data: Partial<FoodFattyAcidProfile>) => {
  const url = createApiUrl("api/foodfattyacidprofile/");
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const getFoodFattyAcidProfileList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<FoodFattyAcidProfile>> => {
  const params: Record<string, any> = { page };
  if (limit !== "all") params.limit = limit;
  if (search) params.search = search;

  const url = createApiUrl("api/foodfattyacidprofile/");
  const response = await axios.get<PaginatedResponses<FoodFattyAcidProfile>>(url, {
    headers: await getAuthHeaders(),
    params: limit === "all" ? { ...params, limit: 9999 } : params,
  });
  return response.data;
};

export const getFoodFattyAcidProfileById = async (id: number) => {
  const url = createApiUrl(`api/foodfattyacidprofile/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateFoodFattyAcidProfile = async (id: number, data: Partial<FoodFattyAcidProfile>) => {
  const url = createApiUrl(`api/foodfattyacidprofile/${id}/`);
  const response = await axios.put(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteFoodFattyAcidProfile = async (id: number) => {
  const url = createApiUrl(`api/foodfattyacidprofile/${id}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

