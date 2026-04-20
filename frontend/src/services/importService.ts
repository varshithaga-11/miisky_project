import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../access/access";

export interface ImportResponse {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  data?: any[];
  errors: any[];
}

/**
 * Service to handle file imports for various modules and submenus.
 */
export const importFile = async (
  module: string,
  submenu: string,
  file: File,
  action: 'analyse' | 'submit' = 'analyse'
): Promise<ImportResponse> => {
  const url = createApiUrl(`api/import/${module}/${submenu}/`);
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("action", action);

  const response = await axios.post<ImportResponse>(url, formData, {
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Service to fetch template file for a specific module/submenu.
 */
export const downloadTemplate = async (
  module: string,
  submenu: string
): Promise<void> => {
  const requestTemplate = async (submenuSlug: string) => {
    const url = createApiUrl(`api/import/${module}/${submenuSlug}/template/`);
    return axios.get(url, {
      headers: await getAuthHeaders(),
      responseType: "blob",
    });
  };

  try {
    let usedSubmenu = submenu;
    let response;

    try {
      response = await requestTemplate(submenu);
    } catch (error: any) {
      // Backward compatibility for deployments expecting no-hyphen submenu keys.
      if (submenu.includes("-")) {
        const legacySubmenu = submenu.replace(/-/g, "");
        response = await requestTemplate(legacySubmenu);
        usedSubmenu = legacySubmenu;
      } else {
        throw error;
      }
    }

    const blob = new Blob([response.data], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `${usedSubmenu}_template.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error: any) {
    console.error("Template download error detail:", error.response || error);
    throw error;
  }
};
