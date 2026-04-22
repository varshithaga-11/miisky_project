import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface UserDietPlanPayment {
  id: number;
  user: number;
  user_details: { id: number; first_name: string; last_name: string; email: string } | null;
  nutritionist: number;
  nutritionist_details: { id: number; first_name: string; last_name: string; email: string } | null;
  diet_plan: number;
  diet_plan_details: {
    id: number;
    title: string;
    code: string;
    final_amount: string;
    no_of_days: number | null;
  } | null;
  micro_kitchen: number | null;
  micro_kitchen_details: {
    id: number;
    brand_name: string;
    cuisine_type: string | null;
    time_available: string | null;
    status: string;
  } | null;
  status: string;
  payment_status: string;
  amount_paid: string | null;
  payment_screenshot: string | null;
  payment_uploaded_on: string | null;
  is_payment_verified: boolean;
  start_date: string | null;
  end_date: string | null;
  suggested_on: string;
  approved_on: string | null;
}

export const getAllPaymentPlans = async (params?: {
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}): Promise<UserDietPlanPayment[]> => {
  const search = new URLSearchParams();
  if (params?.status) search.append("status", params.status);
  if (params?.payment_status) search.append("payment_status", params.payment_status);
  if (params?.start_date) search.append("start_date", params.start_date);
  if (params?.end_date) search.append("end_date", params.end_date);
  if (params?.search) search.append("search", params.search);
  const query = search.toString();
  const url = createApiUrl(query ? `api/userdietplan/?${query}` : "api/userdietplan/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const data = response.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const verifyPayment = async (
  id: number,
  startDate?: string
): Promise<UserDietPlanPayment> => {
  const url = createApiUrl(`api/userdietplan/${id}/verify_payment/`);
  const response = await axios.post(
    url,
    startDate ? { start_date: startDate } : {},
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

export const rejectPayment = async (id: number): Promise<UserDietPlanPayment> => {
  const url = createApiUrl(`api/userdietplan/${id}/reject_payment/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};

export const stopPlan = async (id: number): Promise<UserDietPlanPayment> => {
  const url = createApiUrl(`api/userdietplan/${id}/stop-plan/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};

export const finishPlan = async (id: number): Promise<UserDietPlanPayment> => {
  const url = createApiUrl(`api/userdietplan/${id}/finish-plan/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateDietPlan = async (id: number, data: Partial<UserDietPlanPayment>): Promise<UserDietPlanPayment> => {
  const url = createApiUrl(`api/userdietplan/${id}/`);
  const response = await axios.patch(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

const parseFilenameFromDisposition = (contentDisposition?: string | null): string | null => {
  if (!contentDisposition) return null;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].trim());

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (filenameMatch?.[1]) return filenameMatch[1].trim();
  return null;
};

const sanitizeFilenamePart = (value?: string | null, fallback = "value"): string => {
  const cleaned = (value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || fallback;
};

export const buildInvoiceFilename = (patientName?: string | null, planName?: string | null): string => {
  const patientPart = sanitizeFilenamePart(patientName, "patient");
  const planPart = sanitizeFilenamePart(planName, "plan");
  return `${patientPart}_${planPart}.pdf`;
};

export const downloadInvoice = async (id: number, preferredFilename?: string): Promise<void> => {
  const url = createApiUrl(`api/userdietplan/${id}/download-invoice/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;

  const contentDisposition = response.headers?.["content-disposition"] as string | undefined;
  const fallbackName = preferredFilename || `invoice-${id}.pdf`;
  link.download = parseFilenameFromDisposition(contentDisposition) || fallbackName;

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
