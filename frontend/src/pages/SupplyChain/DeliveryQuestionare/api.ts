import axios from "axios";
import { createApiUrl, getAuthHeaders, getAuthHeadersFile } from "../../../access/access";

export type DeliveryProfile = {
  id?: number;
  user?: number;
  vehicle_type?: "bike" | "scooter" | "car" | "van" | "other" | null;
  other_vehicle_name?: string | null;
  vehicle_details?: string | null;
  register_number?: string | null;
  license_number?: string | null;
  license_copy?: File | string | null;
  rc_copy?: File | string | null;
  insurance_copy?: File | string | null;
  aadhar_number?: string | null;
  aadhar_image?: File | string | null;
  pan_number?: string | null;
  pan_image?: File | string | null;
  puc_image?: File | string | null;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  account_holder_name?: string | null;
  bank_name?: string | null;
  available_slots?: string | null;
  is_verified?: boolean;
  verified_on?: string | null;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    mobile?: string | null;
  };
  verified_by_details?: { id: number; first_name: string; last_name: string } | null;
};

const FILE_KEYS: (keyof DeliveryProfile)[] = [
  "license_copy",
  "rc_copy",
  "insurance_copy",
  "aadhar_image",
  "pan_image",
  "puc_image",
];

const toFormData = (data: Partial<DeliveryProfile>) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (FILE_KEYS.includes(k as keyof DeliveryProfile) && v instanceof File) {
      fd.append(k, v);
      return;
    }
    if (FILE_KEYS.includes(k as keyof DeliveryProfile) && typeof v === "string") {
      return;
    }
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
  const hasFile = FILE_KEYS.some((k) => data[k] instanceof File);
  const normalized: Partial<DeliveryProfile> = {
    ...data,
    available_slots:
      typeof data.available_slots === "string"
        ? (data.available_slots.trim() || null)
        : null,
  };
  // For JSON updates (no new files), never send existing file URLs back to file fields.
  // DRF file fields treat these as invalid non-file submissions.
  if (!hasFile) {
    FILE_KEYS.forEach((k) => {
      if (typeof normalized[k] === "string") {
        delete normalized[k];
      }
    });
  }
  const payload = hasFile ? toFormData(normalized) : normalized;
  const headers = hasFile ? await getAuthHeadersFile() : await getAuthHeaders();
  const response = await axios.put(url, payload as any, { headers });
  return response.data;
};

/** Build absolute URL for a stored media path (API may return relative path). */
export const profileFileUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

/** Download an already-uploaded file (uses auth for protected media). */
export const downloadProfileFile = async (mediaPath: string, filenameHint?: string): Promise<void> => {
  const url = profileFileUrl(mediaPath);
  const h = await getAuthHeaders();
  const res = await axios.get(url, {
    responseType: "blob",
    headers: { Authorization: h.Authorization },
  });
  const name =
    filenameHint ||
    mediaPath.split("/").filter(Boolean).pop() ||
    "document";
  const blob = new Blob([res.data]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
};
