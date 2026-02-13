import axios from "axios";
import {
  DonatorPackage,
  OperatorProfile,
  OperatorCredits,
  SubOperator,
  OperatorUsers,
  CreateEmployeePayload,
  CreateEmployeeResponse,
  BuyPackagePayload,
  BuyPackageResponse,
  CreateOperatorPayload,
  CreateOperatorResponse,
  BuyPackageForOperatorPayload,
  BuyPackageForOperatorResponse,
  SearchResponse,
  DonatorSummary,
  DonatorPurchasesResponse,
} from "../types/donator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Assign credits to operator
export const assignCreditsToOperator = async (
  operatorId: string,
  employeeCreditsToAssign: number,
): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/donator/assign-credits`,
      {
        operatorId,
        employeeCreditsToAssign,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to assign credits:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to assign credits",
    );
  }
};

// Specific error for operator auth pre-flight failures so callers can react differently
export class OperatorAuthError extends Error {
  constructor(message = "Operator not authenticated") {
    super(message);
    this.name = "OperatorAuthError";
  }
}

// Helper to get auth headers with operator JWT token
const getOperatorAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new OperatorAuthError();
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Get operator profile
export const getOperatorProfile = async (): Promise<OperatorProfile> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/donator/operator/profile`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to fetch operator profile:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch operator profile",
    );
  }
};

// Get operator credits and slots
export const getOperatorCredits = async (): Promise<OperatorCredits> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/donator/operator/credits`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to fetch operator credits:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch operator credits",
    );
  }
};

// Get all active packages (public endpoint)
export const getPackages = async (): Promise<DonatorPackage[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donator/packages`);
    return response.data.data || [];
  } catch (error: any) {
    console.error("Failed to fetch packages:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch packages",
    );
  }
};

// Get donator summary (aggregated: profile, operators, employees, purchases, credits)
export const getDonatorSummary = async (): Promise<DonatorSummary> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donator/me/summary`, {
      headers: getOperatorAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to fetch donator summary:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch donator summary",
    );
  }
};

// Buy a package (for donators)
export const buyPackage = async (
  payload: BuyPackagePayload,
): Promise<BuyPackageResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/donator/buy`, payload, {
      headers: getOperatorAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to buy package:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to purchase package",
    );
  }
};

// Donator purchase package
// POST /donator/purchase
export const donatorBuyPackage = async (
  payload: BuyPackagePayload,
): Promise<BuyPackageResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/donator/purchase`,
      payload,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to purchase package:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to purchase package",
    );
  }
};

// Get donator purchases
// GET /donator/purchases?page=<page>&limit=<limit>&status=<status>
export const getDonatorPurchases = async (
  page: number = 1,
  limit: number = 20,
  status?: number,
): Promise<DonatorPurchasesResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status !== undefined) {
      params.append("status", status.toString());
    }

    const response = await axios.get(
      `${API_BASE_URL}/donator/purchases?${params.toString()}`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to fetch donator purchases:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch purchases",
    );
  }
};

// Create employee account
export const createEmployee = async (
  payload: CreateEmployeePayload,
): Promise<CreateEmployeeResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/donator/operator/create-employee`,
      payload,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to create employee:", error);
    const message = error?.response?.data?.message;

    // Handle specific error cases
    if (error?.response?.status === 409) {
      throw new Error("Insufficient credits to create employee");
    }
    if (error?.response?.status === 422) {
      throw new Error(message || "Validation error");
    }

    throw new Error(message || "Failed to create employee account");
  }
};

// Get sub-operators list
// Tries the newer `/donator/me/operators` path first and falls back to the
// owner-friendly alias `/donator/operators` for backwards compatibility.
export const getOperators = async (): Promise<{
  data: SubOperator[];
  total: number;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donator/operators`, {
      headers: getOperatorAuthHeaders(),
    });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error: any) {
    // If missing token, bubble up immediately so callers can handle auth separately
    if (error instanceof OperatorAuthError) throw error;

    console.error("Failed to fetch operators:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch operators",
    );
  }
};

// Get employees/users list
// Primary: /donator/me/employees. If the server doesn't expose that path, try
// the shorter `/donator/employees` as a fallback for compatibility.
export const getUsers = async (): Promise<OperatorUsers> => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_BASE_URL}/donator/me/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;

    const status = error?.response?.status;
    if (status === 404 || status === 405) {
      try {
        const aliasRes = await axios.get(`${API_BASE_URL}/donator/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return aliasRes.data.data;
      } catch (aliasErr: any) {
        console.error("Alias /donator/employees also failed:", aliasErr);
        throw new Error(
          aliasErr?.response?.data?.message ||
            "Failed to fetch employees (alias)",
        );
      }
    }

    console.error("Failed to fetch users:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch employees",
    );
  }
};

