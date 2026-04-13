import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../access/access";

export interface NotificationData {
  id: number;
  user: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
  counts?: Record<string, number>;
}

export type AppNotification = NotificationData;

/**
 * Paginated notifications (read / unread / all) with optional period and date range.
 */
export const getAllNotifications = async (
  page: number = 1,
  limit: number | "all" = 10,
  is_read: string = "all",
  period?: string,
  start_date?: string,
  end_date?: string,
  title?: string
): Promise<PaginatedResponse<NotificationData>> => {
  let url = createApiUrl(`api/notifications/?page=${page}`);
  if (limit) url += limit === "all" ? `&limit=all` : `&limit=${limit}`;
  if (is_read) url += `&is_read=${encodeURIComponent(is_read)}`;
  if (period) url += `&period=${encodeURIComponent(period)}`;
  if (period === "custom" && start_date && end_date) {
    url += `&start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;
  }
  if (title) url += `&title=${encodeURIComponent(title)}`;

  const response = await axios.get<PaginatedResponse<NotificationData>>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const url = createApiUrl(`api/notifications/mark_all_read/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};

/** Bulk mark by allowlisted notification title (see backend NOTIFICATION_TITLE_*). */
export const markReadByTitle = async (title: string, patientId?: number) => {
  const url = createApiUrl(`api/notifications/mark_read_by_title/`);
  const body: { title: string; patient_id?: number } = { title };
  if (patientId !== undefined) body.patient_id = patientId;
  const response = await axios.post(url, body, { headers: await getAuthHeaders() });
  return response.data;
};

/** Mark specific notification rows (must belong to current user). */
export const markNotificationsReadByIds = async (ids: number[]) => {
  const url = createApiUrl(`api/notifications/mark_read/`);
  const response = await axios.post(url, { ids }, { headers: await getAuthHeaders() });
  return response.data;
};

/** Unread count for optional exact title; nutritionists may pass patientId with health-upload title. */
export async function fetchUnreadCountByTitle(title: string, patientId?: number): Promise<number> {
  let url = createApiUrl(`api/notifications/unread_count/`);
  const params = new URLSearchParams();
  params.set("title", title);
  if (patientId !== undefined) params.set("patient_id", String(patientId));
  url += `?${params.toString()}`;
  const response = await axios.get<{ unread: number }>(url, {
    headers: await getAuthHeaders(),
  });
  return typeof response.data.unread === "number" ? response.data.unread : 0;
}

export const markNotificationRead = async (notificationId: number) => {
  const url = createApiUrl(`api/notifications/${notificationId}/mark_as_read/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};

/** Total unread for header badge (matches server; no title filter). */
export async function fetchTotalUnreadCount(): Promise<number> {
  const url = createApiUrl(`api/notifications/unread_count/`);
  const response = await axios.get<{ unread: number }>(url, {
    headers: await getAuthHeaders(),
  });
  return typeof response.data.unread === "number" ? response.data.unread : 0;
}

/** Header dropdown: mixed list for first page + unread total from dedicated endpoint. */
export async function fetchNotificationsApi(limit = 8): Promise<{
  items: AppNotification[];
  unreadCount: number;
}> {
  const [mixed, unreadTotal] = await Promise.all([
    getAllNotifications(1, limit, "all"),
    fetchTotalUnreadCount(),
  ]);
  const items = Array.isArray(mixed.results) ? mixed.results : [];
  return { items, unreadCount: unreadTotal };
}

export async function markNotificationReadApi(id: number): Promise<void> {
  await markNotificationRead(id);
}

export async function markAllNotificationsReadApi(): Promise<void> {
  await markAllNotificationsRead();
}
