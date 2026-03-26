import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface DashboardStats {
  hero_banners: number;
  blog_posts: number;
  blog_comments: {
    total: number;
    pending: number;
  };
  medical_devices: number;
  team_members: number;
  gallery_items: number;
  job_applications: {
    total: number;
    pending: number;
  };
  website_reports: {
    total: number;
    pending: number;
  };
  partners: number;
  patents: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const url = createApiUrl("api/website/dashboard-stats/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
};
