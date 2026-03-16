import { createApiUrl, getAuthHeaders } from "../../../access/access.ts";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';


interface JwtPayload {
  user_id: number;
}

export const getLoggedUserFromToken = (): JwtPayload | null => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

export const userId: number | undefined = getLoggedUserFromToken()?.user_id;
  


export interface UserRegister {
  id?: number;                 // optional for creation
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;                // e.g., 'admin', 'master', 'user', etc.
  is_active?: boolean;
  created_by?: number;         // user ID of creator, optional for creation
  // Add other fields your model uses, e.g.:
  // date_joined?: string;     // ISO date string
  // phone_number?: string;
}

// Create a new user
export const createUser = async (data: UserRegister) => {
  const url = createApiUrl("/app/usermanagement/");
  const response = await axios.post(url, data, {
      headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get user by ID
export const getUserById = async (id: number) => {
  const url = createApiUrl(`/app/usermanagement/${id}/`);
  const response = await axios.get(url, {
      headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update user by ID (full update)
export const updateUser = async (id: number, data: Partial<UserRegister>) => {
  const url = createApiUrl(`/app/usermanagement/${id}/`);
  const response = await axios.put(url, data, {
      headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete user by ID
export const deleteUser = async (id: number) => {
  const url = createApiUrl(`/app/usermanagement/${id}/`);
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
  status_counts?: Record<string, number>;
  totals?: Record<string, number>;
}

export const getUserList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string,
  createdBy?: number
): Promise<PaginatedResponses<UserRegister>> => {
  try {
    const params: Record<string, any> = { page };
    if (createdBy) params.created_by = createdBy;
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const url = createApiUrl("/app/usermanagement/");
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

