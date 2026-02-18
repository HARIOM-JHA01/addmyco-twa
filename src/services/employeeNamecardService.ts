import axios from "axios";
import {
  CompanyTemplate,
  ChamberTemplate,
  EmployeeNamecard,
  EmployeeNamecardFormData,
  CreateEmployeeNamecardResponse,
  GetEmployeeNamecardsResponse,
  GetTemplatesResponse,
  DeleteEmployeeNamecardResponse,
  UpdateEmployeeNamecardResponse,
  CompanyTemplateFormData,
  ChamberTemplateFormData,
  TemplateResponse,
  DeleteTemplateResponse,
} from "../types/employeeNamecard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (): string => {
  return localStorage.getItem("token") || "";
};

const getOperatorToken = (): string => {
  return localStorage.getItem("operatorToken") || "";
};

// Get company templates
export const getCompanyTemplates = async (
  isOperator: boolean = false,
): Promise<CompanyTemplate[]> => {
  try {
    const endpoint = isOperator
      ? `${API_BASE_URL}/enterprise/operator/company-templates`
      : `${API_BASE_URL}/company-templates`;

    const token = isOperator ? getOperatorToken() : getToken();

    const response = await axios.get<GetTemplatesResponse>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      return response.data.data as CompanyTemplate[];
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    console.error("Failed to fetch company templates:", error);
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to fetch company templates",
    );
  }
};

// Get chamber templates
export const getChamberTemplates = async (
  isOperator: boolean = false,
): Promise<ChamberTemplate[]> => {
  try {
    const endpoint = isOperator
      ? `${API_BASE_URL}/enterprise/operator/chamber-templates`
      : `${API_BASE_URL}/chamber-templates`;

    const token = isOperator ? getOperatorToken() : getToken();

    const response = await axios.get<GetTemplatesResponse>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      return response.data.data as ChamberTemplate[];
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    console.error("Failed to fetch chamber templates:", error);
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to fetch chamber templates",
    );
  }
};

// Create employee namecard
export const createEmployeeNamecard = async (
  formData: EmployeeNamecardFormData,
  fileImage?: File,
  fileVideo?: File,
  isOperator: boolean = false,
): Promise<EmployeeNamecard> => {
  try {
    const form = new FormData();

    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        form.append(key, value);
      }
    });

    // Add files
    if (fileImage) {
      form.append("file1", fileImage);
    }
    if (fileVideo) {
      form.append("file2", fileVideo);
    }

    const endpoint = isOperator
      ? `${API_BASE_URL}/enterprise/operator/employee-namecard`
      : `${API_BASE_URL}/employee-namecard`;

    const token = isOperator ? getOperatorToken() : getToken();

    const response = await axios.post<CreateEmployeeNamecardResponse>(
      endpoint,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    console.error("Failed to create employee namecard:", error);
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to create employee namecard",
    );
  }
};

// Get employee namecards
export const getEmployeeNamecards = async (
  isOperator: boolean = false,
): Promise<EmployeeNamecard[]> => {
  try {
    const endpoint = isOperator
      ? `${API_BASE_URL}/enterprise/operator/employee-namecards`
      : `${API_BASE_URL}/employee-namecards`;

    const token = isOperator ? getOperatorToken() : getToken();

    const response = await axios.get<GetEmployeeNamecardsResponse>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    console.error("Failed to fetch employee namecards:", error);
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to fetch employee namecards",
    );
  }
};

// Update employee namecard
export const updateEmployeeNamecard = async (
  namecardId: string,
  formData: Partial<EmployeeNamecardFormData>,
  fileImage?: File,
  fileVideo?: File,
  isOperator: boolean = false,
): Promise<EmployeeNamecard> => {
  try {
    const form = new FormData();

    // Add ID
    form.append("id", namecardId);

    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        form.append(key, value);
      }
    });

    // Add files
    if (fileImage) {
      form.append("file1", fileImage);
    }
    if (fileVideo) {
      form.append("file2", fileVideo);
    }

    const endpoint = isOperator
      ? `${API_BASE_URL}/enterprise/operator/update-employee-namecard`
      : `${API_BASE_URL}/update-employee-namecard`;

    const token = isOperator ? getOperatorToken() : getToken();

    const response = await axios.post<UpdateEmployeeNamecardResponse>(
      endpoint,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    console.error("Failed to update employee namecard:", error);
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to update employee namecard",
    );
  }
};

// Delete employee namecard
export const deleteEmployeeNamecard = async (
  namecardId: string,
  isOperator: boolean = false,
): Promise<void> => {
  try {
    const endpoint = isOperator
      ? `${API_BASE_URL}/enterprise/operator/employee-namecard/${namecardId}`
      : `${API_BASE_URL}/employee-namecard/${namecardId}`;

    const token = isOperator ? getOperatorToken() : getToken();

    const response = await axios.delete<DeleteEmployeeNamecardResponse>(
      endpoint,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    console.error("Failed to delete employee namecard:", error);
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to delete employee namecard",
    );
  }
};

// ─── Company Template CRUD ───────────────────────────────────────────────────

