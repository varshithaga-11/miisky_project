import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { AllottedPlanPayoutPatientRow } from "../shared/AdminAllottedPlanPayoutsPanel";

export type MicroKitchenProfile = {
  id: number;
  brand_name: string | null;
  kitchen_code: string | null;
  is_verified: boolean;
  user: number;
  user_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    address: string;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  // Other fields from the model
  fssai_no: string | null;
  pan_no: string | null;
  gst_no: string | null;
  bank_name: string | null;
  acc_no: string | null;
  ifsc_code: string | null;
  kitchen_area: number | null;
  platform_area: number | null;
  water_source: string | null;
  cuisine_type: string | null;
  meal_type: string | null;
  lpg_cylinders: number | null;
  no_of_staff: number | null;
  time_available: string | null;
  purification_type: string | null;
  has_pets: boolean;
  pet_details: string | null;
  has_pests: boolean;
  pest_details: string | null;
  pest_control_frequency: string | null;
  has_hobs: boolean;
  has_refrigerator: boolean;
  has_mixer: boolean;
  has_grinder: boolean;
  has_blender: boolean;
  other_equipment: string | null;
  about_you: string | null;
  passion_for_cooking: string | null;
  health_info: string | null;
  constraints: string | null;
  photo_exterior: string | null;
  photo_entrance: string | null;
  photo_kitchen: string | null;
  photo_platform: string | null;
  fssai_cert: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'draft' | 'approved' | 'rejected';
};

export type MicroKitchenProfileSummary = {
  id: number;
  user: number;
  brand_name: string | null;
  kitchen_code: string | null;
  status: 'draft' | 'approved' | 'rejected';
  no_of_staff: number | null;
  lpg_cylinders: number | null;
  user_details: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

export type MicroKitchenInspection = {
  id?: number;
  micro_kitchen: number;
  inspector?: number;
  mc_code: string;
  inspection_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  external_cleanliness?: number;
  interior_cleanliness?: number;
  kitchen_platform_adequacy?: number;
  kitchen_platform_neatness?: number;
  safety?: number;
  pure_water?: number;
  storage_facilities?: number;
  packing_space?: number;
  kitchen_size?: number;
  discussion_with_chef?: number;
  other_observations?: number;
  support_staff?: number;

  external_cleanliness_media?: File | string | null;
  interior_cleanliness_media?: File | string | null;
  kitchen_platform_adequacy_media?: File | string | null;
  kitchen_platform_neatness_media?: File | string | null;
  safety_media?: File | string | null;
  pure_water_media?: File | string | null;
  storage_facilities_media?: File | string | null;
  packing_space_media?: File | string | null;
  kitchen_size_media?: File | string | null;
  discussion_with_chef_media?: File | string | null;
  other_observations_media?: File | string | null;
  support_staff_media?: File | string | null;

  notes?: string;
  recommendation?: string;
  overall_score?: number;
};

export type MicroKitchenListResponse = {
  count: number;
  next: number | null;
  previous: number | null;
  results: MicroKitchenProfileSummary[];
  total_pages: number;
};

export const getMicroKitchenList = async (
  page = 1,
  search = "",
  status?: string,
  filters: { city?: number; state?: number; country?: number } = {}
): Promise<MicroKitchenListResponse> => {
  const params: Record<string, any> = { page, search };
  if (status && status !== 'all') params.status = status;
  if (filters.city) params.city = filters.city;
  if (filters.state) params.state = filters.state;
  if (filters.country) params.country = filters.country;

  const url = createApiUrl(`api/microkitchenprofile/`);
  const response = await axios.get(url, { 
    headers: await getAuthHeaders(),
    params
  });
  return response.data;
};

export const getMicroKitchenDetail = async (id: number): Promise<MicroKitchenProfile> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateMicroKitchenStatus = async (id: number, status: string): Promise<MicroKitchenProfile> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteMicroKitchen = async (id: number): Promise<void> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};