/**
 * Admin-only: fetch operators + employees across donator module.
 * Uses the JWT stored in localStorage under `token`.
 * This mirrors the curl the app maintainer provided:
 *   GET /admin/donator/operators-employees
 */
export const getOperatorsEmployeesAdmin = async (
  tokenFromStorage?: string,
): Promise<any> => {
  const token = tokenFromStorage || localStorage.getItem("token");
  if (!token) {
    throw new Error("Admin token not found in localStorage");
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/donator/operators-employees`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data?.data;
  } catch (err: any) {
    console.error(
      "Failed to fetch admin operators-employees:",
      err?.response || err?.message || err,
    );
    throw new Error(
      err?.response?.data?.message ||
        "Failed to fetch admin operators-employees",
    );
  }
};

// Operator login (for future use if needed)
export const operatorLogin = async (
  email: string,
  password: string,
): Promise<OperatorProfile & { token: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/donator/operator/login`,
      {
        email,
        password,
      },
    );
    const data = response.data.data;

    // Store token for future requests
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error: any) {
    console.error("Operator login failed:", error);
    throw new Error(error?.response?.data?.message || "Login failed");
  }
};

// Operator logout
export const operatorLogout = () => {
  localStorage.removeItem("token");
};

/**
 * Create a new sub-operator under the current donator
 * POST /donator/me/operators
 */
export const createOperator = async (
  payload: CreateOperatorPayload,
): Promise<CreateOperatorResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/donator/operators`,
      payload,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to create operator:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to create operator",
    );
  }
};

/**
 * Search/list sub-operators under the current donator
 * GET /donator/me/operators?q=<query>&page=<page>&limit=<limit>
 */
export const searchOperators = async (
  query?: string,
  page: number = 1,
  limit: number = 50,
): Promise<SearchResponse<SubOperator>> => {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  try {
    const response = await axios.get(
      `${API_BASE_URL}/donator/me/operators?${params.toString()}`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;

    const status = error?.response?.status;
    if (status === 404 || status === 405) {
      try {
        const aliasRes = await axios.get(
          `${API_BASE_URL}/donator/operators?${params.toString()}`,
          { headers: getOperatorAuthHeaders() },
        );
        return aliasRes.data.data;
      } catch (aliasErr: any) {
        console.error("Alias search /donator/operators failed:", aliasErr);
        throw new Error(
          aliasErr?.response?.data?.message ||
            "Failed to search operators (alias)",
        );
      }
    }

    console.error("Failed to search operators:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to search operators",
    );
  }
};

/**
 * Buy a package for a specific operator
 * POST /donator/me/buy
 */
export const buyPackageForOperator = async (
  payload: BuyPackageForOperatorPayload,
): Promise<BuyPackageForOperatorResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/donator/me/buy`,
      payload,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to buy package for operator:", error);
    throw new Error(
      error?.response?.data?.message ||
        "Failed to purchase package for operator",
    );
  }
};

/**
 * Search/list employees under the current donator
 * GET /donator/me/employees?q=<query>&page=<page>&limit=<limit>
 */
export const searchEmployees = async (
  query?: string,
  page: number = 1,
  limit: number = 50,
): Promise<SearchResponse<any>> => {
  try {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await axios.get(
      `${API_BASE_URL}/donator/me/employees?${params.toString()}`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to search employees:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to search employees",
    );
  }
};

/**
 * Get operator details with employees
 * GET /donator/me/operators/:operatorId
 */
export const getOperatorDetails = async (operatorId: string): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/donator/me/operators/${operatorId}`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to get operator details:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to get operator details",
    );
  }
};

/**
 * Delete operator
 * DELETE /donator/me/operators/:operatorId
 */
export const deleteOperator = async (operatorId: string): Promise<any> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/donator/me/operators/${operatorId}`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to delete operator:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to delete operator",
    );
  }
};
