import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type TicketCategory = {
  id: number;
  name: string;
};

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high";
export type SupportTicketUserType = "patient" | "nutritionist" | "kitchen";

export type SupportTicket = {
  id: number;
  created_by: number | null;
  assigned_to: number | null;
  category: number | null;
  user_type: SupportTicketUserType;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  created_at: string;
  updated_at: string;
  // If backend returns expanded objects later, we keep it flexible
  category_details?: TicketCategory | null;
  created_by_details?: { id: number; username?: string; first_name?: string; last_name?: string } | null;
  assigned_to_details?: { id: number; username?: string; first_name?: string; last_name?: string } | null;
};

export type TicketMessage = {
  id: number;
  ticket: number;
  sender: number | null;
  message: string;
  is_internal: boolean;
  created_at: string;
  sender_details?: { id: number; username?: string; first_name?: string; last_name?: string } | null;
};

export type PaginatedResponse<T> = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page?: number;
  total_pages?: number;
  results: T[];
};

export async function getTicketCategories(search = ""): Promise<TicketCategory[]> {
  const url = createApiUrl("api/ticketcategory/all/");
  const res = await axios.get(url, { headers: await getAuthHeaders(), params: search ? { search } : undefined });
  return res.data as TicketCategory[];
}

export async function createSupportTicket(payload: {
  category?: number | null;
  user_type: SupportTicketUserType;
  title: string;
  description: string;
  priority?: SupportTicketPriority;
}): Promise<SupportTicket> {
  const url = createApiUrl("api/supportticket/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data as SupportTicket;
}

export async function getMySupportTickets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: SupportTicketStatus | "all";
}): Promise<PaginatedResponse<SupportTicket> | SupportTicket[]> {
  const url = createApiUrl("api/supportticket/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: {
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
      mine: true,
    },
  });
  return res.data as PaginatedResponse<SupportTicket> | SupportTicket[];
}

export async function getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
  const url = createApiUrl("api/ticketmessage/");
  const res = await axios.get(url, { headers: await getAuthHeaders(), params: { ticket: ticketId } });
  return (res.data?.results ?? res.data) as TicketMessage[];
}

export async function sendTicketMessage(payload: {
  ticket: number;
  message: string;
  is_internal?: boolean;
}): Promise<TicketMessage> {
  const url = createApiUrl("api/ticketmessage/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data as TicketMessage;
}
