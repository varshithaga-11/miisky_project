import axios from "axios";
import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";

export type MicroKitchenProfile = {
  id?: number;
  user?: number;
  brand_name?: string;
  kitchen_code?: string;
  fssai_no?: string;
  fssai_cert?: File | string | null;
  pan_no?: string;
  gst_no?: string | null;
  bank_name?: string | null;
  acc_no?: string | null;
  ifsc_code?: string | null;
  kitchen_area?: number | null;
  platform_area?: number | null;
  water_source?: string | null;
  purification_type?: "ro" | "uv" | "ionized" | "none" | null;
  no_of_water_taps?: number | null;
  has_pets?: boolean;
  pet_details?: string | null;
  has_pests?: boolean;
  pest_details?: string | null;
  pest_control_frequency?: "monthly" | "quarterly" | "half_yearly" | "annually" | null;
  has_hobs?: boolean;
  has_refrigerator?: boolean;
  has_mixer?: boolean;
  has_grinder?: boolean;
  has_blender?: boolean;
  other_equipment?: string | null;
  cuisine_type?: string | null;
  meal_type?: string | null;
  lpg_cylinders?: number | null;
  no_of_staff?: number | null;
  time_available?: string | null;
  about_you?: string | null;
  passion_for_cooking?: string | null;
  health_info?: string | null;
  constraints?: string | null;
  kitchen_video_url?: string | null;
  photo_exterior?: File | string | null;
  photo_entrance?: File | string | null;
  photo_kitchen?: File | string | null;
  photo_platform?: File | string | null;
  latitude?: number | null;
  longitude?: number | null;
  user_details?: { address?: string; city?: string; state?: string; country?: string };
  is_verified?: boolean;
};

const fileKeys = ["fssai_cert", "photo_exterior", "photo_entrance", "photo_kitchen", "photo_platform"];

const toFormData = (data: Partial<MicroKitchenProfile>) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v instanceof File) {
      fd.append(k, v);
    } else if (fileKeys.includes(k) && typeof v === "string") {
      // Skip already uploaded file URLs
      return;
    } else {
      fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }
  });
  return fd;
};

export const getMyMicroKitchenProfile = async (): Promise<MicroKitchenProfile> => {
  const url = createApiUrl("api/microkitchenprofile/me/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const saveMyMicroKitchenProfile = async (data: Partial<MicroKitchenProfile>): Promise<MicroKitchenProfile> => {
  const url = createApiUrl("api/microkitchenprofile/me/");
  
  // Clean file fields that are currently URLs
  const hasFile = fileKeys.some(k => (data as any)[k] instanceof File);
  
  let payload: any = { ...data };
  if (!hasFile) {
    fileKeys.forEach(k => {
      if (typeof payload[k] === "string") delete payload[k];
    });
  }

  const finalPayload = hasFile ? toFormData(data) : payload;
  const headers = hasFile ? await getAuthHeadersFile() : await getAuthHeaders();
  
  const response = await axios.patch(url, finalPayload as any, { headers });
  return response.data;
};

