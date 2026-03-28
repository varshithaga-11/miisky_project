import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type MicroKitchenProfile = {
  id: number;
  brand_name: string | null;
  kitchen_code: string | null;
  is_verified: boolean;
  user: number;
  user_details: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
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
  results: MicroKitchenProfile[];
  total_pages: number;
};

export const getMicroKitchenList = async (page = 1, search = "", status?: string): Promise<MicroKitchenListResponse> => {
  let url = createApiUrl(`api/microkitchenprofile/?page=${page}&search=${search}`);
  if (status && status !== 'all') {
    url += `&status=${status}`;
  }
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

export const getMicroKitchenPatients = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-patients/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 50, page: 1 },
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

export const getMicroKitchenInspections = async (microKitchenId: number) => {
  const url = createApiUrl(`api/microkitcheninspection/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 20, page: 1 },
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

export const getMicroKitchenDailyMealsNoPagination = async (microKitchenId: number) => {
  const url = createApiUrl(`api/admin-microkitchen-meals-nopaginate/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId },
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