export const saveMicroKitchenInspection = async (inspection: FormData): Promise<MicroKitchenInspection> => {
  const url = createApiUrl(`api/microkitcheninspection/`);
  const response = await axios.post(url, inspection, { 
    headers: {
      ...(await getAuthHeaders()),
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export type PaginatedResponse<T> = {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
};

export type MicroKitchenFoodRow = {
  id: number;
  micro_kitchen: number;
  food: number | null;
  is_available: boolean;
  price: number | string | null;
  preparation_time?: string | null;
  food_details?: { id?: number; name?: string; description?: string; image?: string | null } | null;
};

export type AdminMicroKitchenPatientCard = {
  id: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  nutritionist_effective_from?: string | null;
  distance_km?: number | null;
  patient_details?: {
    id: number;
    first_name?: string;
    last_name?: string;
  } | null;
  diet_plan_details?: {
    plan_name?: string;
  } | null;
  nutritionist_details?: {
    first_name?: string;
    last_name?: string;
  } | null;
  original_nutritionist_details?: {
    first_name?: string;
    last_name?: string;
  } | null;
  delivery_slots_details?: Array<{
    id: number;
    name: string;
  }>;
};

export const getMicroKitchenPatients = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<AdminMicroKitchenPatientCard>> => {
  const url = createApiUrl(`api/admin-microkitchen-patient-cards/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, page, limit },
  });
  return response.data;
};

export const getMicroKitchenPatientsNoPagination = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-patients-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data;
};

export const getMicroKitchenInspections = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/microkitcheninspection/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit, page },
  });
  return response.data;
};

export const getMicroKitchenInspectionsNoPagination = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-inspections-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data;
};

export const getMicroKitchenReviews = async (microKitchenId: number) => {
  const url = createApiUrl(`api/microkitchenrating/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 50, page: 1 },
  });
  return response.data;
};

export const getMicroKitchenReviewsNoPagination = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-reviews-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data;
};

export const getMicroKitchenDeliveryRatings = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-delivery-ratings-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data;
};

export const getMicroKitchenOrders = async (microKitchenId: number) => {
  const url = createApiUrl(`api/order/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 50, page: 1 },
  });
  return response.data;
};

export const getMicroKitchenOrdersNoPagination = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-orders-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data;
};

export const getMicroKitchenAvailableFoods = async (microKitchenId: number) => {
  const url = createApiUrl(`api/microkitchenfood/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 100, page: 1 },
  });
  return response.data;
};

export const getMicroKitchenAvailableFoodsNoPagination = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-foods-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data;
};

export const getMicroKitchenDailyMeals = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20,
  period?: string,
  startDate?: string,
  endDate?: string,
  month?: number,
  year?: number
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/admin-microkitchen-meals-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { 
      micro_kitchen: microKitchenId, 
      page,
      limit,
      month, 
      year, 
      start_date: startDate, 
      end_date: endDate, 
      period 
    },
  });
  return response.data;
};

export const getMicroKitchenDailyMealsNoPagination = async (
  microKitchenId: number,
  period?: string,
  startDate?: string,
  endDate?: string,
  month?: number,
  year?: number
) => {
  const url = createApiUrl(`api/admin-microkitchen-meals-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: {
      micro_kitchen: microKitchenId,
      month,
      year,
      start_date: startDate,
      end_date: endDate,
      period,
    },
  });
  return response.data ?? [];
};

// --- Paginated versions for Infinite Scroll ---

export const getMicroKitchenReviewsPaginated = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string,
  period?: string
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/microkitchenrating/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { 
      micro_kitchen: microKitchenId, 
      page, 
      limit, 
      start_date: startDate, 
      end_date: endDate, 
      period 
    },
  });
  return response.data;
};

export const getMicroKitchenOrdersPaginated = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string,
  period?: string
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/order/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { 
      micro_kitchen: microKitchenId, 
      page, 
      limit, 
      start_date: startDate, 
      end_date: endDate, 
      period 
    },
  });
  return response.data;
};

export const getMicroKitchenDeliveryFeedbackPaginated = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 10,
  feedbackType: string = "all"
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/admin-microkitchen-delivery-feedback-paginated/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, page, limit, feedback_type: feedbackType },
  });
  return response.data;
};

export const getAdminMicroKitchenOrdersPaginated = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/admin-microkitchen-order/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, page, limit, start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const getAdminMicroKitchenOrderDetail = async (orderId: number): Promise<any> => {
  const url = createApiUrl(`api/admin-microkitchen-order/${orderId}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getMicroKitchenFoodsPaginated = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<MicroKitchenFoodRow>> => {
  const url = createApiUrl(`api/microkitchenfood/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, page, limit },
  });
  return response.data;
};

export const getKitchenSupportTickets = async (
  kitchenUserId: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/supportticket/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { created_by: kitchenUserId, page, limit },
  });
  return response.data;
};

export const getMicroKitchenMealDeliveryAssignmentsPaginated = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<AdminKitchenMealDeliveryAssignment>> => {
  const url = createApiUrl(`api/admin-microkitchen-meal-delivery-assignments-paginated/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, page, limit },
  });
  return response.data;
};

