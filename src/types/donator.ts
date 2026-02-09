// Donator Module Types

export interface DonatorPackage {
  _id: string;
  name: string;
  description?: string;
  employeeCredits: number;
  operatorCredits: number;
  price: number;
  currency?: string;
  status: number; // 1: active, 0: inactive
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorProfile {
  _id: string;
  name: string;
  email: string;
  credits: number;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorCredits {
  credits: number;
  operatorSlots: number;
}

export interface SubOperator {
  _id: string;
  name: string;
  email: string;
  credits: number;
  operatorSlots: number;
  isActive: boolean;
  createdAt: string;
}

export interface Purchase {
  _id: string;
  packageName: string;
  creditsGranted: number;
  amount?: number;
  status?: number; // 0: pending, 1: approved, 2: rejected
  transactionId?: string;
  createdAt: string;
}

export interface OperatorUsers {
  creditsUsed: number;
  potentialUsers: number;
  purchases: Purchase[];
}

export interface CreateEmployeePayload {
  employeeTgid: string;
  employeeEmail?: string;
  employeeName: string;
}

export interface CreateEmployeeResponse {
  userId: string;
  username: string;
  freeUsername: string;
  tgid: string;
  email: string;
  membershipEnd: string;
  token: string;
}

export interface BuyPackagePayload {
  packageId: string;
  transactionId: string;
}

export interface BuyPackageResponse {
  purchaseId: string;
  status: number;
  amount: number;
}

export type DonatorTabType =
  | "dashboard"
  | "buy-credits"
  | "create-employee"
  | "my-employees"
  | "purchase-history";
