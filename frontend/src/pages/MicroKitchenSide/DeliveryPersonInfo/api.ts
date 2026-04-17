import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type KitchenDeliveryProfile = {
  id: number;
  user: number | null;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    mobile?: string | null;
    username?: string | null;
  } | null;
  vehicle_type?: string | null;
  other_vehicle_name?: string | null;
  vehicle_details?: string | null;
  register_number?: string | null;
  license_number?: string | null;
  license_copy?: string | null;
  rc_copy?: string | null;
  insurance_copy?: string | null;
  aadhar_number?: string | null;
  aadhar_image?: string | null;
  pan_number?: string | null;
  pan_image?: string | null;
  puc_image?: string | null;
  is_verified?: boolean;
  verified_by?: number | null;
  verified_on?: string | null;
  verified_by_details?: { id: number; first_name: string; last_name: string } | null;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  account_holder_name?: string | null;
  bank_name?: string | null;
  available_slots?: string | null;
};

export type PaginatedKitchenProfiles = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: KitchenDeliveryProfile[];
};

export const fetchKitchenDeliveryProfiles = async (
  page = 1,
  limit = 10
): Promise<PaginatedKitchenProfiles> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const url = createApiUrl(`api/deliveryprofile/kitchen-delivery-profiles/?${params.toString()}`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data;
};

export const verifyDeliveryProfile = async (profileId: number): Promise<KitchenDeliveryProfile> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/verify/`);
  const res = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return res.data;
};

// ─── Extended API for delivery person detail modal ────────────────────────────

export type DeliveryPersonOrder = {
  id: number;
  status: string;
  order_type: string;
  created_at: string;
  grand_total?: string | null;
  delivery_charge?: string | null;
  delivery_person?: number | null;
  customer_display?: string | null;
  micro_kitchen_details?: { brand_name?: string } | null;
};

export type PaginatedDeliveryPersonOrders = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonOrder[];
};

export const fetchDeliveryPersonOrders = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonOrders> => {
  const url = createApiUrl(`api/order/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { delivery_person: userId, page, limit },
  });
  const d = res.data;
  return {
    count: d?.count ?? 0,
    current_page: d?.current_page ?? page,
    total_pages: d?.total_pages ?? 1,
    results: Array.isArray(d) ? d : (d?.results ?? []),
  };
};

export type DeliveryPersonPayment = {
  id: number;
  order_id: number;
  order_status: string;
  order_type: string;
  order_created_at: string;
  customer_display: string;
  food_subtotal: string;
  delivery_charge: string;
  grand_total: string;
  platform_percent: string;
  kitchen_percent: string;
  platform_amount: string;
  kitchen_amount: string;
  created_at: string;
};

export type PaginatedDeliveryPersonPayments = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonPayment[];
};

export const fetchDeliveryPersonPayments = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonPayments> => {
  const url = createApiUrl(`api/microkitchen/order-payment-snapshots/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { delivery_person: userId, page, limit },
  });
  const d = res.data;
  return {
    count: d?.count ?? 0,
    current_page: d?.current_page ?? page,
    total_pages: d?.total_pages ?? 1,
    results: Array.isArray(d) ? d : (d?.results ?? []),
  };
};

export type DeliveryPersonLeave = {
  id: number;
  user: number;
  user_details?: { id: number; first_name: string; last_name: string; username?: string } | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
  kitchen_handling_status?: string | null;
};

export type PaginatedDeliveryPersonLeaves = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonLeave[];
};

export const fetchDeliveryPersonLeaves = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonLeaves> => {
  const url = createApiUrl(`api/supply-chain-leave/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: userId, page, limit },
  });
  const d = res.data;
  return {
    count: d?.count ?? 0,
    current_page: d?.current_page ?? page,
    total_pages: d?.total_pages ?? 1,
    results: Array.isArray(d) ? d : (d?.results ?? []),
  };
};

export type DeliveryPersonReview = {
  id: number;
  feedback_type: string;
  rating?: number | null;
  review?: string | null;
  issue_type?: string | null;
  description?: string | null;
  created_at: string;
  reported_by_details?: { id: number; first_name: string; last_name: string } | null;
  order_details?: { id: number; status: string; order_type: string } | null;
  user_meal_details?: { id: number; meal_date: string; status: string } | null;
};

export type PaginatedDeliveryPersonReviews = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonReview[];
};

export const fetchDeliveryPersonReviews = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonReviews> => {
  const url = createApiUrl(`api/microkitchen/delivery-feedback-list/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { delivery_person: userId, feedback_type: "rating", page, limit },
  });
  const d = res.data;
  return {
    count: d?.count ?? 0,
    current_page: d?.current_page ?? page,
    total_pages: d?.total_pages ?? 1,
    results: Array.isArray(d) ? d : (d?.results ?? []),
  };
};

export const fetchDeliveryPersonIssues = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonReviews> => {
  const url = createApiUrl(`api/microkitchen/delivery-feedback-list/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { delivery_person: userId, feedback_type: "issue", page, limit },
  });
  const d = res.data;
  return {
    count: d?.count ?? 0,
    current_page: d?.current_page ?? page,
    total_pages: d?.total_pages ?? 1,
    results: Array.isArray(d) ? d : (d?.results ?? []),
  };
};

export type DeliveryPersonMealAssignment = {
  id: number;
  user_meal: number;
  status: string;
  scheduled_date: string;
  reassignment_reason?: string | null;
  user_meal_details?: {
    id: number;
    meal_date: string;
    meal_type?: string | null;
    patient_name: string;
    food_name?: string | null;
  } | null;
  delivery_slot?: number | null;
  delivery_slot_details?: { id: number; name: string; start_time?: string | null; end_time?: string | null } | null;
};

export type PaginatedMealAssignments = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonMealAssignment[];
};

export const fetchDeliveryPersonMealAssignments = async (
  userId: number,
  page = 1,
  limit = 10
): Promise<PaginatedMealAssignments> => {
  const url = createApiUrl(`api/mealdeliveryassignment/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { delivery_person: userId, page, limit },
  });
  const d = res.data;
  return {
    count: d?.count ?? 0,
    current_page: d?.current_page ?? page,
    total_pages: d?.total_pages ?? 1,
    results: Array.isArray(d) ? d : (d?.results ?? []),
  };
};
