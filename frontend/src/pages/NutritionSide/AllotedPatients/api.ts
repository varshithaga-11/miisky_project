import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export type AllotedPatient = {
  mapping_id: number;
  assigned_on: string;
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    email: string;
    mobile?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    country?: string | null;
    is_patient_mapped?: boolean;
  };
  questionnaire: any | null;
};

export const getMyAllotedPatients = async (): Promise<AllotedPatient[]> => {
  const url = createApiUrl("api/usernutritionistmapping/my-patients/");
  const response = await axios.get<AllotedPatient[]>(url, { headers: await getAuthHeaders() });
  return response.data;
};

