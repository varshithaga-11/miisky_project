import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type TicketCategory = {
  id?: number;
  name: string;
};

export type PaginatedResponses<T> = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page?: number;
  total_pages?: number;
  results: T[];
};

export async function getTicketCategoryList(
  page = 1,
  limit: number | "all" = 20,
  search = ""
): Promise<PaginatedResponses<TicketCategory> | TicketCategory[]> {
  const isAll = limit === "all";
  const url = createApiUrl(isAll ? "api/ticketcategory/all/" : "api/ticketcategory/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: isAll ? (search ? { search } : undefined) : { page, limit, ...(search ? { search } : {}) },
  });
  return res.data as any;
}

export async function createTicketCategory(payload: TicketCategory): Promise<TicketCategory> {
  const url = createApiUrl("api/ticketcategory/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data as TicketCategory;
}

export async function updateTicketCategory(id: number, payload: Partial<TicketCategory>): Promise<TicketCategory> {
  const url = createApiUrl(`api/ticketcategory/${id}/`);
  const res = await axios.put(url, payload, { headers: await getAuthHeaders() });
  return res.data as TicketCategory;
}

export async function deleteTicketCategory(id: number): Promise<void> {
  const url = createApiUrl(`api/ticketcategory/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
}

export async function checkTicketCategoryUsage(id: number): Promise<{ is_used: boolean }> {
  const url = createApiUrl(`api/ticketcategory/${id}/check-usage/`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data;
}

