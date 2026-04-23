import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type MasterRow = {
  id: number;
  name: string;
  category?: string | null;
  sort_order?: number | null;
};

export type QuestionnaireQuestionSection = {
  key: string;
  title: string;
  questions: string[];
};

export type QuestionnaireQuestionListResponse = {
  title: string;
  total_questions: number;
  generated_on: string;
  sections: QuestionnaireQuestionSection[];
};

async function getJson<T>(path: string): Promise<T> {
  const url = createApiUrl(path);
  const response = await axios.get<T>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
}

function parseFilenameFromDisposition(contentDisposition: string | null | undefined): string | null {
  if (!contentDisposition) return null;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, "").trim());
    } catch {
      return utf8Match[1].replace(/["']/g, "").trim();
    }
  }
  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1]?.trim() || null;
}

export async function fetchAdminQuestionnaireQuestions(): Promise<QuestionnaireQuestionListResponse> {
  const url = createApiUrl("api/admin-questionnaire-questions/");
  const response = await axios.get<QuestionnaireQuestionListResponse>(url, {
    headers: await getAuthHeaders(),
  });
  return response.data;
}

export const fetchHealthConditionMasters = (): Promise<MasterRow[]> =>
  getJson<MasterRow[]>("api/health-condition-master/all/");

export const fetchSymptomMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/symptom-master/all/");

export const fetchAutoimmuneMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/autoimmune-master/all/");

export const fetchDeficiencyMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/deficiency-master/all/");

export const fetchDigestiveIssueMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/digestive-issue-master/all/");

export const fetchSkinIssueMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/skin-issue-master/all/");

export const fetchHabitMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/habit-master/all/");

export const fetchActivityMasters = (): Promise<Pick<MasterRow, "id" | "name">[]> =>
  getJson("api/activity-master/all/");

export async function downloadAdminQuestionnaireQuestions(format: "pdf" | "docx"): Promise<void> {
  const url = createApiUrl("api/admin-questionnaire-questions/download/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { format },
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type:
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const objectUrl = URL.createObjectURL(blob);
  const filenameFromHeader = parseFilenameFromDisposition(response.headers["content-disposition"]);
  const fallbackName = format === "pdf" ? "patient_questionnaire_questions.pdf" : "patient_questionnaire_questions.docx";

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filenameFromHeader || fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
