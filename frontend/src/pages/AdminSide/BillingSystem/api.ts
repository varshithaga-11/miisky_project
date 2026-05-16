import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface PlanWalletCredit {
  id: number;
  user_diet_plan: number;
  credit_type: string;
  amount: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  notes: string | null;
}

export interface BillingCycleInvoice {
  id: number;
  user_diet_plan: number;
  period_from: string;
  period_to: string;
  grand_total: string;
  deposit_applied: string;
  amount_due: string;
  status: string;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
}

export const getWalletCredits = async (planId: number): Promise<PlanWalletCredit[]> => {
  const url = createApiUrl(`api/plan-wallet-credits/?user_diet_plan=${planId}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const getInvoices = async (planId: number): Promise<BillingCycleInvoice[]> => {
  const url = createApiUrl(`api/billing-cycle-invoices/?user_diet_plan=${planId}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const createWalletCredit = async (data: any): Promise<PlanWalletCredit> => {
  const url = createApiUrl(`api/plan-wallet-credits/`);
  const response = await axios.post(url, data, { headers: await getAuthHeaders() });
  return response.data;
};

export const settleInvoice = async (invoiceId: number): Promise<BillingCycleInvoice> => {
  const url = createApiUrl(`api/billing-cycle-invoices/${invoiceId}/settle/`);
  const response = await axios.post(url, {}, { headers: await getAuthHeaders() });
  return response.data;
};
