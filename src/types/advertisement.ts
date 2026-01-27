export interface Package {
  _id: string;
  name: string;
  description: string;
  displayCredits: number;
  priceUSDT: number;
  originalPriceUSDT?: number | null;
  positions: string[];
  duration: number | null;
  isActive: boolean;
}

export interface Advertisement {
  _id: string;
  title?: string;
  description?: string;
  position: string;
  country: string;
  imageUrl: string;
  targetUrl?: string;
  redirectUrl: string;
  displayCount: number;
  displayUsed: number;
  displayRemaining: number;
  status: string;
  approvalStatus?: string;
  viewCount: number;
  clickCount: number;
  ctrPercentage: number;
  impressions?: number;
  clicks?: number;
  credits?: number;
  createdAt: string;
}

export interface CreditBalance {
  _id?: string;
  userId?: string;
  totalCredits: number;
  usedCredits: number;
  balanceCredits: number;
  availableCredits?: number;
}

export interface PaymentHistory {
  _id: string;
  user: string;
  package: {
    _id: string;
    name: string;
    displayCredits: number;
    priceUSDT: number;
  };
  transactionId: string;
  walletAddress: string;
  amount: number;
  credits: number;
  status: number;
  approvalNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CountryOption {
  code: string;
  name: string;
  key: string;
}

export type TabType =
  | "dashboard"
  | "buy-credits"
  | "create-ad"
  | "my-ads"
  | "payment-history";

export interface AdForm {
  position: string;
  countries: string[];
  credits: number;
  redirectUrl: string;
  image: File | null;
}
