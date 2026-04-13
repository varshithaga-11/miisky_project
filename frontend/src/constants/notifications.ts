/** Must match backend `NOTIFICATION_CATEGORY_PATIENT_HEALTH_REPORT_UPLOAD`. */
export const NOTIFICATION_CATEGORY_PATIENT_HEALTH_REPORT = "patient_health_report_upload";

/** Must match backend `NOTIFICATION_CATEGORY_NUTRITIONIST_REVIEW_HEALTH_REPORT`. */
export const NOTIFICATION_CATEGORY_NUTRITIONIST_REVIEW_HEALTH_REPORT =
  "nutritionist_review_health_report";

export const HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT = "miisky:healthReportUploadUnreadRefresh";

export function dispatchHealthReportUploadUnreadRefresh(): void {
  window.dispatchEvent(new CustomEvent(HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT));
}

/** Patient sidebar: refresh unread count after review notifications are cleared or when notified elsewhere. */
export const HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT = "miisky:healthReportReviewUnreadRefresh";

export function dispatchHealthReportReviewUnreadRefresh(): void {
  window.dispatchEvent(new CustomEvent(HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT));
}

/** Refresh sidebar notification badges (health reports, etc.) after list page mark-as-read. */
export const SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT = "miisky:sidebarNotificationBadgesRefresh";

export function dispatchSidebarNotificationBadgesRefresh(): void {
  window.dispatchEvent(new CustomEvent(SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT));
}
