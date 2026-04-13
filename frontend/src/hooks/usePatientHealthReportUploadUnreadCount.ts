import { useCallback, useEffect, useState } from "react";
import { fetchUnreadCountByCategory } from "../api/notifications";
import {
  NOTIFICATION_CATEGORY_PATIENT_HEALTH_REPORT,
  NOTIFICATION_CATEGORY_NUTRITIONIST_REVIEW_HEALTH_REPORT,
  HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT,
  HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT,
  SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT,
} from "../constants/notifications";
import { getUserRoleFromToken } from "../utils/auth";

const POLL_MS = 5 * 60 * 1000;

/**
 * Sidebar badge: nutritionists see unread upload alerts; patients see unread document-review alerts.
 */
export function usePatientHealthReportUploadUnreadCount(): {
  count: number;
  refetch: () => Promise<void>;
} {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const role = getUserRoleFromToken();
    let category: string | null = null;
    if (role === "nutritionist") {
      category = NOTIFICATION_CATEGORY_PATIENT_HEALTH_REPORT;
    } else if (role === "patient") {
      category = NOTIFICATION_CATEGORY_NUTRITIONIST_REVIEW_HEALTH_REPORT;
    } else {
      setCount(0);
      return;
    }
    try {
      const n = await fetchUnreadCountByCategory(category);
      setCount(typeof n === "number" && n >= 0 ? n : 0);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    const onFocus = () => void load();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT, handler);
    return () => window.removeEventListener(HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT, handler);
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT, handler);
    return () => window.removeEventListener(HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT, handler);
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT, handler);
  }, [load]);

  return { count, refetch: load };
}
