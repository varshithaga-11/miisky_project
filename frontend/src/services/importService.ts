import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../access/access";

export interface ImportResponse {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  errors: any[];
}

/**
 * Service to handle file imports for various modules and submenus.
 */
export const importFile = async (
  module: string,
  submenu: string,
  file: File
): Promise<ImportResponse> => {
  const url = createApiUrl(`api/import/${module}/${submenu}/`);
  
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<ImportResponse>(url, formData, {
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