export const getMicroKitchenPlannedLeavesPaginated = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<AdminKitchenPlannedLeave>> => {
  const url = createApiUrl(`api/admin-microkitchen-planned-leaves-paginated/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, page, limit },
  });
  return response.data;
};

export type DeliveryChargeSlabAdmin = {
  id: number;
  micro_kitchen: number;
  min_km: string;
  max_km: string;
  charge: string;
};

export type AdminKitchenTeamMember = {
  id: number;
  micro_kitchen: number;
  delivery_person: number;
  delivery_person_details?: {
    id: number;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
    mobile?: string;
  };
  role: "primary" | "backup" | "temporary";
  is_active: boolean;
  zone_name: string | null;
  pincode: string | null;
  assigned_on: string;
};

export type AdminKitchenDeliverySlot = {
  id: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  micro_kitchen: number | null;
};

export type AdminKitchenDeliveryUserSummary = {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
};

export type AdminKitchenGlobalAssignmentLog = {
  id: number;
  previous_delivery_person: number | null;
  previous_delivery_person_details?: AdminKitchenDeliveryUserSummary;
  new_delivery_person: number | null;
  new_delivery_person_details?: AdminKitchenDeliveryUserSummary;
  reason: string;
  notes: string | null;
  effective_from: string | null;
  changed_on: string;
  changed_by: number | null;
  changed_by_details?: AdminKitchenDeliveryUserSummary;
};

export type AdminKitchenGlobalAssignment = {
  id: number;
  user_diet_plan: number;
  user_diet_plan_details?: {
    id: number;
    status: string;
    start_date: string | null;
    end_date: string | null;
    diet_plan_name?: string | null;
  };
  patient_details?: AdminKitchenDeliveryUserSummary;
  delivery_person: number | null;
  delivery_person_details?: AdminKitchenDeliveryUserSummary;
  default_slot: number | null;
  default_slot_details?: AdminKitchenDeliverySlot;
  delivery_slots_details?: AdminKitchenDeliverySlot[];
  delivery_slot_ids?: number[];
  slot_delivery_assignments?: Array<{
    delivery_slot_id: number;
    delivery_slot_details?: AdminKitchenDeliverySlot;
    delivery_person_id: number | null;
    delivery_person_details?: AdminKitchenDeliveryUserSummary | null;
  }>;
  change_logs?: AdminKitchenGlobalAssignmentLog[];
  is_active: boolean;
  assigned_on: string;
  notes: string | null;
};

export type AdminKitchenMealDeliveryAssignment = {
  id: number;
  user_meal: number;
  user_meal_details?: {
    id: number;
    meal_date: string;
    meal_type: string | null;
    meal_type_details?: { name?: string } | null;
    patient_name: string;
    user_details?: {
      first_name: string;
      last_name: string;
      mobile?: string;
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
    };
    food_details?: { name?: string } | null;
    food_name?: string | null;
    micro_kitchen_details?: { brand_name?: string; address?: string } | null;
  };
  plan_delivery_assignment: number | null;
  delivery_person: number | null;
  delivery_person_details?: AdminKitchenDeliveryUserSummary;
  delivery_slot: number | null;
  delivery_slot_details?: AdminKitchenDeliverySlot;
  status: string;
  scheduled_date: string;
  scheduled_time: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  delivery_notes?: string | null;
  is_active: boolean;
  reassignment_reason: string | null;
};

export type AdminKitchenDeliveryProfile = {
  id: number;
  user?: number;
  user_details?: {
    id?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    mobile?: string;
  } | null;
  vehicle_type?: string | null;
  other_vehicle_name?: string | null;
  vehicle_details?: string | null;
  register_number?: string | null;
  license_number?: string | null;
  license_copy?: string | null;
  rc_copy?: string | null;
  insurance_copy?: string | null;
  puc_image?: string | null;
  aadhar_number?: string | null;
  aadhar_image?: string | null;
  pan_number?: string | null;
  pan_image?: string | null;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  account_holder_name?: string | null;
  bank_name?: string | null;
  available_slots?: string | null;
  is_verified?: boolean;
  verified_on?: string | null;
};

export type AdminKitchenPlannedLeave = {
  id: number;
  user: number;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
    mobile?: string;
  };
  leave_type: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  created_on?: string;
};

/** Admin: distance–charge slabs configured for this kitchen. */
export const getMicroKitchenDeliverySlabs = async (microKitchenId: number): Promise<DeliveryChargeSlabAdmin[]> => {
  const url = createApiUrl(`api/deliverychargeslab/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 200, page: 1 },
  });
  const d = response.data;
  if (Array.isArray(d)) return d;
  return d?.results ?? [];
};

