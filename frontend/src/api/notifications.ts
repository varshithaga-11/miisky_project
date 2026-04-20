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
  end_date?: string
): Promise<PaginatedResponse<NotificationData>> => {
  let url = createApiUrl(`api/notifications/?page=${page}`);
  if (limit) url += limit === "all" ? `&limit=all` : `&limit=${limit}`;
  if (is_read) url += `&is_read=${encodeURIComponent(is_read)}`;
  if (period) url += `&period=${encodeURIComponent(period)}`;
  if (period === "custom" && start_date && end_date) {
    url += `&start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;
  }

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

export const markNotificationRead = async (notificationId: number) => {
  const url = createApiUrl(`api/notifications/${notificationId}/mark_as_read/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};

/** Header badge / context: same filters as notifications page (this month, unread count from API) */
export async function fetchNotificationsApi(limit = 10): Promise<{
  items: AppNotification[];
  unreadCount: number;
}> {
  const data = await getAllNotifications(1, limit, "all", "this_month");
  const items = Array.isArray(data.results) ? data.results : [];
  const unreadCount =
    typeof data.counts?.unread === "number"
      ? data.counts.unread
      : items.filter((n) => !n.is_read).length;
  return { items, unreadCount };
}

export async function markNotificationReadApi(id: number): Promise<void> {
  await markNotificationRead(id);
}

export async function markAllNotificationsReadApi(): Promise<void> {
  await markAllNotificationsRead();
}
