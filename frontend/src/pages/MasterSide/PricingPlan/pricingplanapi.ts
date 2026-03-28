import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface PricingPlan {
  id?: number;
  name: string;
  price_monthly: number;
  price_yearly?: number;
  features: string[]; // JSON list mapping from backend
  is_featured: boolean;
  is_active: boolean;
  position: number;
  created_at?: string;
  button_text?: string;
  plan_category?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createPricingPlan = async (data: PricingPlan) => {
  const url = createApiUrl("api/website/pricingplan/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getPricingPlanList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/pricingplan/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getPricingPlanById = async (id: number) => {
  const url = createApiUrl(`api/website/pricingplan/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updatePricingPlan = async (id: number, data: Partial<PricingPlan>) => {
  const url = createApiUrl(`api/website/pricingplan/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deletePricingPlan = async (id: number) => {
  const url = createApiUrl(`api/website/pricingplan/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
