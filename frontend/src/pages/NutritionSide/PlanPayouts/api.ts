import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

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

export interface PatientTrackersRow {
  id: number;
  patient_name: string;
  trackers: PayableTrackerRow[];
}

export interface PaginatedPatientTrackers {
  count: number;
  results: PatientTrackersRow[];
  total_pages: number;
}

export async function fetchNutritionistPayoutPatients(page = 1, limit = 15): Promise<PaginatedPatientTrackers> {
  const url = createApiUrl(`api/nutrition/plan-payouts/?page=${page}&limit=${limit}`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data as PaginatedPatientTrackers;
}

export async function fetchMicroKitchenPayoutPatients(page = 1, limit = 15): Promise<PaginatedPatientTrackers> {
  const url = createApiUrl(`api/microkitchen/plan-payouts/?page=${page}&limit=${limit}`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data as PaginatedPatientTrackers;
}

export async function fetchPartnerTrackerTransactions(trackerId: number): Promise<PayoutTransactionRow[]> {
  const url = createApiUrl(`api/partner/plan-payout-transactions/?tracker=${trackerId}&limit=100`);
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  return res.data.results || [];
}
