import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export interface PackagingMaterial {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface PaginatedResponses<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

// Create
export const createPackagingMaterial = async (data: PackagingMaterial) => {
  const url = createApiUrl("api/packagingmaterial/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Get List
export const getPackagingMaterialList = async (
  page: number = 1,
  limit: number | "all" = 10,
  search?: string
): Promise<PaginatedResponses<PackagingMaterial>> => {
  try {
    const params: Record<string, any> = { page };
    if (limit !== "all") params.limit = limit;
    if (search) params.search = search;

    const isAll = limit === "all";
    const url = createApiUrl(isAll ? "api/packagingmaterial/all/" : "api/packagingmaterial/");
    const response = await axios.get<PaginatedResponses<PackagingMaterial> | PackagingMaterial[]>(url, {
      headers: await getAuthHeaders(),
      params: isAll ? { search } : params,
    });

    if (isAll) {
      return {
        count: (response.data as PackagingMaterial[]).length,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1,
        results: response.data as PackagingMaterial[],
      };
    }

    return response.data as PaginatedResponses<PackagingMaterial>;
  } catch (error) {
    console.error("Error fetching packaging material list:", error);
    throw error;
  }
};

// Get By ID
export const getPackagingMaterialById = async (id: number) => {
  const url = createApiUrl(`api/packagingmaterial/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Update
export const updatePackagingMaterial = async (id: number, data: Partial<PackagingMaterial>) => {
  const url = createApiUrl(`api/packagingmaterial/${id}/`);
  const response = await axios.put(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

// Delete
export const deletePackagingMaterial = async (id: number) => {
  const url = createApiUrl(`api/packagingmaterial/${id}/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
