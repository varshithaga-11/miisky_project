import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface PricingPlan {
  id?: number;
  uid?: string;
  name: string;
  price: number;
  currency_symbol?: string;
  billing_period?: string;
  savings_text?: string;
  icon_class?: string;
  features: string[]; // JSON list mapping from backend
  is_popular?: boolean;
  cta_text?: string;
  cta_url?: string;
  is_active: boolean;
  position: number;
  created_at?: string;
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

export const getPricingPlanById = async (uid: string) => {
  const url = createApiUrl(`api/website/pricingplan/${uid}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updatePricingPlan = async (uid: string, data: Partial<PricingPlan>) => {
  const url = createApiUrl(`api/website/pricingplan/${uid}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deletePricingPlan = async (uid: string) => {
  const url = createApiUrl(`api/website/pricingplan/${uid}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
