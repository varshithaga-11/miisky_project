import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface WorkflowStep {
  id?: number;
  title: string;
  description: string;
  position: number;
  icon_class?: string;
  image?: string;
  is_active: boolean;
  created_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

export const createWorkflowStep = async (data: WorkflowStep) => {
  const url = createApiUrl("api/website/workflowstep/");
  const response = await axios.post(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const getWorkflowStepList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const url = createApiUrl("api/website/workflowstep/");
  const params: any = { page, limit };
  if (search) params.search = search;

  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
};

export const getWorkflowStepById = async (id: number) => {
  const url = createApiUrl(`api/website/workflowstep/${id}/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const updateWorkflowStep = async (id: number, data: Partial<WorkflowStep>) => {
  const url = createApiUrl(`api/website/workflowstep/${id}/`);
  const response = await axios.patch(url, data, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};

export const deleteWorkflowStep = async (id: number) => {
  const url = createApiUrl(`api/website/workflowstep/${id}/`);
  await axios.delete(url, {
    headers: await getAuthHeaders(),
  });
};
