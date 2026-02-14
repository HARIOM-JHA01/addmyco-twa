// Enterprise Module Types

export interface EnterprisePackage {
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

// Enterprise purchase with full details
export interface EnterprisePurchase {
  _id: string;
  packageName: string;
  amount: number;
  currency: string;
  transactionId: string;
  walletAddress: string;
  creditsGrantedEmployee: number;
  creditsGrantedOperator: number;
  status: number; // 0: pending, 1: approved, 2: rejected
  statusLabel: string;
  createdAt: string;
  approvedAt?: string;
}

// Purchase list response
export interface EnterprisePurchasesResponse {
  data: EnterprisePurchase[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
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
  walletAddress?: string;
}

export interface BuyPackageResponse {
  purchaseId: string;
  status: number;
  amount: number;
}

// Create operator
export interface CreateOperatorPayload {
  tgid: string;
  password: string;
}

export interface CreateOperatorResponse {
  _id: string;
  name: string;
  email: string;
  credits: number;
  operatorSlots: number;
  isActive: boolean;
  createdAt: string;
}

// Buy package for a specific operator
export interface BuyPackageForOperatorPayload {
  packageId: string;
  operatorId: string;
  transactionId: string;
  walletAddress?: string;
}

export interface BuyPackageForOperatorResponse {
  purchaseId: string;
  operatorId: string;
  status: number;
  amount: number;
}

// Search response for operators/employees
export interface SearchResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Enterprise summary aggregated response
export interface EnterpriseSummary {
  profile: {
    _id: string;
    username: string;
    tgid: string;
    email: string;
    owner_name_english?: string;
    owner_name_chinese?: string;
    memberid: string;
    membertype: string;
    country: string;
    countryCode: string;
    profilestatus: number;
    companystatus: number;
    enddate: string;
    startdate: string;
    paymentstatus: number;
    createdAt: string;
    [key: string]: any; // Allow additional fields
  };
  operators: SubOperator[];
  purchases: Purchase[];
  purchasesSummary: {
    total: number;
    approved: number;
    totalCreditsOperator: number;
    totalCreditsEmployee: number;
    usedCreditsOperator: number;
    usedCreditsEmployee: number;
    leftCreditsOperator: number;
    leftCreditsEmployee: number;
  };
  employeesSummary: {
    totalEmployeesCreated: number;
    recentUsers: any[];
  };
}

export type EnterpriseTabType =
  | "dashboard"
  | "buy-credits"
  | "create-operator"
  | "my-operators"
  | "purchase-history";
