import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type PayableTrackerType = "all" | "nutritionist" | "kitchen";

export interface PayableTrackerRow {
  id: number;
  payout_type: string;
  recipient_label: string;
  patient_name: string | null;
  plan_title: string | null;
  period_from: string | null;
  period_to: string | null;
  total_amount: string;
  paid_amount: string;
  remaining_amount: number | string;
  shared_percentage: string;
  status: string;
}

export interface PayoutTransactionRow {
  id: number;
  tracker: number;
  payout_type: string;
  recipient_label: string;
  patient_name: string | null;
  plan_title: string | null;
  amount_paid: string;
  payout_date: string | null;
  payment_method: string | null;
  transaction_reference: string | null;
  note: string | null;
  paid_on: string;
  paid_by_display: string | null;
  payment_screenshot_url: string | null;
}

export interface PaginatedTransactions {
  count: number;
  results: PayoutTransactionRow[];
  current_page: number;
  total_pages: number;
}

export interface PatientTrackersRow {
  id: number;
  patient_name: string;
  trackers: PayableTrackerRow[];
}

export interface PatientPayoutSummaryRow {
  id: number;
  patient_name: string;
  plan_title: string | null;
  payable_lines: number;
  total_remaining: string;
  plan_total_amount: string;
}

export interface PaginatedPatientTrackers {
  count: number;
  results: PatientTrackersRow[];
  total_pages: number;
}

export interface PaginatedPatientSummaries {
  count: number;
  results: PatientPayoutSummaryRow[];
  total_pages: number;
}

export async function fetchPayoutPatientSummaries(
  page = 1,
  limit = 15,
  search = ""
): Promise<PaginatedPatientSummaries> {
  const q = search.trim();
  const searchPart = q ? `&search=${encodeURIComponent(q)}` : "";
  const url = createApiUrl(
    `api/admin/plan-payout-patients/?page=${page}&limit=${limit}&include_trackers=0${searchPart}`
  );
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data as PaginatedPatientSummaries;
}

export async function fetchPayoutPatientDetails(patientId: number, search = ""): Promise<PatientTrackersRow | null> {
  const q = search.trim();
  const searchPart = q ? `&search=${encodeURIComponent(q)}` : "";
  const url = createApiUrl(
    `api/admin/plan-payout-patients/?patient_id=${patientId}&page=1&limit=1&include_trackers=1${searchPart}`
  );
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data as PaginatedPatientTrackers;
  return data.results?.[0] ?? null;
}

export async function fetchPayableTrackers(type: PayableTrackerType = "all"): Promise<PayableTrackerRow[]> {
  const params = type === "all" ? "" : `?type=${type}`;
  const url = createApiUrl(`api/admin/plan-payout-trackers/${params}`);
  const res = await axios.get<PayableTrackerRow[]>(url, { headers: await getAuthHeaders() });
  return res.data;
}

export async function fetchPayoutTransactions(page = 1, limit = 15): Promise<PaginatedTransactions> {
  const url = createApiUrl(`api/admin/plan-payout-transactions/?page=${page}&limit=${limit}`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data as PaginatedTransactions;
}

export async function fetchTrackerTransactions(trackerId: number): Promise<PayoutTransactionRow[]> {
  const url = createApiUrl(`api/admin/plan-payout-transactions/?tracker=${trackerId}&limit=100`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data.results || [];
}

export async function createPayoutTransaction(payload: {
  tracker: number;
  amount_paid: string;
  payout_date?: string;
  payment_method: string;
  transaction_reference?: string;
  note?: string;
  payment_screenshot?: File | null;
}): Promise<PayoutTransactionRow> {
  const url = createApiUrl("api/admin/plan-payout-transactions/");
  const form = new FormData();
  form.append("tracker", String(payload.tracker));
  form.append("amount_paid", payload.amount_paid);
  if (payload.payout_date) form.append("payout_date", payload.payout_date);
  form.append("payment_method", payload.payment_method);
  if (payload.transaction_reference) form.append("transaction_reference", payload.transaction_reference);
  if (payload.note) form.append("note", payload.note);
  if (payload.payment_screenshot) form.append("payment_screenshot", payload.payment_screenshot);

  const auth = (await getAuthHeaders()) as Record<string, string>;
  const { "Content-Type": _ct, ...headers } = auth;
  const res = await axios.post<PayoutTransactionRow>(url, form, { headers });
  return res.data;
}
