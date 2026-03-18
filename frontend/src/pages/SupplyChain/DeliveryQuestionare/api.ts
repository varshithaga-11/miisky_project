import axios from "axios";
import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";

export type DeliveryProfile = {
  id?: number;
  user?: number;
  vehicle_type?: "bike" | "scooter" | "car" | "van" | "other" | null;
  vehicle_details?: string | null;
  register_number?: string | null;
  license_number?: string | null;
  license_copy?: File | string | null;
  rc_copy?: File | string | null;
  insurance_copy?: File | string | null;
  available_slots?: any;
};

const toFormData = (data: Partial<DeliveryProfile>) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v instanceof File) fd.append(k, v);
    else fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  });
  return fd;
};

export const getMyDeliveryProfile = async (): Promise<DeliveryProfile> => {
  const url = createApiUrl("api/deliveryprofile/me/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const saveMyDeliveryProfile = async (data: Partial<DeliveryProfile>): Promise<DeliveryProfile> => {
  const url = createApiUrl("api/deliveryprofile/me/");
  const hasFile = data.license_copy instanceof File || data.rc_copy instanceof File || data.insurance_copy instanceof File;
  const payload = hasFile ? toFormData(data) : data;
  const headers = hasFile ? await getAuthHeadersFile() : await getAuthHeaders();
  const response = await axios.put(url, payload as any, { headers });
  return response.data;
};

