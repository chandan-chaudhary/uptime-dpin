// API response types
export interface PendingPayoutResponse {
  validatorId: string;
  publicKey: string;
  pendingPayout: {
    gwei: number;
    eth: number;
  };
  createdAt: string;
}

export interface PayoutHistoryResponse {
  validatorId: string;
  publicKey: string;
  payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    requestedAt: string;
    processedAt: string;
    txHash: string | null;
  }>;
  summary: {
    totalPayouts: number;
    completedPayouts: number;
    totalPaidEth: number;
  };
}

export interface PayoutRequestResponse {
  success: boolean;
  payout: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    requestedAt: string;
    processedAt: string;
    txHash: string | null;
  };
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

// Location service types
export interface LocationInfo {
  ip: string;
  location: string;
}

export interface IpApiResponse {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
}

export interface IpApiFallbackResponse {
  query?: string;
  city?: string;
  regionName?: string;
  country?: string;
  countryCode?: string;
  status?: string;
}
