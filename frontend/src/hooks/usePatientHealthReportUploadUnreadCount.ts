import { useCallback, useEffect, useState } from "react";
import { fetchUnreadCountByTitle } from "../api/notifications";
import {
  NOTIFICATION_TITLE_PATIENT_HEALTH_UPLOAD,
  NOTIFICATION_TITLE_REVIEW,
  NOTIFICATION_TITLE_FOOD_SUGGESTION,
  HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT,
  HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT,
  SUGGESTED_FOOD_UNREAD_REFRESH_EVENT,
  SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT,
} from "../constants/notifications";
import { getUserRoleFromToken } from "../utils/auth";

const POLL_MS = 5 * 60 * 1000;

/**
 * Sidebar badges: nutritionist = unread health uploads; patient = review + suggested-food titles.
 */
export function usePatientHealthReportUploadUnreadCount(): {
  count: number;
  foodSuggestionCount: number;
  refetch: () => Promise<void>;
} {
  const [count, setCount] = useState(0);
  const [foodSuggestionCount, setFoodSuggestionCount] = useState(0);

  const load = useCallback(async () => {
    const role = getUserRoleFromToken();
    if (role === "nutritionist") {
      setFoodSuggestionCount(0);
      try {
        const n = await fetchUnreadCountByTitle(NOTIFICATION_TITLE_PATIENT_HEALTH_UPLOAD);
        setCount(typeof n === "number" && n >= 0 ? n : 0);
      } catch {
        setCount(0);
      }
      return;
    }
    if (role === "patient") {
      try {
        const [reviewN, foodN] = await Promise.all([
          fetchUnreadCountByTitle(NOTIFICATION_TITLE_REVIEW),
          fetchUnreadCountByTitle(NOTIFICATION_TITLE_FOOD_SUGGESTION),
        ]);
        setCount(typeof reviewN === "number" && reviewN >= 0 ? reviewN : 0);
        setFoodSuggestionCount(typeof foodN === "number" && foodN >= 0 ? foodN : 0);
      } catch {
        setCount(0);
        setFoodSuggestionCount(0);
      }
      return;
    }
    setCount(0);
    setFoodSuggestionCount(0);
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
    window.addEventListener(SUGGESTED_FOOD_UNREAD_REFRESH_EVENT, handler);
    return () => window.removeEventListener(SUGGESTED_FOOD_UNREAD_REFRESH_EVENT, handler);
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT, handler);
  }, [load]);

  return { count, foodSuggestionCount, refetch: load };
}
