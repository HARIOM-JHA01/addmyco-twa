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
} from "../types/donator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Specific error for operator auth pre-flight failures so callers can react differently
export class OperatorAuthError extends Error {
  constructor(message = "Operator not authenticated") {
    super(message);
    this.name = "OperatorAuthError";
  }
}

// Helper to get auth headers with operator JWT token
const getOperatorAuthHeaders = () => {
  const token = localStorage.getItem("operatorToken");
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

// Buy a package
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
export const getOperators = async (): Promise<{
  data: SubOperator[];
  total: number;
}> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/donator/operator/operators`,
      {
        headers: getOperatorAuthHeaders(),
      },
    );
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to fetch operators:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch operators",
    );
  }
};

// Get employees/users list
export const getUsers = async (): Promise<OperatorUsers> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donator/operator/users`, {
      headers: getOperatorAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    if (error instanceof OperatorAuthError) throw error;
    console.error("Failed to fetch users:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to fetch employees",
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
      localStorage.setItem("operatorToken", data.token);
    }

    return data;
  } catch (error: any) {
    console.error("Operator login failed:", error);
    throw new Error(error?.response?.data?.message || "Login failed");
  }
};

// Operator logout
export const operatorLogout = () => {
  localStorage.removeItem("operatorToken");
};
