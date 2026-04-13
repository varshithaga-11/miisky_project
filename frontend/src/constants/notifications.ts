/** Must match backend NOTIFICATION_TITLE_PATIENT_HEALTH_UPLOAD */
export const NOTIFICATION_TITLE_PATIENT_HEALTH_UPLOAD = "New patient health document";

/** Must match backend NOTIFICATION_TITLE_REVIEW */
export const NOTIFICATION_TITLE_REVIEW = "Your health documents were reviewed";

/** Must match backend NOTIFICATION_TITLE_FOOD_SUGGESTION and PatientFoodRecommendationViewSet title string */
export const NOTIFICATION_TITLE_FOOD_SUGGESTION = "New food suggested by your nutritionist";

export const HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT = "miisky:healthReportUploadUnreadRefresh";

export function dispatchHealthReportUploadUnreadRefresh(): void {
  window.dispatchEvent(new CustomEvent(HEALTH_REPORT_UPLOAD_UNREAD_REFRESH_EVENT));
}

/** Patient sidebar: refresh after review notifications are cleared */
export const HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT = "miisky:healthReportReviewUnreadRefresh";

export function dispatchHealthReportReviewUnreadRefresh(): void {
  window.dispatchEvent(new CustomEvent(HEALTH_REPORT_REVIEW_UNREAD_REFRESH_EVENT));
}

export const SUGGESTED_FOOD_UNREAD_REFRESH_EVENT = "miisky:suggestedFoodUnreadRefresh";

export function dispatchSuggestedFoodUnreadRefresh(): void {
  window.dispatchEvent(new CustomEvent(SUGGESTED_FOOD_UNREAD_REFRESH_EVENT));
}

/** Refresh sidebar notification badges after list page mark-as-read */
export const SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT = "miisky:sidebarNotificationBadgesRefresh";

export function dispatchSidebarNotificationBadgesRefresh(): void {
  window.dispatchEvent(new CustomEvent(SIDEBAR_NOTIFICATION_BADGES_REFRESH_EVENT));
}
