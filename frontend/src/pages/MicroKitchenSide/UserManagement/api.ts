import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access.ts";
import axios from "axios";

export interface UserRegister {
  id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active?: boolean;
  created_by?: number;
  mobile?: string | null;
  whatsapp?: string | null;
  dob?: string | null;
  gender?: "male" | "female" | "other" | null;
  photo?: File | string | null;
  address?: string | null;
  lat_lng_address?: string | null;
  city?: number | null;
  zip_code?: string | null;
  state?: number | null;
  country?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  joined_date?: string | null;
  created_on?: string;
  password?: string;
  password_confirm?: string;
}

export const createUser = async (data: UserRegister) => {
  const url = createApiUrl("api/usermanagement/");
  const hasFile = data.photo instanceof File;
  const payload = hasFile ? toUserFormData(data) : data;
  const headers = hasFile ? await getAuthHeadersFile() : await getAuthHeaders();

  const response = await axios.post(url, payload, { headers });
  return response.data;
};

export const getUserById = async (id: number) => {
  const url = createApiUrl(`api/usermanagement/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateUser = async (id: number, data: Partial<UserRegister>) => {
  const url = createApiUrl(`api/usermanagement/${id}/`);
  const hasFile = data.photo instanceof File;
  const payload = hasFile ? toUserFormData(data) : data;
  const headers = hasFile ? await getAuthHeadersFile() : await getAuthHeaders();

  const response = await axios.put(url, payload, { headers });
  return response.data;
};

export const deleteUser = async (id: number) => {
  const url = createApiUrl(`api/usermanagement/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const getUserList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  role: string = "supply_chain",
  status?: string,
  filters: { city?: number; state?: number; country?: number } = {}
): Promise<PaginatedResponses<UserRegister>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;
    params.role = role; // Lock to supply_chain by default
    if (status && status !== "all") params.status = status;
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.country) params.country = filters.country;

    const url = createApiUrl("api/usermanagement/");
    const response = await axios.get<PaginatedResponses<UserRegister>>(url, {
      headers: await getAuthHeaders(),
      params: limit === "all" ? { ...params, limit: 9999 } : params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user list:", error);
    throw error;
  }
};

const toUserFormData = (data: Partial<UserRegister>) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) return;
    if (value instanceof File) {
      fd.append(key, value);
      return;
    }
    fd.append(key, String(value));
  });
  return fd;
};
