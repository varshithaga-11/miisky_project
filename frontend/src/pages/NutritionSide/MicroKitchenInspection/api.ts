import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { MicroKitchenProfile } from "../../AdminSide/MicroKitchenInformation/api";

export type { MicroKitchenProfile };

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

export const getMicroKitchenById = async (id: number): Promise<MicroKitchenProfile> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

/** Inspection rows for a kitchen (nutritionist access after backend allows role). */
export const getMicroKitchenInspectionsForKitchen = async (microKitchenId: number) => {
  const url = createApiUrl(`api/microkitcheninspection/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 100, page: 1 },
  });
  const d = response.data;
  return Array.isArray(d) ? d : (d.results ?? []);
};

export const updateMicroKitchenStatus = async (id: number, status: string): Promise<MicroKitchenProfile> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
  return response.data;
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
