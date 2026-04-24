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
  customer_display?: string | null;
  micro_kitchen_brand?: string | null;
};

export type PaginatedDeliveryPersonOrders = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonOrder[];
};

export const fetchDeliveryPersonOrders = async (
  profileId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonOrders> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/orders/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return res.data;
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
  profileId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonPayments> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/payments/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return res.data;
};

export type DeliveryPersonLeave = {
  id: number;
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
  profileId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonLeaves> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/leaves/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return res.data;
};

export type DeliveryPersonReview = {
  id: number;
  feedback_type: string;
  rating?: number | null;
  review?: string | null;
  issue_type?: string | null;
  description?: string | null;
  created_at: string;
  reported_by_name?: string | null;
  order_id?: number | null;
  user_meal_id?: number | null;
};

export type PaginatedDeliveryPersonReviews = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonReview[];
};

export const fetchDeliveryPersonReviews = async (
  profileId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonReviews> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/reviews/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return res.data;
};

export const fetchDeliveryPersonIssues = async (
  profileId: number,
  page = 1,
  limit = 10
): Promise<PaginatedDeliveryPersonReviews> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/issues/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return res.data;
};

export type DeliveryPersonMealAssignment = {
  id: number;
  user_meal: number;
  status: string;
  meal_date: string;
  meal_type: string;
  patient_name: string;
  food_name: string;
  slot_name: string;
  slot_start: string;
  slot_end: string;
  reassignment_reason?: string | null;
};

export type PaginatedMealAssignments = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DeliveryPersonMealAssignment[];
};

export const fetchDeliveryPersonMealAssignments = async (
  profileId: number,
  page = 1,
  limit = 10,
  reassigned?: boolean
): Promise<PaginatedMealAssignments> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/meal_assignments/`);
  const params: any = { page, limit };
  if (reassigned) params.reassigned = "true";
  
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return res.data;
};

export type DietPlanDeliveryAssignment = {
  id: number;
  patient_name: string;
  diet_plan_name: string;
  start_date: string;
  end_date: string;
  default_slot_name: string;
  delivery_slots_details?: { id: number; name: string }[] | null;
};

export type PaginatedGlobalAssignments = {
  count: number;
  current_page: number;
  total_pages: number;
  results: DietPlanDeliveryAssignment[];
};

export const fetchDeliveryPersonGlobalAssignments = async (
  profileId: number,
  page = 1,
  limit = 10
): Promise<PaginatedGlobalAssignments> => {
  const url = createApiUrl(`api/deliveryprofile/${profileId}/global_assignments/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { page, limit },
  });
  return res.data;
};
