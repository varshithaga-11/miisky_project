import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../access/access";

export interface NotificationData {
  id: number;
  user: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  category?: string;
  /** Patient user id when notification is about a specific patient (e.g. health upload). */
  related_patient_id?: number | null;
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
  category?: string
): Promise<PaginatedResponse<NotificationData>> => {
  let url = createApiUrl(`api/notifications/?page=${page}`);
  if (limit) url += limit === "all" ? `&limit=all` : `&limit=${limit}`;
  if (is_read) url += `&is_read=${encodeURIComponent(is_read)}`;
  if (period) url += `&period=${encodeURIComponent(period)}`;
  if (period === "custom" && start_date && end_date) {
    url += `&start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;
  }
  if (category) url += `&category=${encodeURIComponent(category)}`;

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

/** Nutritionist: pass `patientId`. Patient (bulk clear for category): omit `patientId`. */
export const markCategoryRead = async (category: string, patientId?: number) => {
  const url = createApiUrl(`api/notifications/mark_category_read/`);
  const body: { category: string; patient_id?: number } = { category };
  if (patientId !== undefined) body.patient_id = patientId;
  const response = await axios.post(url, body, { headers: await getAuthHeaders() });
  return response.data;
};

/** Unread count for a single category (uses server `counts.unread`; `limit=all` avoids pagination quirks). */
export async function fetchUnreadCountByCategory(category: string): Promise<number> {
  const data = await getAllNotifications(1, "all", "false", undefined, undefined, undefined, category);
  if (typeof data.counts?.unread === "number") return data.counts.unread;
  const results = Array.isArray(data.results) ? data.results : [];
  return results.filter((n) => !n.is_read).length;
}

export const markNotificationRead = async (notificationId: number) => {
  const url = createApiUrl(`api/notifications/${notificationId}/mark_as_read/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};

/** Total unread for header badge (matches server; avoids paginated list quirks with limit=1). */
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