export const getMicroKitchenDeliveryTeamNoPagination = async (
  microKitchenId: number
): Promise<AdminKitchenTeamMember[]> => {
  const url = createApiUrl(`api/admin-microkitchen-delivery-team-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data ?? [];
};

export const getMicroKitchenGlobalAssignmentsNoPagination = async (
  microKitchenId: number
): Promise<AdminKitchenGlobalAssignment[]> => {
  const url = createApiUrl(`api/admin-microkitchen-global-assignments-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data ?? [];
};

export const getMicroKitchenMealDeliveryAssignmentsNoPagination = async (
  microKitchenId: number
): Promise<AdminKitchenMealDeliveryAssignment[]> => {
  const url = createApiUrl(`api/admin-microkitchen-meal-delivery-assignments-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data ?? [];
};

export const getMicroKitchenDeliveryProfilesNoPagination = async (
  microKitchenId: number
): Promise<AdminKitchenDeliveryProfile[]> => {
  const url = createApiUrl(`api/admin-microkitchen-delivery-profiles-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data ?? [];
};

export const getMicroKitchenPlannedLeavesNoPagination = async (
  microKitchenId: number
): Promise<AdminKitchenPlannedLeave[]> => {
  const url = createApiUrl(`api/admin-microkitchen-planned-leaves-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data ?? [];
};

export const getMicroKitchenPayouts = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20,
  period?: string,
  startDate?: string,
  endDate?: string
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/admin-microkitchen-payouts-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { 
        micro_kitchen: microKitchenId, 
        page,
        limit,
        start_date: startDate, 
        end_date: endDate, 
        period 
    },
  });
  return response.data;
};

export const getMicroKitchenPayoutsNoPagination = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-payouts-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
  });
  return response.data ?? [];
};

/** Admin: order payment splits (snapshots) for this kitchen. */
export const getMicroKitchenOrderPaymentSnapshots = async (
  microKitchenId: number,
  page = 1,
  limit = 20,
  search = ""
): Promise<any> => {
  const url = createApiUrl(`api/microkitchen/order-payment-snapshots/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, page, limit, search },
  });
  return response.data;
};

/** Admin: execution list (all meals status) for a specific date. */
export const getMicroKitchenExecutionList = async (
  microKitchenId: number,
  page: number = 1,
  limit: number = 20,
  period?: string,
  startDate?: string,
  endDate?: string,
  mealDate?: string
): Promise<PaginatedResponse<any>> => {
  const url = createApiUrl(`api/usermeal/execution-list/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { 
        micro_kitchen: microKitchenId, 
        page,
        limit,
        meal_date: mealDate, 
        start_date: startDate, 
        end_date: endDate, 
        period 
    },
  });
  return response.data;
};

/** Admin hub: patients allotted to this kitchen (via diet plan), kitchen share payout lines only. */
export async function getMicroKitchenAllottedPlanPayouts(
  microKitchenId: number,
  search = ""
): Promise<AllottedPlanPayoutPatientRow[]> {
  const q = search.trim();
  const sp = q ? `&search=${encodeURIComponent(q)}` : "";
  const url = createApiUrl(
    `api/admin/microkitchen-allotted-plan-payouts/?microkitchen_id=${microKitchenId}${sp}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return (response.data?.results ?? []) as AllottedPlanPayoutPatientRow[];
}
