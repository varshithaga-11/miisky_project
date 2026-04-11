import type { AppRole } from "./auth";
import { getUserRoleFromToken } from "./auth";

/**
 * Full notifications page URL for the current app area (matches MasterSidebar routes).
 */
export function getNotificationsListPath(role?: AppRole | null): string {
  const r = role ?? getUserRoleFromToken();
  if (!r) return "/patient/notifications";

  switch (r) {
    case "admin":
    case "food_buyer":
    case "master":
      return "/admin/notifications";
    case "nutritionist":
      return "/nutrition/notifications";
    case "micro_kitchen":
      return "/microkitchen/notifications";
    case "doctor":
      return "/doctor/notifications";
    case "supply_chain":
      return "/supplychain/notifications";
    case "patient":
    case "non_patient":
      return "/patient/notifications";
    default:
      // Sidebar falls back to admin menu for unknown roles (same as food_buyer).
      return "/admin/notifications";
  }
}
