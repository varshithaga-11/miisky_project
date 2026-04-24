import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { SupplyChainLeave } from "../../SupplyChain/api";
import type { OrderDatePeriod } from "../../NonPatient/orderapi";

export type PaginatedTeamLeaves = {
  results: SupplyChainLeave[];
  count: number;
  totalPages?: number;
  currentPage?: number;
};

/** Micro kitchen: planned leave rows for delivery team members (same API as supply-chain-leave with filters). */
export const fetchMicroKitchenTeamLeaves = async (
  page = 1,
  limit = 10,
  search?: string,
  period: OrderDatePeriod | string = "this_month",
  kitchenHandlingStatus: KitchenHandlingStatus | "all" = "all",
  customRangeStart?: string,
  customRangeEnd?: string,
  deliveryPersonId?: number | string
): Promise<PaginatedTeamLeaves> => {
  let url = createApiUrl(`api/supply-chain-leave/?page=${page}&limit=${limit}`);
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (deliveryPersonId) url += `&delivery_person=${encodeURIComponent(deliveryPersonId)}`;
  if (kitchenHandlingStatus && kitchenHandlingStatus !== "all") {
    url += `&kitchen_handling_status=${encodeURIComponent(kitchenHandlingStatus)}`;
  }
  if (period && period !== "all") {
    url += `&period=${encodeURIComponent(period)}`;
    if (period === "custom_range" && customRangeStart && customRangeEnd) {
      url += `&start_date=${encodeURIComponent(customRangeStart)}&end_date=${encodeURIComponent(customRangeEnd)}`;
    }
  }
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const d = res.data;
  if (Array.isArray(d)) {
    return { results: d, count: d.length, totalPages: 1, currentPage: 1 };
  }
  return {
    results: d?.results ?? [],
    count: d?.count ?? 0,
    totalPages: d?.total_pages ?? 1,
    currentPage: d?.current_page ?? page,
  };
};

/** Row shape matches KitchenMealDeliverySerializer (api/mealdeliveryassignment/). */
export type LeaveImpactedDeliveryRow = {
  id: number;
  user_meal: number;
  status: string;
  scheduled_date: string;
  delivery_person: number | null;
  delivery_person_details?: { id: number; first_name: string; last_name: string; username?: string };
  delivery_slot: number | null;
  delivery_slot_details?: { id: number; name: string; start_time: string | null; end_time: string | null };
  user_meal_details?: {
    id: number;
    meal_date: string;
    meal_type?: string | null;
    patient_name: string;
    food_name?: string | null;
    food_details?: { name?: string } | null;
  };
  reassignment_reason?: string | null;
};

/** GET .../supply-chain-leave/:id/meal-allotment-check/ — micro kitchen only */
export type MealAllotmentCheckResponse = {
  leave_id: number;
  delivery_user_id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
  has_meals_allotted: boolean;
  total_meal_deliveries: number;
  outstanding_deliveries: number;
  by_date: { date: string; count: number }[];
  by_status: Record<string, number>;
  /** Up to 400 delivery rows for this leave window + person (for reassign UI). */
  deliveries: LeaveImpactedDeliveryRow[];
  partial_day_note: string | null;
};

export const fetchMealAllotmentCheckForLeave = async (
  leaveId: number
): Promise<MealAllotmentCheckResponse> => {
  const url = createApiUrl(`api/supply-chain-leave/${leaveId}/meal-allotment-check/`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data;
};

export type KitchenHandlingStatus = "not_started" | "in_progress" | "complete";

export const patchKitchenLeaveHandlingStatus = async (
  leaveId: number,
  kitchen_handling_status: KitchenHandlingStatus
) => {
  const url = createApiUrl(`api/supply-chain-leave/${leaveId}/`);
  const res = await axios.patch(
    url,
    { kitchen_handling_status },
    { headers: await getAuthHeaders() }
  );
  return res.data;
};