const companyTemplateEndpoint = (
  role: "me" | "donator" | "operator",
  id?: string,
) => {
  const base =
    role === "operator"
      ? `${API_BASE_URL}/enterprise/operator/company-templates`
      : role === "donator"
        ? `${API_BASE_URL}/enterprise/donator/company-templates`
        : `${API_BASE_URL}/enterprise/me/company-templates`;
  return id ? `${base}/${id}` : base;
};

const chamberTemplateEndpoint = (
  role: "me" | "donator" | "operator",
  id?: string,
) => {
  const base =
    role === "operator"
      ? `${API_BASE_URL}/enterprise/operator/chamber-templates`
      : role === "donator"
        ? `${API_BASE_URL}/enterprise/donator/chamber-templates`
        : `${API_BASE_URL}/enterprise/me/chamber-templates`;
  return id ? `${base}/${id}` : base;
};

type TemplateRole = "me" | "donator" | "operator";

const authHeader = (role: TemplateRole) => ({
  Authorization: `Bearer ${role === "operator" ? getOperatorToken() : getToken()}`,
});

// List company templates
export const listCompanyTemplates = async (
  role: TemplateRole = "me",
): Promise<CompanyTemplate[]> => {
  const res = await axios.get<TemplateResponse<CompanyTemplate[]>>(
    companyTemplateEndpoint(role),
    { headers: authHeader(role) },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Get one company template
export const getCompanyTemplate = async (
  id: string,
  role: TemplateRole = "me",
): Promise<CompanyTemplate> => {
  const res = await axios.get<TemplateResponse<CompanyTemplate>>(
    companyTemplateEndpoint(role, id),
    { headers: authHeader(role) },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Create company template
export const createCompanyTemplate = async (
  data: CompanyTemplateFormData,
  image?: File,
  video?: File,
  role: TemplateRole = "me",
): Promise<CompanyTemplate> => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== "") form.append(k, String(v));
  });
  if (image) form.append("image", image);
  if (video) form.append("video", video);
  const res = await axios.post<TemplateResponse<CompanyTemplate>>(
    companyTemplateEndpoint(role),
    form,
    { headers: { ...authHeader(role), "Content-Type": "multipart/form-data" } },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Update company template
export const updateCompanyTemplate = async (
  id: string,
  data: Partial<CompanyTemplateFormData>,
  image?: File,
  video?: File,
  role: TemplateRole = "me",
): Promise<CompanyTemplate> => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== "") form.append(k, String(v));
  });
  if (image) form.append("image", image);
  if (video) form.append("video", video);
  const res = await axios.put<TemplateResponse<CompanyTemplate>>(
    companyTemplateEndpoint(role, id),
    form,
    { headers: { ...authHeader(role), "Content-Type": "multipart/form-data" } },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Delete company template
export const deleteCompanyTemplate = async (
  id: string,
  role: TemplateRole = "me",
): Promise<void> => {
  const res = await axios.delete<DeleteTemplateResponse>(
    companyTemplateEndpoint(role, id),
    { headers: authHeader(role) },
  );
  if (!res.data.success) throw new Error(res.data.message);
};

// ─── Chamber Template CRUD ────────────────────────────────────────────────────

// List chamber templates
export const listChamberTemplates = async (
  role: TemplateRole = "me",
): Promise<ChamberTemplate[]> => {
  const res = await axios.get<TemplateResponse<ChamberTemplate[]>>(
    chamberTemplateEndpoint(role),
    { headers: authHeader(role) },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Get one chamber template
export const getChamberTemplate = async (
  id: string,
  role: TemplateRole = "me",
): Promise<ChamberTemplate> => {
  const res = await axios.get<TemplateResponse<ChamberTemplate>>(
    chamberTemplateEndpoint(role, id),
    { headers: authHeader(role) },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Create chamber template
export const createChamberTemplate = async (
  data: ChamberTemplateFormData,
  image?: File,
  video?: File,
  role: TemplateRole = "me",
): Promise<ChamberTemplate> => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== "") form.append(k, String(v));
  });
  if (image) form.append("image", image);
  if (video) form.append("video", video);
  const res = await axios.post<TemplateResponse<ChamberTemplate>>(
    chamberTemplateEndpoint(role),
    form,
    { headers: { ...authHeader(role), "Content-Type": "multipart/form-data" } },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Update chamber template
export const updateChamberTemplate = async (
  id: string,
  data: Partial<ChamberTemplateFormData>,
  image?: File,
  video?: File,
  role: TemplateRole = "me",
): Promise<ChamberTemplate> => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== "") form.append(k, String(v));
  });
  if (image) form.append("image", image);
  if (video) form.append("video", video);
  const res = await axios.put<TemplateResponse<ChamberTemplate>>(
    chamberTemplateEndpoint(role, id),
    form,
    { headers: { ...authHeader(role), "Content-Type": "multipart/form-data" } },
  );
  if (res.data.success) return res.data.data;
  throw new Error(res.data.message);
};

// Delete chamber template
export const deleteChamberTemplate = async (
  id: string,
  role: TemplateRole = "me",
): Promise<void> => {
  const res = await axios.delete<DeleteTemplateResponse>(
    chamberTemplateEndpoint(role, id),
    { headers: authHeader(role) },
  );
  if (!res.data.success) throw new Error(res.data.message);
};
