import { 
  getWebsiteInquiries, 
  getWebsiteInquiryById, 
  createWebsiteInquiry, 
  updateWebsiteInquiry, 
  deleteWebsiteInquiry 
} from "../../../utils/api";

export interface WebsiteInquiry {
  id?: number;
  inquiry_type: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  service_interested?: string;
  preferred_date?: string;
  message: string;
  status: string;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const getWebsiteInquiryList = (page = 1, pageSize = 10, search = "") =>
  getWebsiteInquiries({ page, pageSize, search }).then(res => res.data);

export const getWebsiteInquiry = (id: number) =>
  getWebsiteInquiryById(id).then(res => res.data);

export const createInquiry = (data: Partial<WebsiteInquiry>) =>
  createWebsiteInquiry(data).then(res => res.data);

export const updateInquiry = (id: number, data: Partial<WebsiteInquiry>) =>
  updateWebsiteInquiry(id, data).then(res => res.data);

export const deleteInquiry = (id: number) =>
  deleteWebsiteInquiry(id);
