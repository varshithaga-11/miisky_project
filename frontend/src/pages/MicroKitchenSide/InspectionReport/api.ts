import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type MicroKitchenInspection = {
  id: number;
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

  external_cleanliness_media?: string;
  interior_cleanliness_media?: string;
  kitchen_platform_adequacy_media?: string;
  kitchen_platform_neatness_media?: string;
  safety_media?: string;
  pure_water_media?: string;
  storage_facilities_media?: string;
  packing_space_media?: string;
  kitchen_size_media?: string;
  discussion_with_chef_media?: string;
  other_observations_media?: string;
  support_staff_media?: string;

  notes?: string;
  recommendation?: string;
  overall_score?: number;
};

export interface InspectionResponse {
    results: MicroKitchenInspection[];
    count: number;
}

export const getMyInspectionReports = async (): Promise<InspectionResponse> => {
    const url = createApiUrl(`api/microkitcheninspection/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};
